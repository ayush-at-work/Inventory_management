
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCashBalance } from './cash-balance-context';

export type StaffMember = {
    id: string;
    name: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';

export type AttendanceRecord = {
    id: string;
    staffMemberId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    wages: number;
};

interface StaffContextType {
  staffMembers: StaffMember[];
  attendanceRecords: AttendanceRecord[];
  addStaffMember: (name: string) => void;
  updateStaffMember: (id: string, name: string) => void;
  deleteStaffMember: (id: string) => void;
  getAttendanceForStaffMember: (staffMemberId: string) => AttendanceRecord[];
  markAttendance: (staffMemberId: string, date: string, status: AttendanceStatus, wages: number) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const STAFF_MEMBERS_STORAGE_KEY = 'staffMembers';
const ATTENDANCE_STORAGE_KEY = 'attendanceRecords';

const initialStaffMembers: StaffMember[] = [];
const initialAttendance: AttendanceRecord[] = [];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [isMounted, setIsMounted] = useState(false);
  const { updateBalance } = useCashBalance();

  useEffect(() => {
    setIsMounted(true);
    try {
        const savedStaffMembers = localStorage.getItem(STAFF_MEMBERS_STORAGE_KEY);
        if (savedStaffMembers) setStaffMembers(JSON.parse(savedStaffMembers));
        else {
            setStaffMembers(initialStaffMembers);
            localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(initialStaffMembers));
        }

        const savedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
        else {
            setAttendanceRecords(initialAttendance);
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initialAttendance));
        }
    } catch (error) {
        console.error("Failed to read from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(staffMembers));
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceRecords));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [staffMembers, attendanceRecords, isMounted]);

  const addStaffMember = (name: string) => {
    const newStaffMember: StaffMember = { id: String(Date.now()), name };
    setStaffMembers(prev => [...prev, newStaffMember]);
  };

  const updateStaffMember = (id: string, name: string) => {
    setStaffMembers(prev => prev.map(l => (l.id === id ? { ...l, name } : l)));
  };

  const deleteStaffMember = (id: string) => {
    const recordsToDelete = attendanceRecords.filter(r => r.staffMemberId === id);
    const totalWagesToRefund = recordsToDelete.reduce((acc, r) => acc + r.wages, 0);
    updateBalance(totalWagesToRefund);

    setStaffMembers(prev => prev.filter(l => l.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.staffMemberId !== id));
  };
  
  const getAttendanceForStaffMember = (staffMemberId: string) => {
    return attendanceRecords.filter(record => record.staffMemberId === staffMemberId);
  }

  const markAttendance = (staffMemberId: string, date: string, status: AttendanceStatus, wages: number) => {
    setAttendanceRecords(prev => {
        const existingRecordIndex = prev.findIndex(r => r.staffMemberId === staffMemberId && r.date === date);
        let balanceChange = 0;

        if (existingRecordIndex > -1) {
            const updatedRecords = [...prev];
            const oldRecord = updatedRecords[existingRecordIndex];
            balanceChange = oldRecord.wages - wages;
            updatedRecords[existingRecordIndex] = { ...oldRecord, status, wages };
            updateBalance(balanceChange);
            return updatedRecords;
        } else {
            const newRecord: AttendanceRecord = {
                id: String(Date.now()),
                staffMemberId,
                date,
                status,
                wages,
            };
            updateBalance(-wages);
            return [...prev, newRecord];
        }
    });
  }

  if (!isMounted) {
      return (
        <StaffContext.Provider value={{
            staffMembers: initialStaffMembers,
            attendanceRecords: initialAttendance,
            addStaffMember,
            updateStaffMember,
            deleteStaffMember,
            getAttendanceForStaffMember,
            markAttendance
        }}>
            {children}
        </StaffContext.Provider>
      );
  }

  return (
    <StaffContext.Provider value={{ staffMembers, attendanceRecords, addStaffMember, updateStaffMember, deleteStaffMember, getAttendanceForStaffMember, markAttendance }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

    