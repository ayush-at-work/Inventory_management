
import type { Metadata } from 'next';
import './globals.css';
import { SiteLayout } from '@/components/site-layout';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { BankBalanceProvider } from '@/context/bank-balance-context';
import { CashBalanceProvider } from '@/context/cash-balance-context';
import { InventoryProvider } from '@/context/inventory-context';
import { LabourProvider } from '@/context/labour-context';
import { GstProvider } from '@/context/gst-context';
import { ExpensesProvider } from '@/context/expenses-context';
import { PurchaseOrderProvider } from '@/context/purchase-order-context';
import { AuthProvider } from '@/context/auth-context';
import { LedgerProvider } from '@/context/ledger-context';

export const metadata = {
  title: 'ScrapFlow',
  description: 'Inventory and financial management for scrap businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <BankBalanceProvider>
              <CashBalanceProvider>
                <InventoryProvider>
                  <GstProvider>
                    <ExpensesProvider>
                       <LabourProvider>
                        <PurchaseOrderProvider>
                          <LedgerProvider>
                            <SiteLayout>
                              {children}
                            </SiteLayout>
                          </LedgerProvider>
                        </PurchaseOrderProvider>
                      </LabourProvider>
                    </ExpensesProvider>
                  </GstProvider>
                </InventoryProvider>
              </CashBalanceProvider>
            </BankBalanceProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
