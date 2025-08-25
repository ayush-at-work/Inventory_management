
"use client";

import * as React from 'react';
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
import { PlusCircle, MoreHorizontal, Download, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCashBalance } from '@/context/cash-balance-context';
import { useInventory } from '@/context/inventory-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const initialCashInward: CashInward[] = [];

type CashInward = {
    id: string;
    invoiceNumber: string;
    date: string;
    supplier: string;
    totalValue: number;
    materialType: string;
    weight: string;
    hsnCode: string;
};


export default function CashInwardPage() {
  const [inwardGoods, setInwardGoods] = useState<CashInward[]>(initialCashInward);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CashInward | null>(null);
  const { updateBalance } = useCashBalance();
  const { addInventoryItem } = useInventory();

  const handleAddNewClick = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const handleEditClick = (item: CashInward) => {
    setEditingItem(item);
    setOpen(true);
  };
  
  const handleDeleteClick = (itemToDelete: CashInward) => {
      // Add the value back to balance since the purchase is being deleted
      updateBalance(itemToDelete.totalValue);
      setInwardGoods(inwardGoods.filter(item => item.id !== itemToDelete.id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const totalValue = Number(formData.get('totalValue'));
    const quantity = Number(formData.get('quantity'));
    const unit = formData.get('unit') as string;

    const newEntry: CashInward = {
      id: editingItem ? editingItem.id : String(Date.now()),
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      supplier: formData.get('supplier') as string,
      hsnCode: formData.get('hsnCode') as string,
      totalValue: totalValue,
      materialType: formData.get('materialType') as string,
      weight: `${quantity} ${unit}`,
    };

    if (editingItem) {
        // Recalculate balance impact
        const originalValue = editingItem.totalValue;
        updateBalance(originalValue - newEntry.totalValue); // Add back old, subtract new
        setInwardGoods(inwardGoods.map(item => item.id === editingItem.id ? newEntry : item));
    } else {
        setInwardGoods([newEntry, ...inwardGoods]);
        updateBalance(-totalValue);
        addInventoryItem({
            materialType: newEntry.materialType,
            hsnCode: newEntry.hsnCode,
            quantity: quantity,
            unit: unit,
            price: totalValue / quantity,
            transactionType: 'Cash'
        });
    }

    setOpen(false);
    setEditingItem(null);
  };

  const handleExport = () => {
    const headers = [
      'Invoice #', 'Date', 'Supplier', 'Material', 'Weight', 'Total Value'
    ];
    const rows = inwardGoods.map(item => [
      item.invoiceNumber, item.date, item.supplier,
      item.materialType, item.weight, `₹${item.totalValue.toFixed(2)}`
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(',') + "\n"
      + rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cash_inward_goods.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const [weightValue, unitValue] = editingItem?.weight.split(' ') || ['', 'kg'];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Cash Inward</h2>
        </div>
        <div className="flex w-full flex-col-reverse sm:flex-row md:w-auto items-center gap-2">
           <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Cash Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Cash Inward Entry' : 'Add New Cash Inward Entry'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of the cash purchase.' : 'Log a new cash purchase of scrap material.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
                <ScrollArea className="flex-grow">
                  <ScrollBar orientation="vertical" />
                  <div className="space-y-4 py-4 pr-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Reference / Bill No.</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" defaultValue={editingItem?.invoiceNumber} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().substring(0, 10)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Name of Supplier</Label>
                      <Input id="supplier" name="supplier" defaultValue={editingItem?.supplier} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialType">Material</Label>
                      <Input id="materialType" name="materialType" defaultValue={editingItem?.materialType} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsnCode">HSN Code (Optional)</Label>
                      <Input id="hsnCode" name="hsnCode" defaultValue={editingItem?.hsnCode} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                       <Select name="unit" required defaultValue={unitValue || 'kg'}>
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="NOS">NOS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" defaultValue={weightValue} required />
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="totalValue">Total Value (₹)</Label>
                      <Input id="totalValue" name="totalValue" type="number" step="0.01" defaultValue={editingItem?.totalValue} required />
                    </div>
                  </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 border-t pt-4 gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{editingItem ? 'Save Changes' : 'Save Entry'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {inwardGoods.length > 0 ? (
          inwardGoods.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{item.supplier}</p>
                    <p className="text-sm text-muted-foreground">REF-{item.invoiceNumber}</p>
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
                              This action cannot be undone. This will permanently delete this entry and update the bank balance.
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
              <CardContent className="space-y-2">
                  <p className="text-sm"><strong>Material:</strong> {item.materialType} ({item.weight})</p>
                  <p className="text-sm"><strong>Date:</strong> {item.date}</p>
              </CardContent>
              <CardFooter className="flex justify-end items-center bg-muted/50 p-4">
                  <p className="text-lg font-bold">₹{item.totalValue.toFixed(2)}</p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">No cash entries yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="rounded-md border overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
               <TableHead>Material</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inwardGoods.length > 0 ? (
                inwardGoods.map(item => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">{item.invoiceNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.supplier}</TableCell>
                    <TableCell>{item.materialType}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.weight}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">₹{item.totalValue.toFixed(2)}</TableCell>
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
                                This action cannot be undone. This will permanently delete this entry
                                and update the bank balance.
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
                    <TableCell colSpan={7} className="h-24 text-center">
                        No cash entries yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
