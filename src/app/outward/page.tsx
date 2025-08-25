
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
import { PlusCircle, MoreHorizontal, Download, FileText, FileDown } from 'lucide-react';
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
import { useGst, GstOutward } from '@/context/gst-context';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

// Function to convert number to words
function numberToWords(num: number): string {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    function inWords(n: number): string {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + 'hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str;
    }

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let words = inWords(rupees) + 'rupees';
    if (paise > 0) {
        words += ' and ' + inWords(paise) + 'paise';
    }
    return words.replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


export default function OutwardGoodsPage() {
  const { outwardGoods, addOutwardGood, deleteOutwardGood } = useGst();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GstOutward | null>(null);

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

  const handleEditClick = (item: GstOutward) => {
    setEditingItem(item);
    setTaxableAmount(item.taxableAmount);
    setTaxType(item.taxType);
    setCgst(item.cgst);
    setSgst(item.sgst);
    setIgst(item.igst);
    setOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    deleteOutwardGood(id);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paymentStatus = formData.get('paymentStatus') as 'Paid' | 'Unpaid';
    const weight = Number(formData.get('weight'));
    
    const newEntry: Omit<GstOutward, 'id'> = {
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
      weight: weight,
      paymentStatus: paymentStatus,
    };

    if (editingItem) {
        // If status changed from Unpaid to Paid, update balance
        if(editingItem.paymentStatus === 'Unpaid' && newEntry.paymentStatus === 'Paid') {
            const currentTaxAmount = (newEntry.taxableAmount * (newEntry.cgst + newEntry.sgst + newEntry.igst)) / 100;
            const currentTotalValue = newEntry.taxableAmount + currentTaxAmount;
            updateBalance(currentTotalValue);
        }
        // TODO: Update logic
        // setOutwardGoods(outwardGoods.map(item => item.id === editingItem.id ? newEntry : item));
    } else {
        addOutwardGood(newEntry);
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
            item.materialType, item.hsnCode, `${item.weight} kg`, `₹${item.taxableAmount.toFixed(2)}`, item.taxType,
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
    link.setAttribute("download", "sales_invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
    const handleDownloadPdf = (invoice: GstOutward) => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const taxAmount = (invoice.taxableAmount * (invoice.cgst + invoice.sgst + invoice.igst)) / 100;
        const totalValue = invoice.taxableAmount + taxAmount;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // --- Header ---
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Tax Invoice', pageWidth / 2, 20, { align: 'center' });

        // --- Bill From ---
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill From:', 14, 30);
        doc.setFont('helvetica', 'normal');
        doc.text('ScrapFlow Inc.', 14, 36);
        doc.text('123 Scrap Yard, Metal City, 110011', 14, 42);
        doc.text('GSTIN: 07ABCDE1234F1Z5', 14, 48);

        // --- Invoice Details ---
        doc.setFont('helvetica', 'bold');
        doc.text(`Invoice Number:`, 130, 30);
        doc.text(`Date:`, 130, 36);
        doc.text(`Payment Terms:`, 130, 42);
        doc.setFont('helvetica', 'normal');
        doc.text(`${invoice.invoiceNumber}`, 165, 30);
        doc.text(`${invoice.date}`, 165, 36);
        doc.text(`Due on receipt`, 165, 42);
        
        doc.setLineWidth(0.5);
        doc.line(14, 55, pageWidth - 14, 55);

        // --- Bill To & Ship To ---
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 14, 62);
        doc.text('Ship To:', 110, 62);

        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customer, 14, 68);
        doc.text(`GSTIN: ${invoice.gstNumber}`, 14, 74);
        doc.text(invoice.placeOfSupply, 14, 80);

        doc.text(invoice.customer, 110, 68);
        doc.text(invoice.placeOfSupply, 110, 74); // Using place of supply as shipping address for now

        doc.line(14, 90, pageWidth - 14, 90);

        // --- Items Table ---
        const tableColumn = ["Description of Goods", "HSN Code", "Quantity", "Price", "Taxable Value"];
        const tableRows = [];

        const rate = invoice.weight > 0 ? invoice.taxableAmount / invoice.weight : 0;
        tableRows.push([
            invoice.materialType,
            invoice.hsnCode,
            `${invoice.weight.toFixed(2)} kg`,
            `₹${rate.toFixed(2)}`,
            `₹${invoice.taxableAmount.toFixed(2)}`
        ]);
        
        doc.autoTable({
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74], textColor: 255 }, // Green header
        });

        // --- Totals Section ---
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        const rightAlign = pageWidth - 14;
        doc.setFontSize(10);
        
        doc.text('Subtotal:', 130, finalY);
        doc.text(`₹${invoice.taxableAmount.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
        finalY += 6;

        if (invoice.taxType === 'Inter-state') {
            const cgstAmount = (invoice.taxableAmount * invoice.cgst) / 100;
            const sgstAmount = (invoice.taxableAmount * invoice.sgst) / 100;
            doc.text(`CGST @ ${invoice.cgst}%:`, 130, finalY);
            doc.text(`₹${cgstAmount.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
            finalY += 6;
            doc.text(`SGST @ ${invoice.sgst}%:`, 130, finalY);
            doc.text(`₹${sgstAmount.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
            finalY += 6;
        } else {
            const igstAmount = (invoice.taxableAmount * invoice.igst) / 100;
            doc.text(`IGST @ ${invoice.igst}%:`, 130, finalY);
            doc.text(`₹${igstAmount.toFixed(2)}`, rightAlign, finalY, { align: 'right' });
            finalY += 6;
        }

        doc.setLineWidth(0.2);
        doc.line(125, finalY, rightAlign, finalY);
        finalY += 6;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Invoice Value:', 130, finalY);
        doc.text(`₹${totalValue.toFixed(2)}`, rightAlign, finalY, { align: 'right' });

        // --- Amount in Words ---
        finalY += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Amount in Words:', 14, finalY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${numberToWords(totalValue)} Only`, 14, finalY + 6);
        
        // --- Footer / Signature ---
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.line(14, pageHeight - 40, pageWidth - 14, pageHeight - 40);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('For ScrapFlow Inc.', rightAlign, pageHeight - 32, { align: 'right' });
        doc.text('Authorized Signatory', rightAlign, pageHeight - 15, { align: 'right' });
        
        doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Sales Invoices</h2>
        </div>
        <div className="flex w-full flex-col-reverse sm:flex-row md:w-auto items-center gap-2">
           <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of the sales invoice.' : 'Log a new sale and generate an invoice.'}
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
                    <Input id="weight" name="weight" type="number" defaultValue={editingItem?.weight} required />
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
                  <Button type="submit">{editingItem ? 'Save Changes' : 'Create Invoice'}</Button>
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
            {outwardGoods.length > 0 ? (
                outwardGoods.map(item => {
                    const itemTaxAmount = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
                    const itemTotalValue = item.taxableAmount + itemTaxAmount;
                return (
                <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">{item.invoiceNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.customer}</TableCell>
                    <TableCell>{item.gstNumber}</TableCell>
                    <TableCell>{item.materialType}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.weight} kg</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDownloadPdf(item)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download PDF
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this invoice
                                and reverse any impact on your bank balance and inventory.
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
                )})
            ) : (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                        No invoices recorded yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
