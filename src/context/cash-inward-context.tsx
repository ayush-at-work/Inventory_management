
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';
import { useInventory } from './inventory-context';

export type CashInward = {
    id: string;
    invoiceNumber: string;
    date: string;
    supplier: string;
    totalValue: number;
    materialType: string;
    weight: string;
    hsnCode: string;
};

interface CashInwardContextType {
  inwardGoods: CashInward[];
  addInward: (item: Omit<CashInward, 'id'>) => void;
  updateInward: (id: string, data: Omit<CashInward, 'id'>) => void;
  deleteInward: (id: string) => void;
}

const CashInwardContext = createContext<CashInwardContextType | undefined>(undefined);

const STORAGE_KEY = 'cashInward_v1';

export const CashInwardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inwardGoods, setInwardGoods] = useState<CashInward[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance } = useCashBalance();
  const { addInventoryItem, decreaseInventory } = useInventory();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setInwardGoods(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inwardGoods));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [inwardGoods, isMounted]);

  const addInward = (item: Omit<CashInward, 'id'>) => {
    const newItem = { ...item, id: String(Date.now()) };
    setInwardGoods(prev => [newItem, ...prev]);
    updateBalance(-item.totalValue);
    
    const [quantity, unit] = item.weight.split(' ');
    const quantityNum = Number(quantity);
    if(quantityNum > 0) {
        addInventoryItem({
            materialType: item.materialType,
            hsnCode: item.hsnCode,
            quantity: quantityNum,
            unit: unit,
            price: item.totalValue / quantityNum,
            transactionType: 'Cash'
        });
    }
  };

  const updateInward = (id: string, data: Omit<CashInward, 'id'>) => {
    setInwardGoods(prev => {
        const originalItem = prev.find(item => item.id === id);
        if (!originalItem) return prev;

        // Update balance: add back old value, subtract new value
        const balanceChange = originalItem.totalValue - data.totalValue;
        updateBalance(balanceChange);

        // TODO: Update inventory is complex. 
        // A simple approach is to reverse the old and apply the new.
        // For now, we'll just update the entry. A more robust solution is needed for production.

        return prev.map(item => (item.id === id ? { ...data, id } : item));
    });
  };

  const deleteInward = (id: string) => {
    const itemToDelete = inwardGoods.find(item => item.id === id);
    if (!itemToDelete) return;

    updateBalance(itemToDelete.totalValue); // Refund the amount to cash balance

    const [quantity, unit] = itemToDelete.weight.split(' ');
    const quantityNum = Number(quantity);
    if(quantityNum > 0) {
        decreaseInventory(itemToDelete.materialType, quantityNum, 'Cash');
    }

    setInwardGoods(prev => prev.filter(item => item.id !== id));
  };
  

  if (!isMounted) {
      return null;
  }

  return (
    <CashInwardContext.Provider value={{ inwardGoods, addInward, updateInward, deleteInward }}>
      {children}
    </CashInwardContext.Provider>
  );
};

export const useCashInward = () => {
  const context = useContext(CashInwardContext);
  if (context === undefined) {
    throw new Error('useCashInward must be used within a CashInwardProvider');
  }
  return context;
};

    