
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BankBalanceContextType {
  balance: number;
  setBalance: (newBalance: number) => void;
  updateBalance: (amount: number) => void;
}

const BankBalanceContext = createContext<BankBalanceContextType | undefined>(undefined);

const BANK_BALANCE_STORAGE_KEY = 'bankBalance';
const INITIAL_BALANCE = 0;

export const BankBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalanceState] = useState<number>(INITIAL_BALANCE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
        const savedBalance = localStorage.getItem(BANK_BALANCE_STORAGE_KEY);
        if (savedBalance !== null) {
            setBalanceState(parseFloat(savedBalance));
        } else {
            setBalanceState(INITIAL_BALANCE);
            localStorage.setItem(BANK_BALANCE_STORAGE_KEY, String(INITIAL_BALANCE));
        }
    } catch (error) {
        console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(BANK_BALANCE_STORAGE_KEY, String(balance));
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
    <BankBalanceContext.Provider value={{ balance, setBalance, updateBalance }}>
      {children}
    </BankBalanceContext.Provider>
  );
};

export const useBankBalance = () => {
  const context = useContext(BankBalanceContext);
  if (context === undefined) {
    throw new Error('useBankBalance must be used within a BankBalanceProvider');
  }
  return context;
};
