
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
    materialType: 'Copper',
    quantity: 5200,
    unit: 'kg',
    price: 7,
    value: 36400,
    hsnCode: '74040010',
    transactionType: 'GST'
  },
  {
    id: '2',
    materialType: 'Steel',
    quantity: 25000,
    unit: 'kg',
    price: 0.4,
    value: 10000,
    hsnCode: '72044900',
    transactionType: 'GST'
  },
  {
    id: '3',
    materialType: 'Aluminum',
    quantity: 8500,
    unit: 'kg',
    price: 1.5,
    value: 12750,
    hsnCode: '76020010',
    transactionType: 'GST'
  },
  {
    id: '4',
    materialType: 'Brass',
    quantity: 1500,
    unit: 'kg',
    price: 4,
    value: 6000,
    hsnCode: '74040022',
    transactionType: 'Cash'
  },
  {
    id: '5',
    materialType: 'Lead',
    quantity: 900,
    unit: 'kg',
    price: 2,
    value: 1800,
    hsnCode: '78020010',
    transactionType: 'GST'
  },
  {
    id: '6',
    materialType: 'Zinc',
    quantity: 3200,
    unit: 'kg',
    price: 2.5,
    value: 8000,
    hsnCode: '79020010',
    transactionType: 'Cash'
  },
  {
    id: '7',
    materialType: 'Used Batteries',
    quantity: 500,
    unit: 'NOS',
    price: 10,
    value: 5000,
    hsnCode: '85481020',
    transactionType: 'GST'
  },
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
        const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (savedInventory) {
            setInventory(JSON.parse(savedInventory));
        } else {
            setInventory(initialInventoryData);
        }
    } catch (error) {
        console.error("Failed to read inventory from localStorage", error);
        setInventory(initialInventoryData);
    }
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
            const newPrice = newValue / newQuantity;

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
      return (
        <InventoryContext.Provider value={{ inventory: initialInventoryData, addInventoryItem, updateInventoryItem, decreaseInventory }}>
            {children}
        </InventoryContext.Provider>
      )
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
