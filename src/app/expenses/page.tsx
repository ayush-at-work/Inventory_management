
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
import { PlusCircle, MoreHorizontal, Receipt } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useCashBalance } from '@/context/cash-balance-context';

const initialExpenses: Expense[] = [];

type Expense = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const { updateBalance } = useCashBalance();

  const handleAddNewClick = () => {
    setEditingItem(null);
    setOpen(true);
  };
  
  const handleEditClick = (expense: Expense) => {
    setEditingItem(expense);
    setOpen(true);
  };

  const handleDeleteClick = (expenseToDelete: Expense) => {
    updateBalance(expenseToDelete.amount); // Add amount back
    setExpenses(expenses.filter(exp => exp.id !== expenseToDelete.id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    
    if (editingItem) {
      const updatedExpense = {
        ...editingItem,
        date: formData.get('date') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        amount: amount,
      };
      const balanceChange = editingItem.amount - updatedExpense.amount;
      updateBalance(balanceChange);
      setExpenses(expenses.map(exp => exp.id === editingItem.id ? updatedExpense : exp));
    } else {
      const newEntry: Expense = {
        id: String(Date.now()),
        date: formData.get('date') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        amount: amount,
      };
      setExpenses([newEntry, ...expenses]);
      updateBalance(-amount);
    }
    
    setOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Receipt className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">General Expenses</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>
                    {editingItem ? 'Update the details of the expense.' : 'Record a new business expense.'}
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                    <Label htmlFor="date">
                        Date
                    </Label>
                    <Input id="date" name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().substring(0, 10)} required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="category">
                        Category
                    </Label>
                    <Input id="category" name="category" defaultValue={editingItem?.category} required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="amount">
                        Amount (₹)
                    </Label>
                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={editingItem?.amount} required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="description">
                        Description
                    </Label>
                    <Textarea id="description" name="description" defaultValue={editingItem?.description} required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{editingItem ? 'Save Changes' : 'Save Expense'}</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
       
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
                {expenses.length > 0 ? (
                    expenses.map(item => (
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
                            <DropdownMenuItem onClick={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this expense entry and refund the amount to your cash balance.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteClick(item)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No expenses recorded yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}

    