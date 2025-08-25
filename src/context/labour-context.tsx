
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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

const LABOURER_STORAGE_KEY = 'labourers_v4';
const ATTENDANCE_STORAGE_KEY = 'labourerAttendanceRecords_v4';

const initialLabourers: Labourer[] = [];
const initialAttendance: AttendanceRecord[] = [];

export const LabourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labourers, setLabourers] = useState<Labourer[]>(initialLabourers);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
        const savedLabourers = localStorage.getItem(LABOURER_STORAGE_KEY);
        if (savedLabourers) setLabourers(JSON.parse(savedLabourers));
        else localStorage.setItem(LABOURER_STORAGE_KEY, JSON.stringify(initialLabourers));

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
        localStorage.setItem(LABOURER_STORAGE_KEY, JSON.stringify(labourers));
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
    setLabourers(prev => prev.map(s => (s.id === id ? { ...s, name } : s)));
  };

  const deleteLabourer = (id: string) => {
    setLabourers(prev => prev.filter(s => s.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.labourerId !== id));
  };
  
  const getAttendanceForLabourer = (labourerId: string) => {
    return attendanceRecords.filter(record => record.labourerId === labourerId);
  }

  const markAttendance = (labourerId: string, date: string, status: AttendanceStatus, wages: number) => {
    const labourer = labourers.find(s => s.id === labourerId);
    if (!labourer) return;
    
    setAttendanceRecords(prev => {
        const existingRecordIndex = prev.findIndex(r => r.labourerId === labourerId && r.date === date);

        if (existingRecordIndex > -1) {
             const updatedRecords = [...prev];
             // Allow updating status and wages
             updatedRecords[existingRecordIndex] = { 
                 ...updatedRecords[existingRecordIndex], 
                 status,
                 wages 
            };
             return updatedRecords;
        } else {
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
  
  const value = {
      labourers,
      attendanceRecords,
      addLabourer,
      updateLabourer,
      deleteLabourer,
      getAttendanceForLabourer,
      markAttendance
  }

  return (
    <LabourContext.Provider value={value}>
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
