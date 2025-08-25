
"use client"

import React, { useState, useMemo } from 'react';
import { add, format, startOfMonth, endOfMonth, getDaysInMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
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
import { PlusCircle, MoreHorizontal, Users, CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLabour, Labourer, AttendanceRecord, AttendanceStatus } from '@/context/labour-context';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const AttendanceCalendar = ({
  selectedLabourerId,
  currentMonth,
  setCurrentMonth
}: {
  selectedLabourerId: string | null,
  currentMonth: Date,
  setCurrentMonth: (date: Date) => void
}) => {
  const { getAttendanceForLabourer, markAttendance } = useLabour();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('Present');
  const [wages, setWages] = useState(0);

  const attendanceMap = useMemo(() => {
    if (!selectedLabourerId) return new Map();
    const records = getAttendanceForLabourer(selectedLabourerId);
    return new Map(records.map(r => [r.date, r]));
  }, [selectedLabourerId, getAttendanceForLabourer, currentMonth]);

  const start = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start,
    end: endOfMonth(currentMonth),
  });

  const handleDayClick = (day: Date) => {
    if (!selectedLabourerId) {
      alert("Please select a labourer first.");
      return;
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingRecord = attendanceMap.get(dateStr);
    
    setSelectedDay(day);
    setAttendanceStatus(existingRecord?.status || 'Present');
    setWages(existingRecord?.wages || 0);
  };
  
  const handleSaveAttendance = () => {
    if (selectedDay && selectedLabourerId) {
      markAttendance(selectedLabourerId, format(selectedDay, 'yyyy-MM-dd'), attendanceStatus, wages);
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
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Mark Attendance for {selectedDay && format(selectedDay, 'PPP')}</DialogTitle>
                    <DialogDescription>Select the status and enter wages for the selected day.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 flex-grow overflow-auto pr-4">
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
                <DialogFooter className="flex-shrink-0 border-t pt-4 gap-2">
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


export default function LabourPage() {
  const { labourers, addLabourer, updateLabourer, deleteLabourer, attendanceRecords } = useLabour();
  const [labourerOpen, setLabourerOpen] = useState(false);
  const [editingLabourer, setEditingLabourer] = useState<Labourer | null>(null);
  const [selectedLabourerId, setSelectedLabourerId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddLabourerClick = () => {
    setEditingLabourer(null);
    setLabourerOpen(true);
  };
  
  const handleEditLabourerClick = (labourer: Labourer) => {
    setEditingLabourer(labourer);
    setLabourerOpen(true);
  };

  const handleLabourerSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    
    if (editingLabourer) {
      updateLabourer(editingLabourer.id, name);
    } else {
      addLabourer(name);
    }
    
    setLabourerOpen(false);
    setEditingLabourer(null);
  };
  
  const selectedLabourerName = useMemo(() => {
    if (!selectedLabourerId) return "Select a Labourer";
    return labourers.find(l => l.id === selectedLabourerId)?.name || "";
  }, [selectedLabourerId, labourers]);
  
  const handleDownloadReport = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const recordsForMonth = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
    });

    if (recordsForMonth.length === 0) {
        alert(`No attendance records found for ${format(currentMonth, 'MMMM yyyy')}.`);
        return;
    }
    
    const labourerMap = new Map(labourers.map(l => [l.id, l.name]));

    // Detailed report
    const detailedRows = recordsForMonth
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(record => [
            record.date,
            labourerMap.get(record.labourerId) || 'Unknown',
            record.status,
            record.wages.toFixed(2)
        ]);

    // Summary report
    const summary: {[key: string]: {p: number, h: number, a: number, w: number}} = {};
    recordsForMonth.forEach(r => {
        const name = labourerMap.get(r.labourerId) || 'Unknown';
        if (!summary[name]) summary[name] = { p: 0, h: 0, a: 0, w: 0 };
        if(r.status === 'Present') summary[name].p++;
        if(r.status === 'Half Day') summary[name].h++;
        if(r.status === 'Absent') summary[name].a++;
        summary[name].w += r.wages;
    });

    const summaryRows = Object.entries(summary).map(([name, data]) => [
        name,
        data.p,
        data.h,
        data.a,
        (data.p + data.h * 0.5),
        data.w.toFixed(2)
    ]);
    const totalWages = summaryRows.reduce((acc, row) => acc + parseFloat(row[5] as string), 0);

    const headers = ['Date', 'Labourer Name', 'Status', 'Wages Paid (₹)'];
    const summaryHeaders = ['Labourer Name', 'Present Days', 'Half Days', 'Absent Days', 'Total Days Worked', 'Total Wages Paid (₹)'];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Labour Report for ${format(currentMonth, 'MMMM yyyy')}\n\n`;
    csvContent += "Summary\n";
    csvContent += summaryHeaders.join(',') + '\n';
    summaryRows.forEach(rowArray => {
        let row = rowArray.join(',');
        csvContent += row + '\n';
    });
    csvContent += `,,,,"Total Wages:",${totalWages.toFixed(2)}\n\n`;

    csvContent += "Detailed Attendance Log\n";
    csvContent += headers.join(',') + '\n';
    detailedRows.forEach(rowArray => {
        let row = rowArray.join(',');
        csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `labour_report_${format(currentMonth, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Labour Management</h2>
            </div>
            <Button onClick={handleDownloadReport} variant="outline" className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
        </div>


       <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg font-semibold flex-grow overflow-hidden text-ellipsis whitespace-nowrap">All Labourers</h3>
                  <div className="flex-shrink-0">
                    <Dialog open={labourerOpen} onOpenChange={setLabourerOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={handleAddLabourerClick}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add 
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>{editingLabourer ? 'Edit Labourer' : 'Add New Labourer'}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleLabourerSubmit} className="flex-grow overflow-hidden flex flex-col">
                            <div className="grid gap-4 py-4 flex-grow overflow-auto pr-4">
                                <div className="space-y-2">
                                <Label htmlFor="name">
                                    Labourer Name
                                </Label>
                                <Input id="name" name="name" defaultValue={editingLabourer?.name} required />
                                </div>
                            </div>
                            <DialogFooter className="flex-shrink-0 border-t pt-4 gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" onClick={() => setEditingLabourer(null)}>Cancel</Button>
                                </DialogClose>
                                <Button type="submit">{editingLabourer ? 'Save Changes' : 'Save Labourer'}</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                    </Dialog>
                  </div>
              </div>
              <ScrollArea className="h-96">
                <ScrollBar orientation="vertical" />
                <div className="space-y-2 pr-6">
                  {labourers.map(labourer => (
                    <div key={labourer.id} className={cn("flex items-center justify-between p-2 rounded-md", selectedLabourerId === labourer.id ? 'bg-primary/10' : 'hover:bg-accent')}>
                       <button onClick={() => setSelectedLabourerId(labourer.id)} className="flex-1 text-left">
                        {labourer.name}
                      </button>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditLabourerClick(labourer)}>
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
                                  This will permanently delete {labourer.name} and all their attendance records. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLabourer(labourer.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                   {labourers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No labourers added yet.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
           <div className="flex items-center gap-4 mb-4">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Attendance for: <span className="text-primary">{selectedLabourerName}</span>
            </h3>
          </div>
          <AttendanceCalendar 
            selectedLabourerId={selectedLabourerId}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>
      </div>
    </div>
  );
}
