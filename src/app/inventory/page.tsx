import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const inventoryData = [
  {
    materialType: 'Copper',
    quantity: 5200, // kg
    status: 'High',
    value: 36400,
  },
  {
    materialType: 'Steel',
    quantity: 25000,
    status: 'High',
    value: 10000,
  },
  {
    materialType: 'Aluminum',
    quantity: 8500,
    status: 'Medium',
    value: 12750,
  },
  {
    materialType: 'Brass',
    quantity: 1500,
    status: 'Low',
    value: 6000,
  },
  {
    materialType: 'Lead',
    quantity: 900,
    status: 'Low',
    value: 1800,
  },
  {
    materialType: 'Zinc',
    quantity: 3200,
    status: 'Medium',
    value: 8000,
  },
];

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <div className="w-full max-w-sm">
          <Input placeholder="Search materials..." />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Type</TableHead>
              <TableHead>Quantity (kg)</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Estimated Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map(item => (
              <TableRow key={item.materialType}>
                <TableCell className="font-medium">{item.materialType}</TableCell>
                <TableCell>{item.quantity.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'High'
                        ? 'default'
                        : item.status === 'Medium'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={`${item.status === 'High' ? 'bg-green-500/20 text-green-700' : item.status === 'Medium' ? 'bg-yellow-500/20 text-yellow-700' : 'bg-red-500/20 text-red-700'}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${item.value.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
