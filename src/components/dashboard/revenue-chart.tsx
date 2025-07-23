
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
import { format, subMonths } from 'date-fns';

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

  const chartData = useMemo(() => {
    const dataByMonth: { [key: string]: { revenue: number, expenses: number } } = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const month = format(subMonths(today, i), 'yyyy-MM');
        dataByMonth[month] = { revenue: 0, expenses: 0 };
    }

    outwardGoods.forEach(item => {
        if (item.paymentStatus === 'Paid') {
            const month = format(new Date(item.date), 'yyyy-MM');
            if (dataByMonth[month]) {
                const tax = (item.taxableAmount * (item.cgst + item.sgst + item.igst)) / 100;
                dataByMonth[month].revenue += item.taxableAmount + tax;
            }
        }
    });
    
    inwardGoods.forEach(item => {
        const month = format(new Date(item.date), 'yyyy-MM');
        if (dataByMonth[month]) {
            dataByMonth[month].expenses += item.totalInvoiceValue;
        }
    });

    expenses.forEach(item => {
        const month = format(new Date(item.date), 'yyyy-MM');
        if (dataByMonth[month]) {
            dataByMonth[month].expenses += item.amount;
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
        <CardTitle>Revenue vs. Expenses</CardTitle>
        <CardDescription>An overview of your GST revenue and expenses.</CardDescription>
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
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
