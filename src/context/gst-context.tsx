
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
        localStorage.setItem(INWARD_GOODS_STORAGE_KEY, JSON.stringify(inwardGoods));
        localStorage.setItem(OUTWARD_GOODS_STORAGE_KEY, JSON.stringify(outwardGoods));
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

  const contextValue = {
    inwardGoods,
    outwardGoods,
    addInwardGood,
    addOutwardGood,
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
