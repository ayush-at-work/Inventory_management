"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Warehouse,
  FileText,
  Sparkles,
  Receipt,
  Package2,
  Landmark,
  Pencil,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useBankBalance } from '@/context/bank-balance-context';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inward', label: 'Inward Goods', icon: ArrowDownCircle },
  { href: '/outward', label: 'Outward Goods', icon: ArrowUpCircle },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/ai-pricing', label: 'AI Pricing', icon: Sparkles },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { balance, setBalance } = useBankBalance();
  const [newBalance, setNewBalance] = React.useState(balance);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setNewBalance(balance);
  }, [balance]);

  const handleSave = () => {
    setBalance(newBalance);
    setOpen(false);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Package2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">ScrapFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/10">
                <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-sidebar-foreground/80" />
                    <span className="text-sm font-medium">Bank Balance</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className="text-sm font-bold text-green-400">₹{balance.toLocaleString()}</span>
                   <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Pencil className="w-3 h-3 text-sidebar-foreground/80" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Bank Balance</DialogTitle>
                        <DialogDescription>
                          Update your current bank balance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="balance">New Balance (₹)</Label>
                        <Input
                          id="balance"
                          type="number"
                          value={newBalance}
                          onChange={(e) => setNewBalance(Number(e.target.value))}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
