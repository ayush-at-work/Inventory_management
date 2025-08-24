
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addOutwardGood: (item: Omit<GstOutward, 'id'>) => void;
  deleteOutwardGood: (id: string) => { taxAmount: number, totalValue: number, status: 'Paid' | 'Unpaid', materialType: string, weight: number } | null;
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
  };

  const addOutwardGood = (item: Omit<GstOutward, 'id'>) => {
    const newItem = { ...item, id: String(Date.now()) };
    setOutwardGoods(prev => [newItem, ...prev]);
  };
  
  const deleteOutwardGood = (id: string) => {
    let deletedItem: GstOutward | undefined;
    setOutwardGoods(prev => {
        deletedItem = prev.find(item => item.id === id);
        return prev.filter(item => item.id !== id)
    });

    if (deletedItem) {
        const taxAmount = (deletedItem.taxableAmount * (deletedItem.cgst + deletedItem.sgst + deletedItem.igst)) / 100;
        const totalValue = deletedItem.taxableAmount + taxAmount;
        return { 
            taxAmount, 
            totalValue, 
            status: deletedItem.paymentStatus,
            materialType: deletedItem.materialType,
            weight: deletedItem.weight 
        };
    }
    return null;
  }

  const contextValue = {
    inwardGoods,
    outwardGoods,
    addInwardGood,
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
