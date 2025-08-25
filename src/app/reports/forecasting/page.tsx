
"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { forecastDemand, ForecastDemandOutput } from '@/ai/flows/forecast-demand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, BrainCircuit } from 'lucide-react';
import { useGst } from '@/context/gst-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { Separator } from '@/components/ui/separator';

const initialState: { result: ForecastDemandOutput | null; error: string | null } = {
  result: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Forecast Demand
    </Button>
  );
}

export default function ForecastingPage() {
    const { outwardGoods: gstSales } = useGst();
    // In a real app, you'd combine GST and Cash sales.
    // For this demo, we'll just use GST sales.
    const historicalSalesData = gstSales.map(sale => ({
        date: sale.date,
        material: sale.materialType,
        quantity: sale.weight,
        value: sale.taxableAmount,
    }));

    const uniqueMaterials = React.useMemo(() => {
        const materials = new Set(historicalSalesData.map(d => d.material));
        return Array.from(materials);
    }, [historicalSalesData]);

  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const materialType = formData.get('materialType') as string;
      const filteredSales = historicalSalesData.filter(d => d.material === materialType);

      if (filteredSales.length < 3) {
          return { result: null, error: "Not enough historical data to forecast. At least 3 sales records are needed." };
      }

      const result = await forecastDemand({
        materialType: materialType,
        forecastPeriod: formData.get('forecastPeriod') as string,
        historicalSalesData: JSON.stringify(filteredSales),
      });
      return { result, error: null };
    } catch (e: any) {
      return { result: null, error: e.message || 'An unknown error occurred.' };
    }
  }, initialState);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">AI Demand Forecasting</h2>
      </div>
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
            <CardTitle>Forecast Future Sales</CardTitle>
            <CardDescription>
                Select a material to get an AI-powered demand forecast based on your sales history.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form action={formAction} className="space-y-4">
                <div>
                <Label htmlFor="materialType">Material Type</Label>
                <Select name="materialType" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueMaterials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label htmlFor="forecastPeriod">Forecast Period</Label>
                <Input id="forecastPeriod" name="forecastPeriod" defaultValue="next 30 days" required />
                </div>
                <SubmitButton />
            </form>

            {state.error && (
                <p className="text-sm font-medium text-destructive mt-4">{state.error}</p>
            )}
            </CardContent>

            {state.result && (
                <>
                <Separator />
                <CardContent className="pt-6">
                    <div className="space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-4">
                            <BrainCircuit className="h-6 w-6 text-primary mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-primary">Forecast Result</h3>
                                <div>
                                <p className="text-2xl font-bold">
                                    {state.result.predictedDemand.toLocaleString()} {state.result.unit}
                                </p>
                                <p className="text-sm text-muted-foreground">Predicted Demand</p>
                                </div>
                                <p className="text-sm text-foreground/80 mt-2">{state.result.analysis}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                </>
            )}
        </Card>
      </div>
    </div>
  );
}
