
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';
import { useExpenses } from './expenses-context';

export type Labourer = {
    id: string;
    name: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';

export type AttendanceRecord = {
    id: string;
    labourerId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    wages: number;
};

interface LabourContextType {
  labourers: Labourer[];
  attendanceRecords: AttendanceRecord[];
  addLabourer: (name: string) => void;
  updateLabourer: (id: string, name: string) => void;
  deleteLabourer: (id: string) => void;
  getAttendanceForLabourer: (labourerId: string) => AttendanceRecord[];
  markAttendance: (labourerId: string, date: string, status: AttendanceStatus, wages: number) => void;
}

const LabourContext = createContext<LabourContextType | undefined>(undefined);

const LABOURERS_STORAGE_KEY = 'labourers_v2';
const ATTENDANCE_STORAGE_KEY = 'labourerAttendanceRecords_v2';

const initialLabourers: Labourer[] = [];
const initialAttendance: AttendanceRecord[] = [];

export const LabourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labourers, setLabourers] = useState<Labourer[]>(initialLabourers);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [isMounted, setIsMounted] = useState(false);
  const { addExpense } = useExpenses();
  const { labourers: staff, addLabourer: addStaff, updateLabourer: updateStaff, deleteLabourer: deleteStaff, attendanceRecords: staffAttendance, markAttendance: markStaffAttendance } = useLabour();


  useEffect(() => {
    try {
        const savedLabourers = localStorage.getItem(LABOURERS_STORAGE_KEY);
        if (savedLabourers) setLabourers(JSON.parse(savedLabourers));
        else localStorage.setItem(LABOURERS_STORAGE_KEY, JSON.stringify(initialLabourers));

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
        localStorage.setItem(LABOURERS_STORAGE_KEY, JSON.stringify(labourers));
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceRecords));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [labourers, attendanceRecords, isMounted]);

  const addLabourer = (name: string) => {
    const newLabourer: Labourer = { id: String(Date.now()), name };
    setLabourers(prev => [...prev, newLabourer]);
  };

  const updateLabourer = (id: string, name: string) => {
    setLabourers(prev => prev.map(l => (l.id === id ? { ...l, name } : l)));
  };

  const deleteLabourer = (id: string) => {
    // This needs to be more complex if we want to reverse expenses, which is tricky.
    // For now, we just delete the labourer and their records.
    setLabourers(prev => prev.filter(l => l.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.labourerId !== id));
  };
  
  const getAttendanceForLabourer = (labourerId: string) => {
    return attendanceRecords.filter(record => record.labourerId === labourerId);
  }

  const markAttendance = (labourerId: string, date: string, status: AttendanceStatus, wages: number) => {
    const staffMember = labourers.find(l => l.id === labourerId);
    if (!staffMember) return;
    
    setAttendanceRecords(prev => {
        const existingRecordIndex = prev.findIndex(r => r.labourerId === labourerId && r.date === date);

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
                labourerId,
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

  return (
    <LabourContext.Provider value={{ labourers, attendanceRecords, addLabourer, updateLabourer, deleteLabourer, getAttendanceForLabourer, markAttendance }}>
      {children}
    </LabourContext.Provider>
  );
};

export const useLabour = () => {
  const context = useContext(LabourContext);
  if (context === undefined) {
    throw new Error('useLabour must be used within a LabourProvider');
  }
  return context;
};
