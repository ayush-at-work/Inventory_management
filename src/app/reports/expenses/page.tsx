
"use client";

import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useGst } from '@/context/gst-context';
import { useExpenses } from '@/context/expenses-context';
import { useCashInward } from '@/context/cash-inward-context';
import { useLabour } from '@/context/labour-context';

type CombinedExpense = {
    date: string;
    type: 'GST Purchase' | 'Cash Purchase' | 'General Expense' | 'Labour Wage';
    description: string;
    amount: number;
};

export default function ExpenseReportPage() {
    const { inwardGoods: gstPurchases } = useGst();
    const { inwardGoods: cashPurchases } = useCashInward();
    const { expenses: generalExpenses } = useExpenses();
    const { labourers, attendanceRecords } = useLabour();

    const combinedExpenses = useMemo(() => {
        const allExpenses: CombinedExpense[] = [];
        const labourerMap = new Map(labourers.map(l => [l.id, l.name]));

        gstPurchases.forEach(item => {
            allExpenses.push({
                date: item.date,
                type: 'GST Purchase',
                description: `Purchase from ${item.supplier} - Inv #${item.invoiceNumber}`,
                amount: item.totalInvoiceValue
            });
        });

        cashPurchases.forEach(item => {
            allExpenses.push({
                date: item.date,
                type: 'Cash Purchase',
                description: `Purchase from ${item.supplier} - Bill #${item.invoiceNumber}`,
                amount: item.totalValue
            });
        });

        generalExpenses.forEach(item => {
            allExpenses.push({
                date: item.date,
                type: 'General Expense',
                description: `${item.category} - ${item.description}`,
                amount: item.amount
            });
        });

        attendanceRecords.forEach(item => {
            if (item.wages > 0) {
                 allExpenses.push({
                    date: item.date,
                    type: 'Labour Wage',
                    description: `Wages for ${labourerMap.get(item.labourerId) || 'Unknown'}`,
                    amount: item.wages
                });
            }
        });


        return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [gstPurchases, cashPurchases, generalExpenses, attendanceRecords, labourers]);

    const totalExpenses = combinedExpenses.reduce((sum, item) => sum + item.amount, 0);

    const handleExport = () => {
        const headers = ['Date', 'Type', 'Description', 'Amount'];
        const rows = combinedExpenses.map(item =>
            [item.date, item.type, `"${item.description.replace(/"/g, '""')}"`, item.amount.toFixed(2)].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expense_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Expense Report</h2>
                </div>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Expenses</CardTitle>
                    <CardDescription>
                        A comprehensive list of all business expenses recorded in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                       {combinedExpenses.length > 0 ? (
                            combinedExpenses.map((item, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <p className="font-bold text-lg">{item.type}</p>
                                        <p className="text-sm text-muted-foreground">{item.date}</p>
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
                    <div className="rounded-md border hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinedExpenses.length > 0 ? (
                                    combinedExpenses.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                                            <TableCell className="font-medium">{item.type}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right font-medium">₹{item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No expenses recorded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-end items-center mt-4">
                        <p className="text-lg font-bold">Total Expenses: <span className="text-destructive">₹{totalExpenses.toFixed(2)}</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    