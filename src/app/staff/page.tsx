
"use client"

import React, { useState, useMemo } from 'react';
import { add, format, startOfMonth, getDaysInMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Users, CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaff, StaffMember, AttendanceRecord, AttendanceStatus } from '@/context/staff-context';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AttendanceCalendar = ({
  selectedStaffMemberId,
  currentMonth,
  setCurrentMonth
}: {
  selectedStaffMemberId: string | null,
  currentMonth: Date,
  setCurrentMonth: (date: Date) => void
}) => {
  const { getAttendanceForStaffMember, markAttendance } = useStaff();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('Present');
  const [wages, setWages] = useState(0);

  const attendanceMap = useMemo(() => {
    if (!selectedStaffMemberId) return new Map();
    const records = getAttendanceForStaffMember(selectedStaffMemberId);
    return new Map(records.map(r => [r.date, r]));
  }, [selectedStaffMemberId, getAttendanceForStaffMember]);

  const start = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start,
    end: new Date(start.getFullYear(), start.getMonth() + 1, 0),
  });

  const handleDayClick = (day: Date) => {
    if (!selectedStaffMemberId) {
      alert("Please select a staff member first.");
      return;
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingRecord = attendanceMap.get(dateStr);
    
    setSelectedDay(day);
    setAttendanceStatus(existingRecord?.status || 'Present');
    setWages(existingRecord?.wages || 0);
  };
  
  const handleSaveAttendance = () => {
    if (selectedDay && selectedStaffMemberId) {
      markAttendance(selectedStaffMemberId, format(selectedDay, 'yyyy-MM-dd'), attendanceStatus, wages);
    }
    setSelectedDay(null);
  }

  const getDayClass = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return 'text-muted-foreground/50';
    const dateStr = format(day, 'yyyy-MM-dd');
    const record = attendanceMap.get(dateStr);
    if (!record) return 'hover:bg-accent';

    return {
      'Present': 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
      'Absent': 'bg-red-500/20 text-red-700 hover:bg-red-500/30',
      'Half Day': 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30',
    }[record.status];
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(add(currentMonth, { months: -1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(add(currentMonth, { months: 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {Array.from({ length: start.getDay() }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {daysInMonth.map(day => (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={cn("h-12 w-full rounded-md flex flex-col items-center justify-center p-1 transition-colors", getDayClass(day))}
            >
              <span>{format(day, 'd')}</span>
              {attendanceMap.has(format(day, 'yyyy-MM-dd')) && (
                 <span className="text-xs">₹{attendanceMap.get(format(day, 'yyyy-MM-dd'))!.wages}</span>
              )}
            </button>
          ))}
        </div>
        
         <Dialog open={!!selectedDay} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mark Attendance for {selectedDay && format(selectedDay, 'PPP')}</DialogTitle>
                    <DialogDescription>Select the status and enter wages for the selected day.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label className="mb-2 block">Status</Label>
                        <RadioGroup value={attendanceStatus} onValueChange={(v) => setAttendanceStatus(v as AttendanceStatus)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Present" id="present" />
                                <Label htmlFor="present">Present</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Half Day" id="halfday" />
                                <Label htmlFor="halfday">Half Day</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Absent" id="absent" />
                                <Label htmlFor="absent">Absent</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div>
                        <Label htmlFor="wages">Wages Paid (₹)</Label>
                        <Input id="wages" type="number" value={wages} onChange={e => setWages(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveAttendance}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};


export default function StaffPage() {
  const { staffMembers, addStaffMember, updateStaffMember, deleteStaffMember } = useStaff();
  const [staffMemberOpen, setStaffMemberOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [selectedStaffMemberId, setSelectedStaffMemberId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddStaffMemberClick = () => {
    setEditingStaffMember(null);
    setStaffMemberOpen(true);
  };
  
  const handleEditStaffMemberClick = (staffMember: StaffMember) => {
    setEditingStaffMember(staffMember);
    setStaffMemberOpen(true);
  };

  const handleStaffMemberSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    
    if (editingStaffMember) {
      updateStaffMember(editingStaffMember.id, name);
    } else {
      addStaffMember(name);
    }
    
    setStaffMemberOpen(false);
    setEditingStaffMember(null);
  };
  
  const selectedStaffMemberName = useMemo(() => {
    if (!selectedStaffMemberId) return "Select a Staff Member";
    return staffMembers.find(l => l.id === selectedStaffMemberId)?.name || "";
  }, [selectedStaffMemberId, staffMembers]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
      </div>

       <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Staff Members</h3>
                  <Dialog open={staffMemberOpen} onOpenChange={setStaffMemberOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={handleAddStaffMemberClick}>
                          <PlusCircle className="mr-2 h-4 w-4"/> Add 
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingStaffMember ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStaffMemberSubmit}>
                          <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                              <Label htmlFor="name">
                                  Staff Member Name
                              </Label>
                              <Input id="name" name="name" defaultValue={editingStaffMember?.name} required />
                              </div>
                          </div>
                          <DialogFooter>
                              <DialogClose asChild>
                                  <Button type="button" variant="secondary" onClick={() => setEditingStaffMember(null)}>Cancel</Button>
                              </DialogClose>
                              <Button type="submit">{editingStaffMember ? 'Save Changes' : 'Save Staff Member'}</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                  </Dialog>
              </div>
              <div className="space-y-2">
                {staffMembers.map(staffMember => (
                  <div key={staffMember.id} className={cn("flex items-center justify-between p-2 rounded-md", selectedStaffMemberId === staffMember.id ? 'bg-primary/10' : 'hover:bg-accent')}>
                     <button onClick={() => setSelectedStaffMemberId(staffMember.id)} className="flex-1 text-left">
                      {staffMember.name}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditStaffMemberClick(staffMember)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {staffMember.name} and all their attendance records. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteStaffMember(staffMember.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
           <div className="flex items-center gap-4 mb-4">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Attendance for: <span className="text-primary">{selectedStaffMemberName}</span>
            </h3>
          </div>
          <AttendanceCalendar 
            selectedStaffMemberId={selectedStaffMemberId}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>
      </div>
    </div>
  );
}
