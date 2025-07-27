
"use client";

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart } from 'lucide-react';
import { useGst } from '@/context/gst-context';
// Note: We cannot get cash outward data here as it's local to that page.
// A better implementation would use a global context for all transactions.

type CombinedSale = {
    date: string;
    invoiceNumber: string;
    customer: string;
    type: 'GST' | 'Cash';
    amount: number;
    status: 'Paid' | 'Unpaid';
};

export default function SalesReportPage() {
    const { outwardGoods: gstSales } = useGst();
    
    // We would combine cash sales here if the context was global.
    const combinedSales = useMemo(() => {
        const gstSalesFormatted: CombinedSale[] = gstSales.map(sale => {
            const tax = (sale.taxableAmount * (sale.cgst + sale.sgst + sale.igst)) / 100;
            const totalValue = sale.taxableAmount + tax;
            return {
                date: sale.date,
                invoiceNumber: sale.invoiceNumber,
                customer: sale.customer,
                type: 'GST',
                amount: totalValue,
                status: sale.paymentStatus
            };
        });

        // cashSalesFormatted would be created and combined here
        
        return gstSalesFormatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [gstSales]);

    const totalRevenue = combinedSales
        .filter(sale => sale.status === 'Paid')
        .reduce((sum, sale) => sum + sale.amount, 0);

    const handleExport = () => {
        const headers = ['Date', 'Invoice #', 'Customer', 'Type', 'Amount', 'Status'];
        const rows = combinedSales.map(item => 
            [item.date, item.invoiceNumber, `"${item.customer.replace(/"/g, '""')}"`, item.type, item.amount.toFixed(2), item.status].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <BarChart className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Sales Report</h2>
                </div>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Sales</CardTitle>
                    <CardDescription>
                        A comprehensive list of all sales transactions recorded in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinedSales.length > 0 ? (
                                    combinedSales.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                                            <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                                            <TableCell>{item.customer}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'Paid' ? 'default' : 'destructive'}
                                                    className={`${item.status === 'Paid' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">₹{item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No sales recorded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex justify-end items-center mt-4">
                        <p className="text-lg font-bold">Total Revenue (Paid): <span className="text-primary">₹{totalRevenue.toFixed(2)}</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
