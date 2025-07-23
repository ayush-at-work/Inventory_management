
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Banknote, MinusCircle, PlusCircle, Receipt, DollarSign } from 'lucide-react';
import { InventoryChart } from '@/components/dashboard/inventory-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const summaryData = [
  {
    title: 'Total Revenue',
    value: '₹45,231.89',
    change: '+20.1% from last month',
    icon: Banknote,
  },
  {
    title: 'Total Inventory',
    value: '12,500 kg',
    change: '+1.5% from last month',
    icon: PlusCircle,
  },
  {
    title: 'Total Expenses',
    value: '₹12,234.50',
    change: '+12.1% from last month',
    icon: MinusCircle,
  },
  {
    title: 'Profit',
    value: '₹32,997.39',
    change: '+23.4% from last month',
    icon: Receipt,
  },
];

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
         <Link href="/cash-inward">
            <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" /> Go to Cash Deals
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
