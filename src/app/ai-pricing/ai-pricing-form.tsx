"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { suggestPricing, SuggestPricingOutput } from '@/ai/flows/suggest-pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';

const initialState: { result: SuggestPricingOutput | null; error: string | null } = {
  result: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Suggest Price
    </Button>
  );
}

export function AiPricingForm() {
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    try {
      const result = await suggestPricing({
        materialType: formData.get('materialType') as string,
        quantity: Number(formData.get('quantity')),
        marketTrends: formData.get('marketTrends') as string,
        historicalData: '', // This will be handled by the tool in the flow
      });
      return { result, error: null };
    } catch (e: any) {
      return { result: null, error: e.message || 'An unknown error occurred.' };
    }
  }, initialState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="materialType">Material Type</Label>
          <Input id="materialType" name="materialType" placeholder="e.g., Copper, Aluminum" required />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity (kg)</Label>
          <Input id="quantity" name="quantity" type="number" placeholder="e.g., 500" required />
        </div>
        <div>
          <Label htmlFor="marketTrends">Market Trends</Label>
          <Textarea id="marketTrends" name="marketTrends" placeholder="e.g., Prices are currently high due to demand." required />
        </div>
        <SubmitButton />
      </form>

      {state.error && (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      )}

      {state.result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Pricing Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Suggested Price / kg</p>
              <p className="text-2xl font-bold text-primary">
                ${state.result.suggestedPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reasoning</p>
              <p className="text-sm text-foreground/80">{state.result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
