import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, MinusCircle, PlusCircle, Receipt } from 'lucide-react';
import { InventoryChart } from '@/components/dashboard/inventory-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';

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

const recentTransactions = [
  {
    id: 'TXN001',
    type: 'Sale',
    material: 'Copper',
    amount: '+₹1,999.00',
    status: 'Completed',
  },
  {
    id: 'TXN002',
    type: 'Purchase',
    material: 'Aluminum',
    amount: '-₹39.00',
    status: 'Pending',
  },
  {
    id: 'TXN003',
    type: 'Sale',
    material: 'Steel',
    amount: '+₹299.00',
    status: 'Completed',
  },
  {
    id: 'TXN004',
    type: 'Purchase',
    material: 'Brass',
    amount: '-₹150.00',
    status: 'Completed',
  },
  {
    id: 'TXN005',
    type: 'Sale',
    material: 'Lead',
    amount: '+₹999.00',
    status: 'On Hold',
  },
];

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
          <InventoryChart />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A list of your most recent sales and purchases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.material}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === 'Completed'
                          ? 'default'
                          : transaction.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="bg-opacity-20"
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.amount.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
