
"use client";

import { useState, useEffect } from 'react';
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
import { useInventory, InventoryItem } from '@/context/inventory-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const InventoryTable = ({ items, onEdit, showHsnCode }: { items: InventoryItem[], onEdit: (item: InventoryItem) => void, showHsnCode: boolean }) => {
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
        <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Type</TableHead>
              {showHsnCode && <TableHead>HSN Code</TableHead>}
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price / Unit</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Estimated Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => {
              const status = getStockLevel(item.quantity, item.unit);
              return (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">{item.materialType}</TableCell>
                {showHsnCode && <TableCell>{item.hsnCode}</TableCell>}
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
                      <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    )
}

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem } = useInventory();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formTransactionType, setFormTransactionType] = useState<'GST' | 'Cash'>('GST');

  useEffect(() => {
    if (editingItem) {
      setFormTransactionType(editingItem.transactionType);
    } else {
      setFormTransactionType('GST');
    }
  }, [editingItem, open]);

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

    const entry: Omit<InventoryItem, 'id'> = {
      materialType: formData.get('materialType') as string,
      hsnCode: formData.get('hsnCode') as string,
      quantity: quantity,
      unit: formData.get('unit') as string,
      price: price,
      value: value,
      transactionType: formData.get('transactionType') as 'GST' | 'Cash',
    };

    if (editingItem) {
      updateInventoryItem(editingItem.id, entry);
    } else {
      addInventoryItem(entry);
    }
    
    setEditingItem(null);
    setOpen(false);
  };

  const gstInventory = inventory.filter(item => item.transactionType === 'GST');
  const cashInventory = inventory.filter(item => item.transactionType === 'Cash');

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
                    <Label className="text-right">
                      Type
                    </Label>
                    <RadioGroup 
                        name="transactionType" 
                        value={formTransactionType}
                        onValueChange={(value) => setFormTransactionType(value as 'GST' | 'Cash')}
                        className="col-span-3 flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="GST" id="r-gst" />
                            <Label htmlFor="r-gst">GST</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Cash" id="r-cash" />
                            <Label htmlFor="r-cash">Cash</Label>
                        </div>
                    </RadioGroup>
                  </div>

                  {formTransactionType === 'GST' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hsnCode" className="text-right">
                        HSN Code
                        </Label>
                        <Input id="hsnCode" name="hsnCode" className="col-span-3" defaultValue={editingItem?.hsnCode} />
                    </div>
                  )}

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
      
      <Tabs defaultValue="gst" className="space-y-4">
        <TabsList>
            <TabsTrigger value="gst">GST Inventory</TabsTrigger>
            <TabsTrigger value="cash">Cash Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="gst" className="space-y-4">
            <InventoryTable items={gstInventory} onEdit={handleEditClick} showHsnCode={true} />
        </TabsContent>
        <TabsContent value="cash" className="space-y-4">
            <InventoryTable items={cashInventory} onEdit={handleEditClick} showHsnCode={false} />
        </TabsContent>
      </Tabs>


    </div>
  );
}
