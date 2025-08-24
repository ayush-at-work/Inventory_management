
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';

export type LedgerEntry = {
    id: string;
    date: string;
    personName: string;
    type: 'given' | 'taken';
    amount: number;
    description: string;
    status: 'open' | 'settled';
};

interface LedgerContextType {
  entries: LedgerEntry[];
  addEntry: (entry: Omit<LedgerEntry, 'id' | 'status'>) => void;
  settleEntry: (id: string) => void;
  deleteEntry: (id: string) => void;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

const LEDGER_STORAGE_KEY = 'cashLedgerEntries';
const initialEntries: LedgerEntry[] = [];

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance } = useCashBalance();

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      } else {
        localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(initialEntries));
      }
    } catch (error) {
      console.error("Failed to read ledger from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        console.error("Failed to write ledger to localStorage", error);
      }
    }
  }, [entries, isMounted]);

  const addEntry = (entry: Omit<LedgerEntry, 'id' | 'status'>) => {
    const newEntry: LedgerEntry = { ...entry, id: String(Date.now()), status: 'open' };
    setEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // If loan is given, cash balance decreases. If taken, it increases.
    const balanceChange = entry.type === 'given' ? -entry.amount : entry.amount;
    updateBalance(balanceChange);
  };

  const settleEntry = (id: string) => {
    const entryToSettle = entries.find(e => e.id === id);
    if (!entryToSettle || entryToSettle.status === 'settled') return;

    setEntries(prev => prev.map(e => (e.id === id ? { ...e, status: 'settled' } : e)));
    
    // When a loan is settled, the cash comes back. If we had taken a loan, we pay it back.
    const balanceChange = entryToSettle.type === 'given' ? entryToSettle.amount : -entryToSettle.amount;
    updateBalance(balanceChange);
  };

  const deleteEntry = (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (!entryToDelete) return;

    // Reverse the initial cash transaction if the entry was still open
    if (entryToDelete.status === 'open') {
        const balanceChange = entryToDelete.type === 'given' ? entryToDelete.amount : -entryToDelete.amount;
        updateBalance(balanceChange);
    }

    setEntries(prev => prev.filter(e => e.id !== id));
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <LedgerContext.Provider value={{ entries, addEntry, settleEntry, deleteEntry }}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
