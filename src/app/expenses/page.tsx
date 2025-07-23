
"use client";

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Receipt } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashBalance } from '@/context/cash-balance-context';

const initialExpenses = [
  {
    id: '1',
    date: '2023-10-01',
    category: 'Utilities',
    description: 'Electricity Bill',
    amount: 350.00,
  },
  {
    id: '2',
    date: '2023-10-02',
    category: 'Rent',
    description: 'Warehouse Rent',
    amount: 2500.00,
  },
  {
    id: '3',
    date: '2023-10-03',
    category: 'Fuel',
    description: 'Truck Fuel',
    amount: 400.00,
  },
];

const initialLabourAttendance = [
    { id: '1', date: '2023-10-10', name: 'Ramesh', status: 'Present', wages: 500 },
    { id: '2', date: '2023-10-10', name: 'Suresh', status: 'Half Day', wages: 250 },
    { id: '3', date: '2023-10-10', name: 'Vikas', status: 'Absent', wages: 0 },
];

type Expense = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

type LabourAttendance = {
    id: string;
    date: string;
    name: string;
    status: 'Present' | 'Absent' | 'Half Day';
    wages: number;
}


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [labour, setLabour] = useState<LabourAttendance[]>(initialLabourAttendance);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [labourOpen, setLabourOpen] = useState(false);
  const { updateBalance } = useCashBalance();

  const handleExpenseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    const newEntry: Expense = {
      id: String(expenses.length + 1),
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      amount: amount,
    };
    setExpenses([newEntry, ...expenses]);
    updateBalance(-amount); // Expenses are paid from cash
    setExpenseOpen(false);
  };

  const handleLabourSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const wages = Number(formData.get('wages'));
    const newEntry: LabourAttendance = {
        id: String(labour.length + 1),
        date: formData.get('date') as string,
        name: formData.get('name') as string,
        status: formData.get('status') as 'Present' | 'Absent' | 'Half Day',
        wages: wages,
    };
    setLabour([newEntry, ...labour]);
    updateBalance(-wages);
    setLabourOpen(false);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Receipt className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
      </div>

       <Tabs defaultValue="general" className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <TabsList>
                <TabsTrigger value="general">General Expenses</TabsTrigger>
                <TabsTrigger value="labour">Labour Attendance</TabsTrigger>
            </TabsList>
             <div className="w-full md:w-auto">
                <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" style={{display: 'none'}} id="general-expense-trigger">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Record a new business expense.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleExpenseSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                        <Label htmlFor="date">
                            Date
                        </Label>
                        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="category">
                            Category
                        </Label>
                        <Input id="category" name="category" required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="amount">
                            Amount (₹)
                        </Label>
                        <Input id="amount" name="amount" type="number" step="0.01" required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="description">
                            Description
                        </Label>
                        <Textarea id="description" name="description" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Expense</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>

                <Dialog open={labourOpen} onOpenChange={setLabourOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" style={{display: 'none'}} id="labour-expense-trigger">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Labour Entry
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>Add Labour Entry</DialogTitle>
                    <DialogDescription>
                        Record daily labour attendance and wages.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLabourSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                        <Label htmlFor="date-labour">
                            Date
                        </Label>
                        <Input id="date-labour" name="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="name">
                            Labourer Name
                        </Label>
                        <Input id="name" name="name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Attendance Status</Label>
                            <Select name="status" required defaultValue="Present">
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="Half Day">Half Day</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="wages">
                            Wages Paid (₹)
                        </Label>
                        <Input id="wages" name="wages" type="number" step="0.01" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Entry</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
                
                <Button onClick={() => {
                    const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('data-value');
                    if (activeTab === 'labour') {
                        document.getElementById('labour-expense-trigger')?.click();
                    } else {
                        document.getElementById('general-expense-trigger')?.click();
                    }
                }} className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
                </Button>
            </div>
        </div>
       
        <TabsContent value="general" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">₹{item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </TabsContent>
        <TabsContent value="labour" className="space-y-4">
             <div className="rounded-md border overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Labourer Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Wages Paid</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {labour.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{item.name}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">₹{item.wages.toFixed(2)}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
