"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BankBalanceContextType {
  balance: number;
  setBalance: (newBalance: number) => void;
  updateBalance: (amount: number) => void;
}

const BankBalanceContext = createContext<BankBalanceContextType | undefined>(undefined);

const BANK_BALANCE_STORAGE_KEY = 'bankBalance';

export const BankBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalanceState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const savedBalance = localStorage.getItem(BANK_BALANCE_STORAGE_KEY);
        return savedBalance ? parseFloat(savedBalance) : 123456.78;
    }
    return 123456.78;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(BANK_BALANCE_STORAGE_KEY, String(balance));
    }
  }, [balance]);

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
  };

  const updateBalance = (amount: number) => {
    setBalanceState(prevBalance => prevBalance + amount);
  };

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
