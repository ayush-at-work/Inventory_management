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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const initialInwardGoods = [
  {
    id: '1',
    invoiceNumber: 'INV001',
    date: '2023-10-01',
    supplier: 'MetalRecyclers Inc.',
    gstNumber: '29ABCDE1234F1Z5',
    placeOfSupply: 'Maharashtra',
    taxableAmount: '$3200',
    taxPercentage: '9%',
    taxAmount: '$288',
    totalInvoiceValue: '$3500',
    materialType: 'Copper',
    weight: '500 kg',
  },
  {
    id: '2',
    invoiceNumber: 'INV002',
    date: '2023-10-02',
    supplier: 'SteelScrappers Co.',
    gstNumber: '27FGHIJ5678K1Z4',
    placeOfSupply: 'Gujarat',
    taxableAmount: '$750',
    taxPercentage: '5%',
    taxAmount: '$50',
    totalInvoiceValue: '$800',
    materialType: 'Steel',
    weight: '2000 kg',
  },
  {
    id: '3',
    invoiceNumber: 'INV003',
    date: '2023-10-03',
    supplier: 'Alu Source',
    gstNumber: '36LMNOP9012Q1Z3',
    placeOfSupply: 'Karnataka',
    taxableAmount: '$1650',
    taxPercentage: '9%',
    taxAmount: '$150',
    totalInvoiceValue: '$1800',
    materialType: 'Aluminum',
    weight: '1200 kg',
  },
];

export default function InwardGoodsPage() {
  const [inwardGoods, setInwardGoods] = useState(initialInwardGoods);
  const [open, setOpen] = useState(false);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);

  const calculateTax = (amount: number, percentage: number) => {
    return (amount * percentage) / 100;
  };

  const taxAmount = calculateTax(taxableAmount, taxPercentage);
  const totalInvoiceValue = taxableAmount + taxAmount;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEntry = {
      id: String(inwardGoods.length + 1),
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      supplier: formData.get('supplier') as string,
      gstNumber: formData.get('gstNumber') as string,
      placeOfSupply: formData.get('placeOfSupply') as string,
      taxableAmount: `$${taxableAmount.toFixed(2)}`,
      taxPercentage: `${taxPercentage}%`,
      taxAmount: `$${taxAmount.toFixed(2)}`,
      totalInvoiceValue: `$${totalInvoiceValue.toFixed(2)}`,
      materialType: formData.get('materialType') as string,
      weight: `${formData.get('weight')} kg`,
    };
    setInwardGoods([newEntry, ...inwardGoods]);
    setOpen(false);
    setTaxableAmount(0);
    setTaxPercentage(0);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inward Goods</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inward Entry</DialogTitle>
              <DialogDescription>
                Log a new batch of incoming scrap material.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
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
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input id="gstNumber" name="gstNumber" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfSupply">Place of Supply</Label>
                  <Select name="placeOfSupply" required>
                    <SelectTrigger id="placeOfSupply">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialType">Material</Label>
                  <Input id="materialType" name="materialType" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="taxableAmount">Taxable Amount ($)</Label>
                  <Input id="taxableAmount" name="taxableAmount" type="number" step="0.01" required 
                    onChange={(e) => setTaxableAmount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                  <Input id="taxPercentage" name="taxPercentage" type="number" step="0.01" required 
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount ($)</Label>
                  <Input id="taxAmount" name="taxAmount" type="number" step="0.01" value={taxAmount.toFixed(2)} disabled />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="totalInvoiceValue">Total Invoice Value ($)</Label>
                  <Input id="totalInvoiceValue" name="totalInvoiceValue" type="number" step="0.01" value={totalInvoiceValue.toFixed(2)} disabled />
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>GST #</TableHead>
              <TableHead>Supply Place</TableHead>
               <TableHead>Material</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Taxable Amt</TableHead>
              <TableHead className="text-right">Tax %</TableHead>
              <TableHead className="text-right">Tax Amt</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inwardGoods.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>{item.gstNumber}</TableCell>
                <TableCell>{item.placeOfSupply}</TableCell>
                <TableCell>{item.materialType}</TableCell>
                <TableCell>{item.weight}</TableCell>
                <TableCell className="text-right">{item.taxableAmount}</TableCell>
                <TableCell className="text-right">{item.taxPercentage}</TableCell>
                <TableCell className="text-right">{item.taxAmount}</TableCell>
                <TableCell className="text-right font-bold">{item.totalInvoiceValue}</TableCell>
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
