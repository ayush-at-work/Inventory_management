
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ArrowDownCircle,
  Warehouse,
  FileText,
  Sparkles,
  Receipt,
  Package2,
  Landmark,
  Pencil,
  DollarSign,
  FileDigit,
  Coins,
  Users,
  ShoppingCart,
  UserCog,
  Settings,
  TrendingUp,
  Scale,
  BarChart,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useBankBalance } from '@/context/bank-balance-context';
import { useCashBalance } from '@/context/cash-balance-context';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useAuth } from '@/context/auth-context';

const gstNavItems = [
  { href: '/inward', label: 'Inward Goods', icon: ArrowDownCircle },
  { href: '/outward', label: 'Sales Invoices', icon: FileText },
];

const cashNavItems = [
    { href: '/cash-inward', label: 'Cash Inward', icon: ArrowDownCircle },
    { href: '/cash-outward', label: 'Cash Outward', icon: DollarSign },
]

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { href: '/labour', label: 'Labour', icon: Users },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/ai-pricing', label: 'AI Pricing', icon: Sparkles },
];

const reportsNavItems = [
    { href: '/reports', label: 'Profit & Loss', icon: FileText },
    { href: '/reports/sales', label: 'Sales Report', icon: BarChart },
    { href: '/reports/expenses', label: 'Expense Report', icon: Receipt },
    { href: '/reports/balance-sheet', label: 'Balance Sheet', icon: Scale },
    { href: '/reports/forecasting', label: 'Demand Forecasting', icon: TrendingUp },
]

const adminNavItems = [
    { href: '/users', label: 'Users', icon: UserCog },
    { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({ href, label, icon: Icon, onClick }: { href: string, label: string, icon: React.ElementType, onClick: () => void }) {
    const pathname = usePathname();
    return (
        <SidebarMenuItem>
            <Link href={href} onClick={onClick}>
                <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={label}
                    variant="default"
                >
                    <Icon />
                    <span>{label}</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    )
}

function NavLinkOutline({ href, label, icon: Icon, onClick }: { href: string, label: string, icon: React.ElementType, onClick: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href === '/reports' && pathname.startsWith('/reports/'));
    return (
        <SidebarMenuItem>
            <Link href={href} onClick={onClick}>
            <SidebarMenuButton
                isActive={isActive}
                tooltip={label}
                variant="outline"
            >
                <Icon />
                <span>{label}</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    )
}

function SiteLayoutContent({ children }: { children: React.ReactNode }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { balance: bankBalance, setBalance: setBankBalance } = useBankBalance();
  const { balance: cashBalance, setBalance: setCashBalance } = useCashBalance();
  const { user } = useAuth();
  
  const [newBankBalance, setNewBankBalance] = React.useState(bankBalance);
  const [openBankDialog, setOpenBankDialog] = React.useState(false);

  const [newCashBalance, setNewCashBalance] = React.useState(cashBalance);
  const [openCashDialog, setOpenCashDialog] = React.useState(false);

  React.useEffect(() => {
    setNewBankBalance(bankBalance);
  }, [bankBalance]);
  
  React.useEffect(() => {
    setNewCashBalance(cashBalance);
  }, [cashBalance]);

  const handleBankSave = () => {
    setBankBalance(newBankBalance);
    setOpenBankDialog(false);
  };

  const handleCashSave = () => {
    setCashBalance(newCashBalance);
    setOpenCashDialog(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
        setOpenMobile(false);
    }
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Package2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">ScrapFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {mainNavItems.map(item => (
                    <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={handleLinkClick} />
                ))}
            </SidebarMenu>

            <Separator className='my-4' />
            
            <SidebarGroup>
                <SidebarGroupLabel className='flex items-center gap-2'><FileText /> Reports</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {reportsNavItems.map(item => (
                       <NavLinkOutline key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={handleLinkClick} />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel className='flex items-center gap-2'><FileDigit /> GST Transactions</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {gstNavItems.map(item => (
                       <NavLinkOutline key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={handleLinkClick} />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel className='flex items-center gap-2'><DollarSign /> Cash Transactions</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {cashNavItems.map(item => (
                        <NavLinkOutline key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={handleLinkClick} />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            
            {user?.role === 'Admin' && (
                 <>
                    <Separator className='my-4' />
                     <SidebarGroup>
                        <SidebarGroupLabel className='flex items-center gap-2'><Settings /> Admin</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                            {adminNavItems.map(item => (
                                <NavLinkOutline key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={handleLinkClick} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                 </>
            )}

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
                  <span className="text-sm font-bold text-green-400">₹{bankBalance.toLocaleString()}</span>
                   <Dialog open={openBankDialog} onOpenChange={setOpenBankDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Pencil className="w-3 h-3 text-sidebar-foreground/80" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Bank Balance</DialogTitle>
                        <DialogDescription>
                          Update your current bank balance for GST transactions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="bank-balance">New Balance (₹)</Label>
                        <Input
                          id="bank-balance"
                          type="number"
                          value={newBankBalance}
                          onChange={(e) => setNewBankBalance(Number(e.target.value))}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleBankSave}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
            </div>
             <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/10">
                <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-sidebar-foreground/80" />
                    <span className="text-sm font-medium">Cash Balance</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className="text-sm font-bold text-yellow-400">₹{cashBalance.toLocaleString()}</span>
                   <Dialog open={openCashDialog} onOpenChange={setOpenCashDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Pencil className="w-3 h-3 text-sidebar-foreground/80" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Cash Balance</DialogTitle>
                        <DialogDescription>
                          Update your current cash-in-hand balance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="cash-balance">New Balance (₹)</Label>
                        <Input
                          id="cash-balance"
                          type="number"
                          value={newCashBalance}
                          onChange={(e) => setNewCashBalance(Number(e.target.value))}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCashSave}>Save</Button>
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
    </>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <SiteLayoutContent>{children}</SiteLayoutContent>
        </SidebarProvider>
    )
}
