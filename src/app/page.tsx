
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Banknote, MinusCircle, PlusCircle, Receipt, IndianRupee } from 'lucide-react';
import { InventoryChart } from '@/components/dashboard/inventory-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/context/inventory-context';
import { useBankBalance } from '@/context/bank-balance-context';
import { useCashBalance } from '@/context/cash-balance-context';
import { useEffect, useState } from 'react';

export default function Home() {
    const { inventory } = useInventory();
    const { balance: bankBalance } = useBankBalance();
    const { balance: cashBalance } = useCashBalance();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const totalInventoryValue = inventory.reduce((acc, item) => acc + item.value, 0);
    const totalInventoryWeight = inventory.reduce((acc, item) => {
        // Assuming all weights are in kg for simplicity
        if (item.unit.toLowerCase() === 'kg') {
            return acc + item.quantity;
        }
        return acc;
    }, 0);

    // Note: These are placeholders. You'd need to calculate revenue and expenses
    // from your transaction data for a real implementation.
    const totalRevenue = 0; 
    const totalExpenses = 0;
    const profit = totalRevenue - totalExpenses;

    const summaryData = [
    {
        title: 'Total Revenue',
        value: `₹${totalRevenue.toLocaleString()}`,
        change: '',
        icon: Banknote,
    },
    {
        title: 'Total Inventory Value',
        value: `₹${totalInventoryValue.toLocaleString()}`,
        change: `${totalInventoryWeight.toLocaleString()} kg`,
        icon: PlusCircle,
    },
    {
        title: 'Total Expenses',
        value: `₹${totalExpenses.toLocaleString()}`,
        change: '',
        icon: MinusCircle,
    },
    {
        title: 'Profit',
        value: `₹${profit.toLocaleString()}`,
        change: '',
        icon: Receipt,
    },
    ];

    if (!isMounted) {
        return null;
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
         <Link href="/cash-inward">
            <Button variant="outline">
                <IndianRupee className="mr-2 h-4 w-4" /> Go to Cash Deals
            </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map(item => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="col-span-full lg:col-span-3">
          <Link href="/inventory" className="cursor-pointer">
            <InventoryChart />
          </Link>
        </div>
      </div>
    </div>
  );
}

    