
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type InventoryItem = {
    id: string;
    materialType: string;
    quantity: number;
    unit: string;
    price: number; // This will now be the average price
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

const INVENTORY_STORAGE_KEY = 'inventory_v6_final'; // Incremented version to avoid old data conflicts

const initialInventoryData: InventoryItem[] = [];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
        const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (savedInventory) {
            setInventory(JSON.parse(savedInventory));
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
    // Prevent adding items without a material type
    if (!item.materialType || typeof item.materialType !== 'string' || item.materialType.trim() === '') {
        console.error("Attempted to add inventory item with invalid materialType:", item);
        return;
    }
    // Prevent adding items with non-positive quantity
    if (item.quantity <= 0) {
        console.error("Attempted to add inventory item with zero or negative quantity:", item);
        return;
    }
      
    setInventory(prevInventory => {
        const updatedInventory = [...prevInventory];
        const existingItemIndex = updatedInventory.findIndex(
            invItem => 
                       invItem.materialType.toLowerCase() === item.materialType.toLowerCase() &&
                       invItem.transactionType === item.transactionType &&
                       invItem.unit === item.unit &&
                       (invItem.hsnCode || '') === (item.hsnCode || '')
        );

        if (existingItemIndex > -1) {
            // Update existing item using weighted average for price
            const existingItem = updatedInventory[existingItemIndex];
            
            const newQuantity = existingItem.quantity + item.quantity;
            const newValue = existingItem.value + (item.price * item.quantity);
            const newAveragePrice = newQuantity > 0 ? newValue / newQuantity : 0;
            
            updatedInventory[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                value: newValue,
                price: newAveragePrice, // Update to the new average price
            };
            return updatedInventory;
        } else {
            // Add as a new item
            const newItem: InventoryItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More robust unique ID
                ...item,
                value: item.price * item.quantity,
            };
            return [...updatedInventory, newItem];
        }
    });
  };

  const updateInventoryItem = (id: string, item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => prev.map(invItem => invItem.id === id ? { ...item, id } : invItem));
  }

  const decreaseInventory = (materialType: string, quantity: number, transactionType: 'GST' | 'Cash') => {
      setInventory(prevInventory => {
          const updatedInventory = [...prevInventory];
          // Find the most relevant inventory item to decrease from
          const itemIndex = updatedInventory.findIndex(
              item => item.materialType.toLowerCase() === materialType.toLowerCase() && item.transactionType === transactionType
          );

          if (itemIndex > -1) {
              const item = updatedInventory[itemIndex];
              const newQuantity = item.quantity - quantity;
              if (newQuantity < 0) {
                  console.warn(`Not enough inventory for ${materialType} (${transactionType}). Trying to sell ${quantity}, but only have ${item.quantity}`);
                  return prevInventory; // Don't change inventory
              }
              const newValue = item.price * newQuantity; // Value decreases based on the average price
              updatedInventory[itemIndex] = { ...item, quantity: newQuantity, value: newValue };
              // Filter out items with zero quantity
              return updatedInventory.filter(i => i.quantity > 0.001);
          } else {
              console.warn(`Inventory item not found for ${materialType} (${transactionType})`);
          }
          return prevInventory; // Return original if no item found
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
