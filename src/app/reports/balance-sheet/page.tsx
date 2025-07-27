
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBankBalance } from '@/context/bank-balance-context';
import { useCashBalance } from '@/context/cash-balance-context';
import { Scale } from 'lucide-react';
import { useGst } from '@/context/gst-context';

export default function BalanceSheetPage() {
    const { inventory } = useInventory();
    const { balance: bankBalance } = useBankBalance();
    const { balance: cashBalance } = useCashBalance();
    const { outwardGoods } = useGst(); // Assuming unpaid invoices are liabilities (accounts receivable)

    const assets = useMemo(() => {
        const inventoryValue = inventory.reduce((acc, item) => acc + item.value, 0);
        return [
            { name: 'Cash Balance', value: cashBalance },
            { name: 'Bank Balance', value: bankBalance },
            { name: 'Inventory Value', value: inventoryValue },
        ];
    }, [cashBalance, bankBalance, inventory]);

    const liabilities = useMemo(() => {
        // Accounts Receivable (unpaid invoices) are technically assets, but for simplicity here we list things "owed to the company".
        // A true balance sheet would have a more complex structure (Assets = Liabilities + Equity)
        // This is a simplified financial snapshot.
        const accountsReceivable = outwardGoods
            .filter(sale => sale.paymentStatus === 'Unpaid')
            .reduce((acc, sale) => {
                 const tax = (sale.taxableAmount * (sale.cgst + sale.sgst + sale.igst)) / 100;
                 return acc + sale.taxableAmount + tax;
            }, 0);
        
        return [
             { name: 'Accounts Receivable (Unpaid Invoices)', value: accountsReceivable }
        ];
    }, [outwardGoods]);

    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Scale className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Balance Sheet</h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Financial Snapshot</CardTitle>
                    <CardDescription>A summary of your company's assets and liabilities.</CardDescription>
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
