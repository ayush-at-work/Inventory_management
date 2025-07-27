
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CashBalanceContextType {
  balance: number;
  setBalance: (newBalance: number) => void;
  updateBalance: (amount: number) => void;
}

const CashBalanceContext = createContext<CashBalanceContextType | undefined>(undefined);

const CASH_BALANCE_STORAGE_KEY = 'cashBalance';
const INITIAL_BALANCE = 0;

export const CashBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalanceState] = useState<number>(INITIAL_BALANCE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
        const savedBalance = localStorage.getItem(CASH_BALANCE_STORAGE_KEY);
        if (savedBalance !== null) {
            setBalanceState(parseFloat(savedBalance));
        } else {
            setBalanceState(INITIAL_BALANCE);
            localStorage.setItem(CASH_BALANCE_STORAGE_KEY, String(INITIAL_BALANCE));
        }
    } catch (error) {
        console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CASH_BALANCE_STORAGE_KEY, String(balance));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [balance, isMounted]);

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
  };

  const updateBalance = (amount: number) => {
    setBalanceState(prevBalance => prevBalance + amount);
  };

  if (!isMounted) {
      return null;
  }

  return (
    <CashBalanceContext.Provider value={{ balance, setBalance, updateBalance }}>
      {children}
    </CashBalanceContext.Provider>
  );
};

export const useCashBalance = () => {
  const context = useContext(CashBalanceContext);
  if (context === undefined) {
    throw new Error('useCashBalance must be used within a CashBalanceProvider');
  }
  return context;
};
