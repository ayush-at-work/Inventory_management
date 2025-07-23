
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';

export type Expense = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

const EXPENSES_STORAGE_KEY = 'generalExpenses';
const initialExpenses: Expense[] = [];

export const ExpensesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance } = useCashBalance();

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      } else {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(initialExpenses));
      }
    } catch (error) {
      console.error("Failed to read expenses from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.error("Failed to write expenses to localStorage", error);
      }
    }
  }, [expenses, isMounted]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: String(Date.now()) };
    setExpenses(prev => [newExpense, ...prev]);
    updateBalance(-expense.amount);
  };

  const updateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    setExpenses(prev => {
      const oldExpense = prev.find(e => e.id === id);
      const balanceChange = oldExpense ? oldExpense.amount - expenseData.amount : 0;
      updateBalance(balanceChange);
      return prev.map(e => e.id === id ? { ...expenseData, id } : e);
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => {
      const expenseToDelete = prev.find(e => e.id === id);
      if (expenseToDelete) {
        updateBalance(expenseToDelete.amount);
      }
      return prev.filter(e => e.id !== id);
    });
  };

  if (!isMounted) {
    return (
      <ExpensesContext.Provider value={{ expenses: initialExpenses, addExpense, updateExpense, deleteExpense }}>
        {children}
      </ExpensesContext.Provider>
    );
  }

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};
