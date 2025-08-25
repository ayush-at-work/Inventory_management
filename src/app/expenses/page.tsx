
"use client";

import { useState, useMemo } from 'react';
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
import { PlusCircle, MoreHorizontal, Receipt, ChevronsUpDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses, Expense } from '@/context/expenses-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';


function CategoryCombobox({ value, onChange, categories }: { value: string, onChange: (value: string) => void, categories: string[] }) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value ? value : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput 
                        placeholder="Search or create category..." 
                        onValueChange={onChange}
                     />
                    <CommandList>
                        <CommandEmpty>
                             <Button variant="ghost" className="w-full justify-start" onClick={() => {
                                onChange(
                                    // Get the input value from the Command component
                                    (document.querySelector(`[cmdk-input]`) as HTMLInputElement)?.value || ''
                                )
                                setOpen(false)
                            }}>
                                Create "{
                                    (document.querySelector(`[cmdk-input]`) as HTMLInputElement)?.value
                                }"
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                    key={category}
                                    value={category}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === category ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {category}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const uniqueCategories = useMemo(() => {
    const categorySet = new Set(expenses.map(e => e.category));
    return Array.from(categorySet).sort();
  }, [expenses]);
  
  const handleAddNewClick = () => {
    setEditingItem(null);
    setSelectedCategory('');
    setOpen(true);
  };
  
  const handleEditClick = (expense: Expense) => {
    setEditingItem(expense);
    setSelectedCategory(expense.category);
    setOpen(true);
  };

  const handleDeleteClick = (expenseToDelete: Expense) => {
    deleteExpense(expenseToDelete.id);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    
    if(!selectedCategory) {
        alert("Please select or create a category.");
        return;
    }

    const expenseData = {
        date: formData.get('date') as string,
        category: selectedCategory,
        description: formData.get('description') as string,
        amount: amount,
    };

    if (editingItem) {
      updateExpense(editingItem.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    setOpen(false);
    setEditingItem(null);
    setSelectedCategory('');
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
                        <Label>Category</Label>
                        <CategoryCombobox 
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            categories={uniqueCategories}
                        />
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
       
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {expenses.length > 0 ? (
            expenses.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{item.category}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end items-center bg-muted/50 p-4">
                  <p className="text-lg font-bold">₹{item.amount.toFixed(2)}</p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground">No expenses recorded yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop View */}
        <div className="rounded-md border overflow-x-auto hidden md:block">
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
