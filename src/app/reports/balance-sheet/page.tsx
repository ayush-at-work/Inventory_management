
"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBankBalance } from '@/context/bank-balance-context';
import { useCashBalance } from '@/context/cash-balance-context';
import { Scale } from 'lucide-react';
import { useGst } from '@/context/gst-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfToday, getYear, subYears, startOfYear, endOfYear } from 'date-fns';
import { useExpenses } from '@/context/expenses-context';

export default function BalanceSheetPage() {
    const today = endOfToday();
    const currentFinancialYearStart = getYear(today) - (today.getMonth() < 3 ? 1 : 0);
    
    const [selectedYear, setSelectedYear] = useState<string>(String(currentFinancialYearStart));

    const { inventory } = useInventory();
    const { balance: currentBankBalance } = useBankBalance();
    const { balance: currentCashBalance } = useCashBalance();
    const { inwardGoods: allInward, outwardGoods: allOutward } = useGst();
    const { expenses: allExpenses } = useExpenses();

    const selectedEndDate = useMemo(() => {
        const year = parseInt(selectedYear);
        // Financial year ends on March 31st
        return new Date(year + 1, 2, 31);
    }, [selectedYear]);

    const { assets, liabilities, totalAssets, totalLiabilities } = useMemo(() => {
        const isCurrent = selectedYear === String(currentFinancialYearStart);

        if (isCurrent) {
             const currentInventoryValue = inventory.reduce((acc, item) => acc + item.value, 0);
             const currentAssets = [
                { name: 'Cash Balance', value: currentCashBalance },
                { name: 'Bank Balance', value: currentBankBalance },
                { name: 'Inventory Value', value: currentInventoryValue },
            ];
            
            const accountsReceivable = allOutward
                .filter(sale => sale.paymentStatus === 'Unpaid')
                .reduce((acc, sale) => {
                    const tax = (sale.taxableAmount * (sale.cgst + sale.sgst + sale.igst)) / 100;
                    return acc + sale.taxableAmount + tax;
                }, 0);
            
            const currentLiabilities = [{ name: 'Accounts Receivable (Unpaid Invoices)', value: accountsReceivable }];
            const currentTotalAssets = currentAssets.reduce((sum, asset) => sum + asset.value, 0);
            const currentTotalLiabilities = currentLiabilities.reduce((sum, liability) => sum + liability.value, 0);

            return { assets: currentAssets, liabilities: currentLiabilities, totalAssets: currentTotalAssets, totalLiabilities: currentTotalLiabilities };
        }
        
        // --- Historical Calculation ---
        let historicalBankBalance = currentBankBalance;
        let historicalCashBalance = 0; // Simplified - cash txns are not in a global context
        let historicalInventory = [...inventory]; // Deep copy would be better in a real scenario

        // Roll back bank transactions after the selected end date
        allInward.forEach(t => {
            if (new Date(t.date) > selectedEndDate) historicalBankBalance += t.totalInvoiceValue;
        });
        allOutward.forEach(t => {
            if (new Date(t.date) > selectedEndDate && t.paymentStatus === 'Paid') {
                const tax = (t.taxableAmount * (t.cgst + t.sgst + t.igst)) / 100;
                historicalBankBalance -= (t.taxableAmount + tax);
            }
        });
        allExpenses.forEach(e => {
             if (new Date(e.date) > selectedEndDate) historicalBankBalance += e.amount; // Assuming paid from bank for simplicity
        });

        // This is a simplification. A real inventory ledger would be needed for perfect accuracy.
        const historicalInventoryValue = 0; // Cannot accurately calculate historical inventory value with current data structure.

        const assets = [
            { name: 'Cash Balance (at year end)', value: historicalCashBalance },
            { name: 'Bank Balance (at year end)', value: historicalBankBalance },
            { name: 'Inventory Value (at year end)', value: historicalInventoryValue },
        ];

        const accountsReceivable = allOutward
            .filter(sale => new Date(sale.date) <= selectedEndDate && sale.paymentStatus === 'Unpaid')
            .reduce((acc, sale) => {
                 const tax = (sale.taxableAmount * (sale.cgst + sale.sgst + sale.igst)) / 100;
                 return acc + sale.taxableAmount + tax;
            }, 0);
        
        const liabilities = [
             { name: 'Accounts Receivable (Unpaid Invoices)', value: accountsReceivable }
        ];

        const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
        const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);

        return { assets, liabilities, totalAssets, totalLiabilities };
    }, [selectedYear, inventory, currentBankBalance, currentCashBalance, allInward, allOutward, allExpenses, currentFinancialYearStart]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Scale className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Balance Sheet</h2>
                </div>
                 <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select Financial Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={String(currentFinancialYearStart)}>Current (Live View)</SelectItem>
                        <SelectItem value={String(currentFinancialYearStart - 1)}>Financial Year {currentFinancialYearStart - 1}-{currentFinancialYearStart}</SelectItem>
                        <SelectItem value={String(currentFinancialYearStart - 2)}>Financial Year {currentFinancialYearStart - 2}-{currentFinancialYearStart - 1}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Financial Snapshot</CardTitle>
                    <CardDescription>
                        A summary of your company's assets and liabilities as of 
                        {selectedYear === String(currentFinancialYearStart) ? ' today' : ` March 31, ${parseInt(selectedYear) + 1}`}.
                        <br/>
                        <span className="text-xs text-muted-foreground/80">Note: Historical inventory value is not yet supported and will show as zero.</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-primary">Assets</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => (
                                        <TableRow key={asset.name}>
                                            <TableCell className="font-medium">{asset.name}</TableCell>
                                            <TableCell className="text-right">₹{asset.value.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium text-destructive">Liabilities & Equity</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Liability / Equity</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {liabilities.map((liability) => (
                                        <TableRow key={liability.name}>
                                            <TableCell className="font-medium">{liability.name}</TableCell>
                                            <TableCell className="text-right">₹{liability.value.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                         <TableCell>Owner's Equity (Assets - Liabilities)</TableCell>
                                         <TableCell className="text-right">₹{(totalAssets - totalLiabilities).toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
                 <CardContent>
                    <div className="rounded-md border bg-background text-card-foreground shadow-sm">
                        <Table>
                            <TableHeader>
                                 <TableRow className="bg-primary/10">
                                    <TableHead className="text-lg font-bold text-primary">Total Assets</TableHead>
                                    <TableHead className="text-right text-lg font-bold text-primary">₹{totalAssets.toFixed(2)}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="bg-primary/10">
                                    <TableCell className="text-lg font-bold text-primary">Total Liabilities & Equity</TableCell>
                                    <TableCell className="text-right text-lg font-bold text-primary">₹{(totalLiabilities + (totalAssets - totalLiabilities)).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
