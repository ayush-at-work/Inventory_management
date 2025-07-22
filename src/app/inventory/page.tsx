
"use client";

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const initialInventoryData = [
  {
    id: '1',
    materialType: 'Copper',
    quantity: 5200,
    unit: 'kg',
    price: 7,
    value: 36400,
    hsnCode: '74040010',
  },
  {
    id: '2',
    materialType: 'Steel',
    quantity: 25000,
    unit: 'kg',
    price: 0.4,
    value: 10000,
    hsnCode: '72044900',
  },
  {
    id: '3',
    materialType: 'Aluminum',
    quantity: 8500,
    unit: 'kg',
    price: 1.5,
    value: 12750,
    hsnCode: '76020010',
  },
  {
    id: '4',
    materialType: 'Brass',
    quantity: 1500,
    unit: 'kg',
    price: 4,
    value: 6000,
    hsnCode: '74040022',
  },
  {
    id: '5',
    materialType: 'Lead',
    quantity: 900,
    unit: 'kg',
    price: 2,
    value: 1800,
    hsnCode: '78020010',
  },
  {
    id: '6',
    materialType: 'Zinc',
    quantity: 3200,
    unit: 'kg',
    price: 2.5,
    value: 8000,
    hsnCode: '79020010',
  },
  {
    id: '7',
    materialType: 'Used Batteries',
    quantity: 500,
    unit: 'NOS',
    price: 10,
    value: 5000,
    hsnCode: '85481020',
  },
];

type InventoryItem = typeof initialInventoryData[0];


export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventoryData);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingItem(null);
    setOpen(true);
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const price = Number(formData.get('price'));
    const value = quantity * price;

    const entry: InventoryItem = {
      id: editingItem ? editingItem.id : String(inventory.length + 1),
      materialType: formData.get('materialType') as string,
      hsnCode: formData.get('hsnCode') as string,
      quantity: quantity,
      unit: formData.get('unit') as string,
      price: price,
      value: value
    };

    if (editingItem) {
      setInventory(inventory.map(item => item.id === editingItem.id ? entry : item));
    } else {
      setInventory([entry, ...inventory]);
    }
    
    setEditingItem(null);
    setOpen(false);
  };

  const getStockLevel = (quantity: number, unit: string) => {
    if (unit === 'kg') {
      if (quantity > 10000) return 'High';
      if (quantity > 2000) return 'Medium';
      return 'Low';
    }
    // Assuming NOS
    if (quantity > 100) return 'High';
    if (quantity > 20) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <div className="flex w-full md:w-auto items-center gap-2">
           <Input placeholder="Search materials..." className="w-full max-w-sm" />
           <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                   <DialogDescription>
                    {editingItem ? 'Update the details of your inventory item.' : 'Add a new item to your inventory.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="materialType" className="text-right">
                      Material
                    </Label>
                    <Input id="materialType" name="materialType" className="col-span-3" defaultValue={editingItem?.materialType} required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hsnCode" className="text-right">
                      HSN Code
                    </Label>
                    <Input id="hsnCode" name="hsnCode" className="col-span-3" defaultValue={editingItem?.hsnCode} required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input id="quantity" name="quantity" type="number" className="col-span-3" defaultValue={editingItem?.quantity} required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                     <Select name="unit" required defaultValue={editingItem?.unit || 'kg'}>
                      <SelectTrigger className="col-span-3" id="unit">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="NOS">NOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price/Unit (₹)
                    </Label>
                    <Input id="price" name="price" type="number" step="0.01" className="col-span-3" defaultValue={editingItem?.price} required />
                  </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
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
              <TableHead>Material Type</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price / Unit</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Estimated Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map(item => {
              const status = getStockLevel(item.quantity, item.unit);
              return (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">{item.materialType}</TableCell>
                <TableCell>{item.hsnCode}</TableCell>
                <TableCell>{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right whitespace-nowrap">₹{item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      status === 'High'
                        ? 'default'
                        : status === 'Medium'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={`${status === 'High' ? 'bg-green-500/20 text-green-700' : status === 'Medium' ? 'bg-yellow-500/20 text-yellow-700' : 'bg-red-500/20 text-red-700'}`}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium whitespace-nowrap">
                  ₹{item.value.toLocaleString()}
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
