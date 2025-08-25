
"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, ShoppingCart, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePurchaseOrders, PurchaseOrder, PurchaseOrderItem } from '@/context/purchase-order-context';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function PurchaseOrdersPage() {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus } = usePurchaseOrders();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<Omit<PurchaseOrderItem, 'id'>[]>([]);

  const handleAddNewClick = () => {
    setEditingItem(null);
    setItems([{ materialType: '', quantity: 1, unit: 'kg', price: 0 }]);
    setOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { materialType: '', quantity: 1, unit: 'kg', price: 0 }]);
  };
  
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'id'>, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newOrder: Omit<PurchaseOrder, 'id' | 'items' | 'totalValue'> = {
      poNumber: formData.get('poNumber') as string,
      supplier: formData.get('supplier') as string,
      orderDate: formData.get('orderDate') as string,
      expectedDate: formData.get('expectedDate') as string,
      status: 'Pending',
    };

    addPurchaseOrder(newOrder, items);
    
    setOpen(false);
    setEditingItem(null);
  };
  
  const getStatusVariant = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Partially Received':
        return 'default';
      case 'Received':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusColor = (status: PurchaseOrder['status']) => {
     switch (status) {
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'Partially Received':
        return 'bg-blue-500/20 text-blue-700';
      case 'Received':
        return 'bg-green-500/20 text-green-700';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create PO
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Create'} Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
              <ScrollArea className="flex-grow pr-6 -mr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number</Label>
                  <Input id="poNumber" name="poNumber" defaultValue={editingItem?.poNumber} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" name="supplier" defaultValue={editingItem?.supplier} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input id="orderDate" name="orderDate" type="date" defaultValue={editingItem?.orderDate || new Date().toISOString().substring(0, 10)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Delivery</Label>
                  <Input id="expectedDate" name="expectedDate" type="date" defaultValue={editingItem?.expectedDate} />
                </div>
              </div>

              <div className="space-y-4 py-4">
                <h3 className="text-lg font-medium">Items</h3>
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-md">
                     <div className="col-span-5 space-y-1">
                        <Label htmlFor={`material-${index}`}>Material</Label>
                        <Input id={`material-${index}`} value={item.materialType} onChange={e => handleItemChange(index, 'materialType', e.target.value)} />
                     </div>
                     <div className="col-span-2 space-y-1">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input id={`quantity-${index}`} type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
                     </div>
                     <div className="col-span-2 space-y-1">
                        <Label htmlFor={`unit-${index}`}>Unit</Label>
                         <Select value={item.unit} onValueChange={value => handleItemChange(index, 'unit', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="NOS">NOS</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="col-span-2 space-y-1">
                        <Label htmlFor={`price-${index}`}>Price/Unit</Label>
                        <Input id={`price-${index}`} type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} />
                     </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                     </div>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>

              </ScrollArea>
              <DialogFooter className="flex-shrink-0 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">{editingItem ? 'Save Changes' : 'Create Purchase Order'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Mobile View */}
       <div className="md:hidden space-y-4">
        {purchaseOrders.length > 0 ? (
          purchaseOrders.map(po => (
            <Card key={po.id}>
              <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{po.supplier}</p>
                      <p className="text-sm text-muted-foreground">PO-{po.poNumber}</p>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { /* Edit logic */ }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePurchaseOrderStatus(po.id, 'Received')}>Mark as Received</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePurchaseOrderStatus(po.id, 'Cancelled')} className="text-destructive">Cancel PO</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Order Date:</strong> {po.orderDate}</p>
                <p className="text-sm"><strong>Expected:</strong> {po.expectedDate || 'N/A'}</p>
                <ul className="text-sm list-disc pl-5 pt-1">
                  {po.items.map(item => (
                    <li key={item.id}>{item.quantity} {item.unit} of {item.materialType}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                 <Badge variant={getStatusVariant(po.status)} className={getStatusColor(po.status)}>{po.status}</Badge>
                 <p className="text-lg font-bold">₹{po.totalValue.toFixed(2)}</p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">No purchase orders created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View */}
      <div className="rounded-md border overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.length > 0 ? purchaseOrders.map(po => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.poNumber}</TableCell>
                <TableCell>{po.supplier}</TableCell>
                <TableCell>{po.orderDate}</TableCell>
                <TableCell>{po.expectedDate}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(po.status)} className={getStatusColor(po.status)}>{po.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">₹{po.totalValue.toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { /* Edit logic */ }}>Edit</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => updatePurchaseOrderStatus(po.id, 'Received')}>Mark as Received</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => updatePurchaseOrderStatus(po.id, 'Cancelled')} className="text-destructive">Cancel PO</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
               <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No purchase orders created yet.
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
