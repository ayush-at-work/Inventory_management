
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Download, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBankBalance } from '@/context/bank-balance-context';

const initialCashInward = [
    {
    id: '1',
    invoiceNumber: 'CASH-001',
    date: '2023-10-10',
    supplier: 'Local Seller A',
    totalValue: '₹5500',
    materialType: 'Mixed Scrap',
    weight: '750 kg',
    hsnCode: 'N/A',
  },
   {
    id: '2',
    invoiceNumber: 'CASH-002',
    date: '2023-10-11',
    supplier: 'Walk-in Supplier',
    totalValue: '₹1200',
    materialType: 'Old Newspapers',
    weight: '100 kg',
    hsnCode: '47079000',
  },
];


export default function CashInwardPage() {
  const [inwardGoods, setInwardGoods] = useState(initialCashInward);
  const [open, setOpen] = useState(false);
  const { updateBalance } = useBankBalance();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const totalValue = Number(formData.get('totalValue'));

    const newEntry = {
      id: String(inwardGoods.length + 1),
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      supplier: formData.get('supplier') as string,
      hsnCode: formData.get('hsnCode') as string,
      totalValue: `₹${totalValue.toFixed(2)}`,
      materialType: formData.get('materialType') as string,
      weight: `${formData.get('weight')} kg`,
    };
    setInwardGoods([newEntry, ...inwardGoods]);
    updateBalance(-totalValue);
    setOpen(false);
  };

  const handleExport = () => {
    const headers = [
      'Invoice #', 'Date', 'Supplier', 'Material', 'HSN Code', 'Weight', 'Total Value'
    ];
    const rows = inwardGoods.map(item => [
      item.invoiceNumber, item.date, item.supplier,
      item.materialType, item.hsnCode, item.weight, item.totalValue
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


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Cash Inward</h2>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
           <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Cash Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Cash Inward Entry</DialogTitle>
                <DialogDescription>
                  Log a new cash purchase of scrap material.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Reference / Bill No.</Label>
                    <Input id="invoiceNumber" name="invoiceNumber" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Name of Supplier</Label>
                    <Input id="supplier" name="supplier" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materialType">Material</Label>
                    <Input id="materialType" name="materialType" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsnCode">HSN Code (Optional)</Label>
                    <Input id="hsnCode" name="hsnCode" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" required />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="totalValue">Total Value (₹)</Label>
                    <Input id="totalValue" name="totalValue" type="number" step="0.01" required />
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

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
               <TableHead>Material</TableHead>
               <TableHead>HSN Code</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inwardGoods.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">{item.invoiceNumber}</TableCell>
                <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                <TableCell className="whitespace-nowrap">{item.supplier}</TableCell>
                <TableCell>{item.materialType}</TableCell>
                <TableCell>{item.hsnCode}</TableCell>
                <TableCell className="whitespace-nowrap">{item.weight}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">{item.totalValue}</TableCell>
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
    </div>
  );
}

