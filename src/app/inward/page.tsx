
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
import { useGst, GstInward } from '@/context/gst-context';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

export default function InwardGoodsPage() {
  const { inwardGoods, addInwardGood, deleteInwardGood } = useGst();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GstInward | null>(null);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [taxType, setTaxType] = useState<'inter-state' | 'intra-state' | ''>('');
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [tcs, setTcs] = useState(0);
  
  const taxAmount = React.useMemo(() => {
    if (taxType === 'inter-state') {
      return (taxableAmount * (cgst + sgst)) / 100;
    }
    if (taxType === 'intra-state') {
      return (taxableAmount * igst) / 100;
    }
    return 0;
  }, [taxableAmount, taxType, cgst, sgst, igst]);

  const totalInvoiceValue = taxableAmount + taxAmount + tcs;
  
  const handleAddNewClick = () => {
    setEditingItem(null);
    setTaxableAmount(0);
    setTaxType('');
    setCgst(0);
    setSgst(0);
    setIgst(0);
    setTcs(0);
    setOpen(true);
  };
  
  const handleEditClick = (item: GstInward) => {
    setEditingItem(item);
    setTaxableAmount(item.taxableAmount);
    setTaxType(item.taxType);
    setCgst(item.cgst);
    setSgst(item.sgst);
    setIgst(item.igst);
    setTcs(item.tcs);
    setOpen(true);
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const weight = Number(formData.get('weight'));
    
    const newEntry: Omit<GstInward, 'id'> = {
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      supplier: formData.get('supplier') as string,
      gstNumber: formData.get('gstNumber') as string,
      placeOfSupply: formData.get('placeOfSupply') as string,
      hsnCode: formData.get('hsnCode') as string,
      taxableAmount: taxableAmount,
      taxType: taxType as 'inter-state' | 'intra-state',
      cgst: taxType === 'inter-state' ? cgst : 0,
      sgst: taxType === 'inter-state' ? sgst : 0,
      igst: taxType === 'intra-state' ? igst : 0,
      taxAmount: taxAmount,
      totalInvoiceValue: totalInvoiceValue,
      materialType: formData.get('materialType') as string,
      weight: weight,
      tcs: tcs,
    };
    
    // Note: Update logic is not implemented yet. This will always add.
    addInwardGood(newEntry);

    setOpen(false);
    // Reset form state
    setEditingItem(null);
    setTaxableAmount(0);
    setTaxType('');
    setCgst(0);
    setSgst(0);
    setIgst(0);
    setTcs(0);
  };
  
  const handleDeleteClick = (id: string) => {
    deleteInwardGood(id);
  }

  const handleExport = () => {
    const headers = [
      'Invoice #', 'Date', 'Supplier', 'GST #', 'Supply Place',
      'Material', 'HSN Code', 'Weight', 'Taxable Amt', 'Tax Type', 'CGST', 'SGST', 'IGST',
      'Tax Amt', 'TCS', 'Total Value'
    ];
    const rows = inwardGoods.map(item => [
      item.invoiceNumber, item.date, item.supplier, item.gstNumber, item.placeOfSupply,
      item.materialType, item.hsnCode, `${item.weight} kg`, `₹${item.taxableAmount.toFixed(2)}`, item.taxType,
      item.cgst > 0 ? `${item.cgst}%` : '-',
      item.sgst > 0 ? `${item.sgst}%` : '-',
      item.igst > 0 ? `${item.igst}%` : '-',
      `₹${item.taxAmount.toFixed(2)}`,
      `₹${item.tcs.toFixed(2)}`,
      `₹${item.totalInvoiceValue.toFixed(2)}`
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(',') + "\n"
      + rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inward_goods.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Inward Goods</h2>
        <div className="flex w-full flex-col-reverse sm:flex-row md:w-auto items-center gap-2">
           <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Inward Entry' : 'Add New Inward Entry'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of the incoming scrap material.' : 'Log a new batch of incoming scrap material.'}
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
                    <Label htmlFor="supplier">Name of Supplier</Label>
                    <Input id="supplier" name="supplier" defaultValue={editingItem?.supplier} required />
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
                    <Input id="weight" name="weight" type="number" defaultValue={editingItem?.weight} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxType">Tax Type</Label>
                     <Select name="taxType" required onValueChange={(value) => setTaxType(value as any)} value={taxType}>
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
                    <Label htmlFor="taxableAmount">Taxable Amount (₹)</Label>
                    <Input id="taxableAmount" name="taxableAmount" type="number" step="0.01" required 
                      value={taxableAmount}
                      onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    />
                  </div>

                  {taxType === 'inter-state' && (
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

                  {taxType === 'intra-state' && (
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
                        <Label htmlFor="tcs">TCS (₹)</Label>
                        <Input id="tcs" name="tcs" type="number" step="0.01" value={tcs} onChange={(e) => setTcs(Number(e.target.value))} />
                    </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="totalInvoiceValue">Total Invoice Value (₹)</Label>
                    <Input id="totalInvoiceValue" name="totalInvoiceValue" type="number" step="0.01" value={totalInvoiceValue.toFixed(2)} disabled />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingItem ? 'Save Changes' : 'Save Entry'}</Button>
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
              <TableHead>Supplier</TableHead>
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
              <TableHead className="text-right">TCS</TableHead>
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
                    <TableCell>{item.gstNumber}</TableCell>
                    <TableCell>{item.placeOfSupply}</TableCell>
                    <TableCell>{item.materialType}</TableCell>
                    <TableCell>{item.hsnCode}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.weight} kg</TableCell>
                    <TableCell className="text-right whitespace-nowrap">₹{item.taxableAmount.toFixed(2)}</TableCell>
                    <TableCell>{item.taxType}</TableCell>
                    <TableCell className="text-right">{item.cgst > 0 ? `${item.cgst}%` : '-'}</TableCell>
                    <TableCell className="text-right">{item.sgst > 0 ? `${item.sgst}%` : '-'}</TableCell>
                    <TableCell className="text-right">{item.igst > 0 ? `${item.igst}%` : '-'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">₹{item.taxAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">₹{item.tcs.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">₹{item.totalInvoiceValue.toFixed(2)}</TableCell>
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
                                and reverse its impact on your bank balance and inventory.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClick(item.id)}>Continue</AlertDialogAction>
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
                    <TableCell colSpan={17} className="h-24 text-center">
                        No inward goods recorded yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
