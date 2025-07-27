
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'Admin' | 'Staff';

export type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'appUsers';
const CURRENT_USER_ID_KEY = 'appCurrentUserId';

const initialUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@scrapflow.com', role: 'Admin' },
    { id: '2', name: 'Staff User', email: 'staff@scrapflow.com', role: 'Staff' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const userList = savedUsers ? JSON.parse(savedUsers) : initialUsers;
      setUsers(userList);

      const savedUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
      const currentUser = savedUserId ? userList.find((u: User) => u.id === savedUserId) : userList[0];
      setUser(currentUser || userList[0]);
      
      if (!savedUsers) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
      if (!savedUserId && userList.length > 0) {
          localStorage.setItem(CURRENT_USER_ID_KEY, userList[0].id);
      }

    } catch (error) {
      console.error("Failed to read auth data from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        if (user) {
            localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
        } else {
            localStorage.removeItem(CURRENT_USER_ID_KEY);
        }
      } catch (error) {
        console.error("Failed to write auth data to localStorage", error);
      }
    }
  }, [users, user, isMounted]);

  const login = (userId: string) => {
    const userToLogin = users.find(u => u.id === userId);
    if (userToLogin) {
      setUser(userToLogin);
      router.push('/');
    }
  };

  const logout = () => {
    setUser(null);
    // In a real app, you'd redirect to a login page
    // For now, we'll just log in the first user by default.
    if (users.length > 0) {
        login(users[0].id)
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: String(Date.now()) };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Omit<User, 'id'>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...userData, id } : u)));
    // If the updated user is the current user, update the user state as well
    if (user?.id === id) {
        setUser({ ...userData, id });
    }
  };

  const deleteUser = (id: string) => {
    // Prevent deleting the currently logged-in user
    if (user?.id === id) {
        alert("You cannot delete the user you are currently logged in as.");
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };
  
  if (!isMounted) {
    return null; // Don't render anything until mounted and auth state is loaded
  }

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
