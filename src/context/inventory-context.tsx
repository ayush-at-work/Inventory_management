
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type InventoryItem = {
    id: string;
    materialType: string;
    quantity: number;
    unit: string;
    price: number;
    value: number;
    hsnCode: string;
    transactionType: 'GST' | 'Cash';
};

interface InventoryContextType {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'value'> & { value?: number }) => void;
  updateInventoryItem: (id: string, item: Omit<InventoryItem, 'id'>) => void;
  decreaseInventory: (materialType: string, quantity: number, transactionType: 'GST' | 'Cash') => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INVENTORY_STORAGE_KEY = 'inventory';

const initialInventoryData: InventoryItem[] = [
    {
        id: '1',
        materialType: 'Copper Wire',
        hsnCode: '7408',
        quantity: 2500,
        unit: 'kg',
        price: 700,
        value: 1750000,
        transactionType: 'GST'
    },
    {
        id: '2',
        materialType: 'Aluminum Scrap',
        hsnCode: '7602',
        quantity: 5000,
        unit: 'kg',
        price: 150,
        value: 750000,
        transactionType: 'GST'
    },
     {
        id: '3',
        materialType: 'Steel Scrap',
        hsnCode: '7204',
        quantity: 10000,
        unit: 'kg',
        price: 40,
        value: 400000,
        transactionType: 'GST'
    },
    {
        id: '4',
        materialType: 'Brass Scrap',
        hsnCode: '7404',
        quantity: 1500,
        unit: 'kg',
        price: 450,
        value: 675000,
        transactionType: 'Cash'
    }
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
        const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (savedInventory) {
            const parsed = JSON.parse(savedInventory);
            if (parsed.length > 0) {
              setInventory(parsed);
            }
        } else {
            setInventory(initialInventoryData);
            localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(initialInventoryData));
        }
    } catch (error) {
        console.error("Failed to read inventory from localStorage", error);
        setInventory(initialInventoryData);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
      } catch (error) {
        console.error("Failed to write inventory to localStorage", error);
      }
    }
  }, [inventory, isMounted]);

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'value'> & { value?: number }) => {
    setInventory(prevInventory => {
        const existingItemIndex = prevInventory.findIndex(
            invItem => invItem.materialType.toLowerCase() === item.materialType.toLowerCase() &&
                       invItem.transactionType === item.transactionType &&
                       invItem.unit === item.unit
        );

        if (existingItemIndex > -1) {
            // Update existing item
            const updatedInventory = [...prevInventory];
            const existingItem = updatedInventory[existingItemIndex];
            const newQuantity = existingItem.quantity + item.quantity;
            const newValue = existingItem.value + (item.price * item.quantity);
            const newPrice = newQuantity > 0 ? newValue / newQuantity : 0;

            updatedInventory[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                price: newPrice,
                value: newValue,
            };
            return updatedInventory;
        } else {
            // Add new item
            const newItem: InventoryItem = {
                id: String(Date.now()),
                ...item,
                value: item.price * item.quantity,
            };
            return [...prevInventory, newItem];
        }
    });
  };

  const updateInventoryItem = (id: string, item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => prev.map(invItem => invItem.id === id ? { ...item, id } : invItem));
  }

  const decreaseInventory = (materialType: string, quantity: number, transactionType: 'GST' | 'Cash') => {
      setInventory(prevInventory => {
          const updatedInventory = [...prevInventory];
          const itemIndex = updatedInventory.findIndex(
              item => item.materialType.toLowerCase() === materialType.toLowerCase() && item.transactionType === transactionType
          );

          if (itemIndex > -1) {
              const item = updatedInventory[itemIndex];
              const newQuantity = item.quantity - quantity;
              if (newQuantity < 0) {
                  console.warn(`Not enough inventory for ${materialType} (${transactionType}). Trying to sell ${quantity}, but only have ${item.quantity}`);
                  // Optionally, you could throw an error or handle it differently
                  return prevInventory; // Don't change inventory
              }
              const newValue = item.price * newQuantity;
              updatedInventory[itemIndex] = { ...item, quantity: newQuantity, value: newValue };
          } else {
              console.warn(`Inventory item not found for ${materialType} (${transactionType})`);
          }
          return updatedInventory;
      });
  }

  if (!isMounted) {
      return null;
  }

  return (
    <InventoryContext.Provider value={{ inventory, addInventoryItem, updateInventoryItem, decreaseInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within a InventoryProvider');
  }
  return context;
};
