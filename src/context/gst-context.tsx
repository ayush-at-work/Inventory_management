
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBankBalance } from './bank-balance-context';
import { useInventory } from './inventory-context';

export type GstInward = {
  id: string;
  invoiceNumber: string;
  date: string;
  supplier: string;
  gstNumber: string;
  placeOfSupply: string;
  materialType: string;
  hsnCode: string;
  weight: number;
  taxableAmount: number;
  taxType: 'inter-state' | 'intra-state';
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalInvoiceValue: number;
};

export type GstOutward = {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  gstNumber: string;
  placeOfSupply: string;
  materialType: string;
  hsnCode: string;
  weight: number;
  taxableAmount: number;
  taxType: 'Inter-state' | 'Intra-state';
  cgst: number;
  sgst: number;
  igst: number;
  paymentStatus: 'Paid' | 'Unpaid';
};


interface GstContextType {
  inwardGoods: GstInward[];
  outwardGoods: GstOutward[];
  addInwardGood: (item: Omit<GstInward, 'id'>) => void;
  deleteInwardGood: (id: string) => void;
  addOutwardGood: (item: Omit<GstOutward, 'id'>) => void;
  deleteOutwardGood: (id: string) => void;
}

const GstContext = createContext<GstContextType | undefined>(undefined);

const INWARD_GOODS_STORAGE_KEY = 'gstInwardGoods';
const OUTWARD_GOODS_STORAGE_KEY = 'gstOutwardGoods';

const initialInwardGoods: GstInward[] = [];
const initialOutwardGoods: GstOutward[] = [];


export const GstProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inwardGoods, setInwardGoods] = useState<GstInward[]>(initialInwardGoods);
  const [outwardGoods, setOutwardGoods] = useState<GstOutward[]>(initialOutwardGoods);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance: updateBankBalance } = useBankBalance();
  const { addInventoryItem, decreaseInventory } = useInventory();

  useEffect(() => {
    try {
      const savedInward = localStorage.getItem(INWARD_GOODS_STORAGE_KEY);
      if (savedInward) {
        setInwardGoods(JSON.parse(savedInward));
      }
      const savedOutward = localStorage.getItem(OUTWARD_GOODS_STORAGE_KEY);
      if (savedOutward) {
        setOutwardGoods(JSON.parse(savedOutward));
      }
    } catch (error) {
      console.error("Failed to read GST data from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        if(inwardGoods.length > 0) {
            localStorage.setItem(INWARD_GOODS_STORAGE_KEY, JSON.stringify(inwardGoods));
        } else {
             localStorage.removeItem(INWARD_GOODS_STORAGE_KEY);
        }
        if (outwardGoods.length > 0) {
            localStorage.setItem(OUTWARD_GOODS_STORAGE_KEY, JSON.stringify(outwardGoods));
        } else {
            localStorage.removeItem(OUTWARD_GOODS_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to write GST data to localStorage", error);
      }
    }
  }, [inwardGoods, outwardGoods, isMounted]);

  const addInwardGood = (item: Omit<GstInward, 'id'>) => {
    const newItem = { ...item, id: String(Date.now()) };
    setInwardGoods(prev => [newItem, ...prev]);

    // Update bank balance
    updateBankBalance(-newItem.totalInvoiceValue);

    // Add to inventory
    const pricePerUnit = item.weight > 0 ? item.taxableAmount / item.weight : 0;
    addInventoryItem({
        materialType: newItem.materialType,
        hsnCode: newItem.hsnCode,
        quantity: newItem.weight,
        unit: 'kg',
        price: pricePerUnit,
        transactionType: 'GST',
    });
  };

  const deleteInwardGood = (id: string) => {
    const itemToDelete = inwardGoods.find(item => item.id === id);
    if (!itemToDelete) return;

    // Add money back to bank balance
    updateBankBalance(itemToDelete.totalInvoiceValue);

    // Remove from inventory
    decreaseInventory(itemToDelete.materialType, itemToDelete.weight, 'GST');
    
    // Remove from state
    setInwardGoods(prev => prev.filter(item => item.id !== id));
  }

  const addOutwardGood = (item: Omit<GstOutward, 'id'>) => {
    const newItem = { ...item, id: String(Date.now()) };
    setOutwardGoods(prev => [newItem, ...prev]);
    
    const taxAmount = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
    const totalValue = item.taxableAmount + taxAmount;

    if (item.paymentStatus === 'Paid') {
        updateBankBalance(totalValue);
    }
    decreaseInventory(item.materialType, item.weight, 'GST');
  };
  
  const deleteOutwardGood = (id: string) => {
    const itemToDelete = outwardGoods.find(item => item.id === id);
    if (!itemToDelete) return;

    const taxAmount = (itemToDelete.taxableAmount * (itemToDelete.cgst + itemToDelete.sgst + itemToDelete.igst)) / 100;
    const totalValue = itemToDelete.taxableAmount + taxAmount;

    // If sale was paid, subtract from bank balance
    if (itemToDelete.paymentStatus === 'Paid') {
      updateBankBalance(-totalValue);
    }
    
    // Add the inventory back
    addInventoryItem({
        materialType: itemToDelete.materialType,
        hsnCode: itemToDelete.hsnCode,
        quantity: itemToDelete.weight,
        unit: 'kg',
        price: itemToDelete.weight > 0 ? itemToDelete.taxableAmount / itemToDelete.weight : 0,
        transactionType: 'GST',
    });

    setOutwardGoods(prev => prev.filter(item => item.id !== id));
  }

  const contextValue = {
    inwardGoods,
    outwardGoods,
    addInwardGood,
    deleteInwardGood,
    addOutwardGood,
    deleteOutwardGood,
  };
  
  if (!isMounted) {
      return null;
  }

  return (
    <GstContext.Provider value={contextValue}>
      {children}
    </GstContext.Provider>
  );
};

export const useGst = () => {
  const context = useContext(GstContext);
  if (context === undefined) {
    throw new Error('useGst must be used within a GstProvider');
  }
  return context;
};
