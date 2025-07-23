import type { Metadata } from 'next';
import './globals.css';
import { SiteLayout } from '@/components/site-layout';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { BankBalanceProvider } from '@/context/bank-balance-context';
import { CashBalanceProvider } from '@/context/cash-balance-context';

export const metadata: Metadata = {
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
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <BankBalanceProvider>
            <CashBalanceProvider>
              <SiteLayout>
                {children}
              </SiteLayout>
            </CashBalanceProvider>
          </BankBalanceProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
