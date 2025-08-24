
"use client";

import React, { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
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
import { PlusCircle, MoreHorizontal, HandCoins, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLedger, LedgerEntry } from '@/context/ledger-context';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const LedgerTable = ({
    items,
    onSettle,
    onDelete
}: {
    items: LedgerEntry[],
    onSettle: (id: string) => void,
    onDelete: (id: string) => void
}) => {
    return (
        <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Person Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
                items.map(item => (
                <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="font-medium">{item.personName}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                        <Badge
                            variant={item.status === 'settled' ? 'default' : 'secondary'}
                            className={`${item.status === 'settled' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}
                        >
                            {item.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {item.status === 'open' && (
                            <DropdownMenuItem onClick={() => onSettle(item.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Settled
                            </DropdownMenuItem>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this ledger entry and update your cash balance.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(item.id)}>Continue</AlertDialogAction>
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
                    <TableCell colSpan={6} className="h-24 text-center">
                        No entries yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
}


export default function LedgerPage() {
  const { entries, addEntry, settleEntry, deleteEntry } = useLedger();
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newEntry: Omit<LedgerEntry, 'id' | 'status'> = {
        date: formData.get('date') as string,
        personName: formData.get('personName') as string,
        type: formData.get('type') as 'given' | 'taken',
        amount: Number(formData.get('amount')),
        description: formData.get('description') as string,
    };

    addEntry(newEntry);
    setOpen(false);
  };
  
  const loansGiven = entries.filter(e => e.type === 'given');
  const loansTaken = entries.filter(e => e.type === 'taken');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <HandCoins className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Cash Ledger</h2>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ledger Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Ledger Entry</DialogTitle>
                <DialogDescription>
                  Record a cash loan you've given or taken.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personName">Person's Name</Label>
                    <Input id="personName" name="personName" placeholder="e.g., John Doe" required />
                  </div>
                  <div className="space-y-2">
                     <Label>Type of Entry</Label>
                     <RadioGroup name="type" defaultValue="given" className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="given" id="r-given" />
                            <Label htmlFor="r-given">Loan Given</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="taken" id="r-taken" />
                            <Label htmlFor="r-taken">Loan Taken</Label>
                        </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" placeholder="e.g., For business supplies" />
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
        </div>
      </div>
        
        <Tabs defaultValue="given" className="space-y-4">
            <TabsList>
                <TabsTrigger value="given">Loans Given</TabsTrigger>
                <TabsTrigger value="taken">Loans Taken</TabsTrigger>
            </TabsList>
            <TabsContent value="given" className="space-y-4">
                <LedgerTable items={loansGiven} onSettle={settleEntry} onDelete={deleteEntry} />
            </TabsContent>
            <TabsContent value="taken" className="space-y-4">
                 <LedgerTable items={loansTaken} onSettle={settleEntry} onDelete={deleteEntry} />
            </TabsContent>
        </Tabs>

    </div>
  );
}
