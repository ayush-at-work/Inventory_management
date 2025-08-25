
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';
import { useInventory } from './inventory-context';

export type CashSale = {
    id: string;
    invoiceNumber: string;
    date: string;
    customer: string;
    totalValue: number;
    materialType: string;
    weight: string;
    hsnCode: string;
    paymentStatus: 'Paid' | 'Unpaid';
};

interface CashOutwardContextType {
  outwardGoods: CashSale[];
  addOutward: (item: Omit<CashSale, 'id'>) => void;
  updateOutward: (id: string, data: Omit<CashSale, 'id'>) => void;
  deleteOutward: (id: string) => void;
}

const CashOutwardContext = createContext<CashOutwardContextType | undefined>(undefined);

const STORAGE_KEY = 'cashOutward_v1';

export const CashOutwardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outwardGoods, setOutwardGoods] = useState<CashSale[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance } = useCashBalance();
  const { decreaseInventory } = useInventory();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOutwardGoods(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(outwardGoods));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [outwardGoods, isMounted]);

  const addOutward = (item: Omit<CashSale, 'id'>) => {
    const newItem = { ...item, id: String(Date.now()) };
    setOutwardGoods(prev => [newItem, ...prev]);

    if (item.paymentStatus === 'Paid') {
        updateBalance(item.totalValue);
    }
    
    const [quantity, unit] = item.weight.split(' ');
    const quantityNum = Number(quantity);
    if(quantityNum > 0) {
        decreaseInventory(item.materialType, quantityNum, 'Cash');
    }
  };

  const updateOutward = (id: string, data: Omit<CashSale, 'id'>) => {
    setOutwardGoods(prev => {
        const originalItem = prev.find(item => item.id === id);
        if (!originalItem) return prev;

        const updatedItem = { ...data, id };
        
        let balanceChange = 0;
        // Was Paid, now Unpaid
        if(originalItem.paymentStatus === 'Paid' && data.paymentStatus === 'Unpaid') {
            balanceChange = -originalItem.totalValue;
        }
        // Was Unpaid, now Paid
        if(originalItem.paymentStatus === 'Unpaid' && data.paymentStatus === 'Paid') {
            balanceChange = data.totalValue;
        }
        // Was Paid, still Paid, value changed
        if(originalItem.paymentStatus === 'Paid' && data.paymentStatus === 'Paid') {
            balanceChange = data.totalValue - originalItem.totalValue;
        }
        if(balanceChange !== 0) {
            updateBalance(balanceChange);
        }

        // TODO: Inventory adjustment on edits is complex.
        // Needs to reverse old sale and apply new one.
        
        return prev.map(item => (item.id === id ? updatedItem : item));
    });
  };

  const deleteOutward = (id: string) => {
    const itemToDelete = outwardGoods.find(item => item.id === id);
    if (!itemToDelete) return;

    if (itemToDelete.paymentStatus === 'Paid') {
        updateBalance(-itemToDelete.totalValue);
    }

    // TODO: Add inventory back. This requires knowing the average cost at the time of sale.
    // For now, we don't add it back to avoid corrupting inventory average price.

    setOutwardGoods(prev => prev.filter(item => item.id !== id));
  };
  

  if (!isMounted) {
      return null;
  }

  return (
    <CashOutwardContext.Provider value={{ outwardGoods, addOutward, updateOutward, deleteOutward }}>
      {children}
    </CashOutwardContext.Provider>
  );
};

export const useCashOutward = () => {
  const context = useContext(CashOutwardContext);
  if (context === undefined) {
    throw new Error('useCashOutward must be used within a CashOutwardProvider');
  }
  return context;
};

    