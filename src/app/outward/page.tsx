
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
import { useBankBalance } from '@/context/bank-balance-context';
import { useInventory } from '@/context/inventory-context';
import { Badge } from '@/components/ui/badge';

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
    taxableAmount: 1200,
    taxType: 'Inter-state' as const,
    cgst: 9,
    sgst: 9,
    igst: 0,
    materialType: 'Steel',
    weight: '1500 kg',
    hsnCode: '72044900',
    paymentStatus: 'Paid' as const,
  },
  {
    id: '2',
    invoiceNumber: 'SALE002',
    date: '2023-10-06',
    customer: 'Creative Alloys',
    gstNumber: '27FGHIJ5678K1Z4',
    placeOfSupply: 'Gujarat',
    taxableAmount: 2500,
    taxType: 'Intra-state' as const,
    cgst: 0,
    sgst: 0,
    igst: 18,
    materialType: 'Copper',
    weight: '300 kg',
    hsnCode: '74040010',
    paymentStatus: 'Unpaid' as const,
  },
];

type OutwardGood = {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  gstNumber: string;
  placeOfSupply: string;
  taxableAmount: number;
  taxType: 'Inter-state' | 'Intra-state';
  cgst: number;
  sgst: number;
  igst: number;
  materialType: string;
  weight: string;
  hsnCode: string;
  paymentStatus: 'Paid' | 'Unpaid';
};


export default function OutwardGoodsPage() {
  const [outwardGoods, setOutwardGoods] = useState<OutwardGood[]>(initialOutwardGoods);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OutwardGood | null>(null);

  const [taxableAmount, setTaxableAmount] = useState(0);
  const [taxType, setTaxType] = useState<'Inter-state' | 'Intra-state' | ''>('');
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const { updateBalance } = useBankBalance();
  const { decreaseInventory } = useInventory();

  const taxAmount = React.useMemo(() => {
    if (taxType === 'Inter-state') {
      return (taxableAmount * (cgst + sgst)) / 100;
    }
    if (taxType === 'Intra-state') {
      return (taxableAmount * igst) / 100;
    }
    return 0;
  }, [taxableAmount, taxType, cgst, sgst, igst]);

  const totalInvoiceValue = taxableAmount + taxAmount;

  const handleAddNewClick = () => {
    setEditingItem(null);
    setTaxableAmount(0);
    setTaxType('');
    setCgst(0);
    setSgst(0);
    setIgst(0);
    setOpen(true);
  };

  const handleEditClick = (item: OutwardGood) => {
    setEditingItem(item);
    setTaxableAmount(item.taxableAmount);
    setTaxType(item.taxType);
    setCgst(item.cgst);
    setSgst(item.sgst);
    setIgst(item.igst);
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paymentStatus = formData.get('paymentStatus') as 'Paid' | 'Unpaid';
    const weight = Number(formData.get('weight'));
    
    const newEntry: OutwardGood = {
      id: editingItem ? editingItem.id : String(outwardGoods.length + 1),
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      customer: formData.get('customer') as string,
      gstNumber: formData.get('gstNumber') as string,
      placeOfSupply: formData.get('placeOfSupply') as string,
      hsnCode: formData.get('hsnCode') as string,
      taxableAmount: taxableAmount,
      taxType: taxType as 'Inter-state' | 'Intra-state',
      cgst: taxType === 'Inter-state' ? cgst : 0,
      sgst: taxType === 'Inter-state' ? sgst : 0,
      igst: taxType === 'Intra-state' ? igst : 0,
      materialType: formData.get('materialType') as string,
      weight: `${weight} kg`,
      paymentStatus: paymentStatus,
    };

    if (editingItem) {
        // If status changed from Unpaid to Paid, update balance
        if(editingItem.paymentStatus === 'Unpaid' && newEntry.paymentStatus === 'Paid') {
            const currentTaxAmount = (newEntry.taxableAmount * (newEntry.cgst + newEntry.sgst + newEntry.igst)) / 100;
            const currentTotalValue = newEntry.taxableAmount + currentTaxAmount;
            updateBalance(currentTotalValue);
        }
        setOutwardGoods(outwardGoods.map(item => item.id === editingItem.id ? newEntry : item));
    } else {
        if(paymentStatus === 'Paid') {
            updateBalance(totalInvoiceValue);
        }
        setOutwardGoods([newEntry, ...outwardGoods]);
        decreaseInventory(newEntry.materialType, weight, 'GST');
    }

    setOpen(false);
    setEditingItem(null);
  };

  const handleExport = () => {
    const headers = [
      'Invoice #', 'Date', 'Customer', 'GST #', 'Supply Place',
      'Material', 'HSN Code', 'Weight', 'Taxable Amt', 'Tax Type', 'CGST', 'SGST', 'IGST',
      'Tax Amt', 'Total Value', 'Payment Status'
    ];
    const rows = outwardGoods.map(item => {
        const itemTaxAmount = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
        const itemTotalValue = item.taxableAmount + itemTaxAmount;
        return [
            item.invoiceNumber, item.date, item.customer, item.gstNumber, item.placeOfSupply,
            item.materialType, item.hsnCode, item.weight, `₹${item.taxableAmount.toFixed(2)}`, item.taxType,
            item.taxType === 'Inter-state' ? `${item.cgst}%` : '-', 
            item.taxType === 'Inter-state' ? `${item.sgst}%` : '-',
            item.taxType === 'Intra-state' ? `${item.igst}%` : '-',
            `₹${itemTaxAmount.toFixed(2)}`, `₹${itemTotalValue.toFixed(2)}`, item.paymentStatus
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    });

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Outward Goods</h2>
        <div className="flex w-full flex-col-reverse sm:flex-row md:w-auto items-center gap-2">
           <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Outward Entry' : 'Add New Outward Entry'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of the sale.' : 'Log a new sale of scrap material.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input id="invoiceNumber" name="invoiceNumber" defaultValue={editingItem?.invoiceNumber} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().substring(0, 10)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Name of Customer</Label>
                    <Input id="customer" name="customer" defaultValue={editingItem?.customer} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input id="gstNumber" name="gstNumber" defaultValue={editingItem?.gstNumber} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeOfSupply">Place of Supply</Label>
                    <Select name="placeOfSupply" required defaultValue={editingItem?.placeOfSupply}>
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
                    <Input id="materialType" name="materialType" defaultValue={editingItem?.materialType} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsnCode">HSN Code</Label>
                    <Input id="hsnCode" name="hsnCode" defaultValue={editingItem?.hsnCode} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" defaultValue={editingItem?.weight.replace(' kg', '')} required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="taxType">Tax Type</Label>
                     <Select name="taxType" required onValueChange={(value) => setTaxType(value as any)} defaultValue={editingItem?.taxType}>
                      <SelectTrigger id="taxType">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter-state">Inter-state</SelectItem>
                        <SelectItem value="Intra-state">Intra-state</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="taxableAmount">Taxable Amount (₹)</Label>
                    <Input id="taxableAmount" name="taxableAmount" type="number" step="0.01" required
                      value={taxableAmount}
                      onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    />
                  </div>

                  {taxType === 'Inter-state' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cgst">CGST (%)</Label>
                        <Input id="cgst" name="cgst" type="number" step="0.01" required value={cgst} onChange={(e) => setCgst(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sgst">SGST (%)</Label>
                        <Input id="sgst" name="sgst" type="number" step="0.01" required value={sgst} onChange={(e) => setSgst(Number(e.target.value))} />
                      </div>
                    </>
                  )}

                  {taxType === 'Intra-state' && (
                    <div className="space-y-2">
                      <Label htmlFor="igst">IGST (%)</Label>
                      <Input id="igst" name="igst" type="number" step="0.01" required value={igst} onChange={(e) => setIgst(Number(e.target.value))} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="taxAmount">Tax Amount (₹)</Label>
                    <Input id="taxAmount" name="taxAmount" type="number" step="0.01" value={taxAmount.toFixed(2)} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                     <Select name="paymentStatus" required defaultValue={editingItem?.paymentStatus || 'Unpaid'}>
                      <SelectTrigger id="paymentStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="totalInvoiceValue">Total Invoice Value (₹)</Label>
                    <Input id="totalInvoiceValue" name="totalInvoiceValue" type="number" step="0.01" value={totalInvoiceValue.toFixed(2)} disabled />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingItem ? 'Save Changes' : 'Save Sale'}</Button>
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
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>GST #</TableHead>
               <TableHead>Material</TableHead>
               <TableHead>Weight</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outwardGoods.map(item => {
                const itemTaxAmount = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
                const itemTotalValue = item.taxableAmount + itemTaxAmount;
              return (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">{item.invoiceNumber}</TableCell>
                <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                <TableCell className="whitespace-nowrap">{item.customer}</TableCell>
                <TableCell>{item.gstNumber}</TableCell>
                <TableCell>{item.materialType}</TableCell>
                <TableCell className="whitespace-nowrap">{item.weight}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">₹{itemTotalValue.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.paymentStatus === 'Paid' ? 'default' : 'destructive'}
                    className={`${item.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}
                  >
                    {item.paymentStatus}
                  </Badge>
                </TableCell>
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
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    