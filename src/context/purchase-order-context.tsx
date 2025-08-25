
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PurchaseOrderItem = {
    id: string;
    materialType: string;
    quantity: number;
    unit: string;
    price: number;
};

export type PurchaseOrder = {
    id: string;
    poNumber: string;
    supplier: string;
    orderDate: string; // YYYY-MM-DD
    expectedDate?: string; // YYYY-MM-DD
    status: 'Pending' | 'Partially Received' | 'Received' | 'Cancelled';
    items: PurchaseOrderItem[];
    totalValue: number;
};

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'items' | 'totalValue'>, items: Omit<PurchaseOrderItem, 'id'>[]) => void;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) => void;
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

const PO_STORAGE_KEY = 'purchaseOrders_v2';
const initialPurchaseOrders: PurchaseOrder[] = [];

export const PurchaseOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const savedPOs = localStorage.getItem(PO_STORAGE_KEY);
      if (savedPOs) {
        setPurchaseOrders(JSON.parse(savedPOs));
      }
    } catch (error) {
      console.error("Failed to read POs from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(purchaseOrders));
      } catch (error) {
        console.error("Failed to write POs to localStorage", error);
      }
    }
  }, [purchaseOrders, isMounted]);

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id' | 'items' | 'totalValue'>, items: Omit<PurchaseOrderItem, 'id'>[]) => {
    const orderItems: PurchaseOrderItem[] = items.map(item => ({...item, id: String(Date.now()) + Math.random() }));
    const totalValue = orderItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    
    const newOrder: PurchaseOrder = {
      ...order,
      id: String(Date.now()),
      items: orderItems,
      totalValue,
    };
    setPurchaseOrders(prev => [newOrder, ...prev]);
  };

  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    // TODO: Add logic to update inventory when status is 'Received'
  };

  const value = { purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus };

  if (!isMounted) {
      return null;
  }

  return (
    <PurchaseOrderContext.Provider value={value}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

export const usePurchaseOrders = () => {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrderProvider');
  }
  return context;
};
