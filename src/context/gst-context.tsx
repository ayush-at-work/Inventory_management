
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
const initialOutwardGoods: GstOutward[] = [
    {
        id: '1',
        invoiceNumber: 'SALE-001',
        date: '2024-05-10',
        customer: 'Reliable Metals Co.',
        gstNumber: '22AAAAA0000A1Z5',
        placeOfSupply: 'Maharashtra',
        materialType: 'Copper Wire',
        hsnCode: '7408',
        weight: 150,
        taxableAmount: 105000,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Paid'
    },
    {
        id: '2',
        invoiceNumber: 'SALE-002',
        date: '2024-05-25',
        customer: 'Green Scrap Traders',
        gstNumber: '29BBBBB0000B1Z5',
        placeOfSupply: 'Karnataka',
        materialType: 'Aluminum Scrap',
        hsnCode: '7602',
        weight: 500,
        taxableAmount: 75000,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Paid'
    },
    {
        id: '3',
        invoiceNumber: 'SALE-003',
        date: '2024-06-12',
        customer: 'Reliable Metals Co.',
        gstNumber: '22AAAAA0000A1Z5',
        placeOfSupply: 'Maharashtra',
        materialType: 'Copper Wire',
        hsnCode: '7408',
        weight: 200,
        taxableAmount: 144000,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Paid'
    },
    {
        id: '4',
        invoiceNumber: 'SALE-004',
        date: '2024-06-28',
        customer: 'Eco Recyclers',
        gstNumber: '27CCCCC0000C1Z5',
        placeOfSupply: 'Maharashtra',
        materialType: 'Steel Scrap',
        hsnCode: '7204',
        weight: 1200,
        taxableAmount: 48000,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Unpaid'
    },
    {
        id: '5',
        invoiceNumber: 'SALE-005',
        date: '2024-07-05',
        customer: 'Green Scrap Traders',
        gstNumber: '29BBBBB0000B1Z5',
        placeOfSupply: 'Karnataka',
        materialType: 'Aluminum Scrap',
        hsnCode: '7602',
        weight: 450,
        taxableAmount: 69750,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Paid'
    },
     {
        id: '6',
        invoiceNumber: 'SALE-006',
        date: '2024-07-15',
        customer: 'Reliable Metals Co.',
        gstNumber: '22AAAAA0000A1Z5',
        placeOfSupply: 'Maharashtra',
        materialType: 'Copper Wire',
        hsnCode: '7408',
        weight: 250,
        taxableAmount: 187500,
        taxType: 'Inter-state',
        cgst: 9,
        sgst: 9,
        igst: 0,
        paymentStatus: 'Paid'
    }
];


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
        }
        if (outwardGoods.length > 0) {
            localStorage.setItem(OUTWARD_GOODS_STORAGE_KEY, JSON.stringify(outwardGoods));
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
