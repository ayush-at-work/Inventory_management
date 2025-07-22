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
import { PlusCircle, MoreHorizontal, Download } from 'lucide-react';
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

const initialOutwardGoods = [
  {
    id: '1',
    invoiceNumber: 'SALE001',
    date: '2023-10-05',
    customer: 'BuildRight Ltd.',
    gstNumber: '29ABCDE1234F1Z5',
    placeOfSupply: 'Maharashtra',
    taxableAmount: '$1200',
    taxType: 'Inter-state',
    cgst: '9%',
    sgst: '9%',
    igst: '-',
    taxAmount: '$216',
    totalInvoiceValue: '$1416',
    materialType: 'Steel',
    weight: '1500 kg',
    hsnCode: '72044900',
  },
  {
    id: '2',
    invoiceNumber: 'SALE002',
    date: '2023-10-06',
    customer: 'Creative Alloys',
    gstNumber: '27FGHIJ5678K1Z4',
    placeOfSupply: 'Gujarat',
    taxableAmount: '$2500',
    taxType: 'Intra-state',
    cgst: '-',
    sgst: '-',
    igst: '18%',
    taxAmount: '$450',
    totalInvoiceValue: '$2950',
    materialType: 'Copper',
    weight: '300 kg',
    hsnCode: '74040010',
  },
];

export default function OutwardGoodsPage() {
  const [outwardGoods, setOutwardGoods] = useState(initialOutwardGoods);
  const [open, setOpen] = useState(false);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [taxType, setTaxType] = useState<'inter-state' | 'intra-state' | ''>('');
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);

  const taxAmount = React.useMemo(() => {
    if (taxType === 'inter-state') {
      return (taxableAmount * (cgst + sgst)) / 100;
    }
    if (taxType === 'intra-state') {
      return (taxableAmount * igst) / 100;
    }
    return 0;
  }, [taxableAmount, taxType, cgst, sgst, igst]);

  const totalInvoiceValue = taxableAmount + taxAmount;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEntry = {
      id: String(outwardGoods.length + 1),
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      customer: formData.get('customer') as string,
      gstNumber: formData.get('gstNumber') as string,
      placeOfSupply: formData.get('placeOfSupply') as string,
      hsnCode: formData.get('hsnCode') as string,
      taxableAmount: `$${taxableAmount.toFixed(2)}`,
      taxType: taxType as string,
      cgst: taxType === 'inter-state' ? `${cgst}%` : '-',
      sgst: taxType === 'inter-state' ? `${sgst}%` : '-',
      igst: taxType === 'intra-state' ? `${igst}%` : '-',
      taxAmount: `$${taxAmount.toFixed(2)}`,
      totalInvoiceValue: `$${totalInvoiceValue.toFixed(2)}`,
      materialType: formData.get('materialType') as string,
      weight: `${formData.get('weight')} kg`,
    };
    setOutwardGoods([newEntry, ...outwardGoods]);
    setOpen(false);
    // Reset form state
    setTaxableAmount(0);
    setTaxType('');
    setCgst(0);
    setSgst(0);
    setIgst(0);
  };

  const handleExport = () => {
    const headers = [
      'Invoice #', 'Date', 'Customer', 'GST #', 'Supply Place',
      'Material', 'HSN Code', 'Weight', 'Taxable Amt', 'Tax Type', 'CGST', 'SGST', 'IGST',
      'Tax Amt', 'Total Value'
    ];
    const rows = outwardGoods.map(item => [
      item.invoiceNumber, item.date, item.customer, item.gstNumber, item.placeOfSupply,
      item.materialType, item.hsnCode, item.weight, item.taxableAmount, item.taxType,
      item.cgst, item.sgst, item.igst, item.taxAmount, item.totalInvoiceValue
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(',') + "\n"
      + rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "outward_goods.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Outward Goods</h2>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Outward Entry</DialogTitle>
                <DialogDescription>
                  Log a new sale of scrap material.
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
                    <Label htmlFor="customer">Name of Customer</Label>
                    <Input id="customer" name="customer" required />
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
                    <Label htmlFor="hsnCode">HSN Code</Label>
                    <Input id="hsnCode" name="hsnCode" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="taxType">Tax Type</Label>
                     <Select name="taxType" required onValueChange={(value) => setTaxType(value as any)}>
                      <SelectTrigger id="taxType">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter-state">Inter-state</SelectItem>
                        <SelectItem value="intra-state">Intra-state</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="taxableAmount">Taxable Amount ($)</Label>
                    <Input id="taxableAmount" name="taxableAmount" type="number" step="0.01" required
                      onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    />
                  </div>

                  {taxType === 'inter-state' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cgst">CGST (%)</Label>
                        <Input id="cgst" name="cgst" type="number" step="0.01" required onChange={(e) => setCgst(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sgst">SGST (%)</Label>
                        <Input id="sgst" name="sgst" type="number" step="0.01" required onChange={(e) => setSgst(Number(e.target.value))} />
                      </div>
                    </>
                  )}

                  {taxType === 'intra-state' && (
                    <div className="space-y-2">
                      <Label htmlFor="igst">IGST (%)</Label>
                      <Input id="igst" name="igst" type="number" step="0.01" required onChange={(e) => setIgst(Number(e.target.value))} />
                    </div>
                  )}

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
                  <Button type="submit">Save Sale</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>GST #</TableHead>
              <TableHead>Supply Place</TableHead>
               <TableHead>Material</TableHead>
               <TableHead>HSN Code</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Taxable Amt</TableHead>
              <TableHead>Tax Type</TableHead>
              <TableHead className="text-right">CGST</TableHead>
              <TableHead className="text-right">SGST</TableHead>
              <TableHead className="text-right">IGST</TableHead>
              <TableHead className="text-right">Tax Amt</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outwardGoods.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.gstNumber}</TableCell>
                <TableCell>{item.placeOfSupply}</TableCell>
                <TableCell>{item.materialType}</TableCell>
                <TableCell>{item.hsnCode}</TableCell>
                <TableCell>{item.weight}</TableCell>
                <TableCell className="text-right">{item.taxableAmount}</TableCell>
                <TableCell>{item.taxType}</TableCell>
                <TableCell className="text-right">{item.cgst}</TableCell>
                <TableCell className="text-right">{item.sgst}</TableCell>
                <TableCell className="text-right">{item.igst}</TableCell>
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
