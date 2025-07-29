
"use client"

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useGst } from '@/context/gst-context';
import { useExpenses } from '@/context/expenses-context';
import { format, subMonths, startOfMonth } from 'date-fns';

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-5))",
  },
}

export function RevenueChart() {
  const { inwardGoods, outwardGoods } = useGst();
  const { expenses } = useExpenses();
  // Note: Cash and Labour expenses are not included as they are not in a global context.
  // For a complete picture, these would need to be integrated.

  const chartData = useMemo(() => {
    const dataByMonth: { [key: string]: { revenue: number, expenses: number } } = {};
    const today = new Date();

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthKey = format(startOfMonth(monthDate), 'yyyy-MM');
        dataByMonth[monthKey] = { revenue: 0, expenses: 0 };
    }

    // Calculate revenue from paid GST sales
    outwardGoods.forEach(item => {
        if (item.paymentStatus === 'Paid') {
            const monthKey = format(startOfMonth(new Date(item.date)), 'yyyy-MM');
            if (dataByMonth[monthKey]) {
                const tax = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
                dataByMonth[monthKey].revenue += item.taxableAmount + tax;
            }
        }
    });
    
    // Calculate expenses from GST purchases
    inwardGoods.forEach(item => {
        const monthKey = format(startOfMonth(new Date(item.date)), 'yyyy-MM');
        if (dataByMonth[monthKey]) {
            dataByMonth[monthKey].expenses += item.totalInvoiceValue;
        }
    });

    // Calculate expenses from general expenses
    expenses.forEach(item => {
        const monthKey = format(startOfMonth(new Date(item.date)), 'yyyy-MM');
        if (dataByMonth[monthKey]) {
            dataByMonth[monthKey].expenses += item.amount;
        }
    });

    return Object.entries(dataByMonth).map(([month, values]) => ({
      month: format(new Date(month), 'MMM'),
      ...values,
    }));
  }, [inwardGoods, outwardGoods, expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs. Expenses (Last 6 Months)</CardTitle>
        <CardDescription>An overview of your GST revenue and general expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
