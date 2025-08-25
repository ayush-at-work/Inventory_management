
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExpenses } from './expenses-context';

export type Staff = {
    id: string;
    name: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';

export type AttendanceRecord = {
    id: string;
    staffId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    wages: number;
};

interface StaffContextType {
  staff: Staff[];
  attendanceRecords: AttendanceRecord[];
  addStaff: (name: string) => void;
  updateStaff: (id: string, name: string) => void;
  deleteStaff: (id: string) => void;
  getAttendanceForStaff: (staffId: string) => AttendanceRecord[];
  markAttendance: (staffId: string, date: string, status: AttendanceStatus, wages: number) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const STAFF_STORAGE_KEY = 'staff_v3';
const ATTENDANCE_STORAGE_KEY = 'staffAttendanceRecords_v3';

const initialStaff: Staff[] = [];
const initialAttendance: AttendanceRecord[] = [];

export const LabourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [isMounted, setIsMounted] = useState(false);
  const { addExpense } = useExpenses();

  useEffect(() => {
    try {
        const savedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
        if (savedStaff) setStaff(JSON.parse(savedStaff));
        else localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(initialStaff));

        const savedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
        else localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initialAttendance));
    } catch (error) {
        console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceRecords));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [staff, attendanceRecords, isMounted]);

  const addStaff = (name: string) => {
    const newStaffer: Staff = { id: String(Date.now()), name };
    setStaff(prev => [...prev, newStaffer]);
  };

  const updateStaff = (id: string, name: string) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, name } : s)));
  };

  const deleteStaff = (id: string) => {
    // This needs to be more complex if we want to reverse expenses, which is tricky.
    // For now, we just delete the staff member and their records.
    setStaff(prev => prev.filter(s => s.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.staffId !== id));
  };
  
  const getAttendanceForStaff = (staffId: string) => {
    return attendanceRecords.filter(record => record.staffId === staffId);
  }

  const markAttendance = (staffId: string, date: string, status: AttendanceStatus, wages: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;
    
    setAttendanceRecords(prev => {
        const existingRecordIndex = prev.findIndex(r => r.staffId === staffId && r.date === date);

        if (existingRecordIndex > -1) {
            // Updating an existing record is complex with expenses.
            // A simple approach is to not allow edits that affect finance,
            // or delete the old expense and create a new one.
            // For now, we prevent changing the financial aspect.
             alert("To change wage details, please delete the old attendance record and create a new one from the expenses page.");
             const updatedRecords = [...prev];
             updatedRecords[existingRecordIndex] = { ...updatedRecords[existingRecordIndex], status };
             return updatedRecords;
        } else {
            if (wages > 0) {
                 addExpense({
                    date,
                    category: 'Staff Wages',
                    description: `Wages for ${staffMember.name} on ${date}`,
                    amount: wages,
                });
            }
            const newRecord: AttendanceRecord = {
                id: String(Date.now()),
                staffId,
                date,
                status,
                wages,
            };
            return [...prev, newRecord];
        }
    });
  }

  if (!isMounted) {
      return null;
  }
  
  const value = {
      staff,
      attendanceRecords,
      addStaff,
      updateStaff,
      deleteStaff,
      getAttendanceForStaff,
      markAttendance
  }

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
};

export const useLabour = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useLabour must be used within a LabourProvider');
  }
  return context;
};
