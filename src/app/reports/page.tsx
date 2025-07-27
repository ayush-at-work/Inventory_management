
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, TrendingUp, Scale, FileText, BarChart } from "lucide-react";
import Link from "next/link";
import { useMemo } from 'react';
import { useGst } from '@/context/gst-context';
import { useExpenses } from '@/context/expenses-context';
import { RevenueChart } from '@/components/dashboard/revenue-chart';

export default function ReportsPage() {
    const { inwardGoods, outwardGoods } = useGst();
    const { expenses } = useExpenses();
    // Not including cash and labour data as it's not globally available.

    const { totalRevenue, totalExpenses, profit } = useMemo(() => {
        const revenue = outwardGoods
            .filter(item => item.paymentStatus === 'Paid')
            .reduce((acc, item) => {
                const tax = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
                return acc + item.taxableAmount + tax;
            }, 0);

        const gstPurchases = inwardGoods.reduce((acc, item) => acc + item.totalInvoiceValue, 0);
        const generalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);

        const calculatedExpenses = gstPurchases + generalExpenses;
        const calculatedProfit = revenue - calculatedExpenses;
        
        return { totalRevenue: revenue, totalExpenses: calculatedExpenses, profit: calculatedProfit };
    }, [outwardGoods, inwardGoods, expenses]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Button>
            <Download className="mr-2 h-4 w-4" />
            Download P&L
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/reports/sales">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Report</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">View all sales transactions</p>
                    </CardContent>
                </Card>
            </Link>
            <Link href="/reports/expenses">
                 <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expense Report</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">View all purchases and expenses</p>
                    </CardContent>
                </Card>
            </Link>
            <Link href="/reports/balance-sheet">
                 <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance Sheet</CardTitle>
                        <Scale className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">View assets and liabilities</p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/reports/forecasting">
                 <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Demand Forecasting</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">AI-powered demand predictions</p>
                    </CardContent>
                </Card>
            </Link>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>
            Summary of GST revenues, costs, and expenses during the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-500/10 border-green-500/20">
                    <CardHeader>
                        <CardTitle className="text-green-700">Total Revenue</CardTitle>
                        <CardContent className="p-0 pt-2">
                            <p className="text-2xl font-bold text-green-800">₹{totalRevenue.toFixed(2)}</p>
                        </CardContent>
                    </CardHeader>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                    <CardHeader>
                        <CardTitle className="text-red-700">Total Expenses</CardTitle>
                         <CardContent className="p-0 pt-2">
                            <p className="text-2xl font-bold text-red-800">₹{totalExpenses.toFixed(2)}</p>
                        </CardContent>
                    </CardHeader>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Net Profit</CardTitle>
                         <CardContent className="p-0 pt-2">
                            <p className="text-2xl font-bold text-blue-800">₹{profit.toFixed(2)}</p>
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>
            <div>
              <RevenueChart />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
