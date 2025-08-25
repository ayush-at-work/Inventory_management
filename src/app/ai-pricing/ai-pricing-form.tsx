
"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { suggestPricing, SuggestPricingOutput } from '@/ai/flows/suggest-pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const result = await suggestPricing({
        materialType: formData.get('materialType') as string,
        quantity: Number(formData.get('quantity')),
        marketTrends: formData.get('marketTrends') as string,
      });
      return { result, error: null };
    } catch (e: any) {
      return { result: null, error: e.message || 'An unknown error occurred.' };
    }
  }, initialState);

  return (
    <Card>
       <CardHeader>
          <CardTitle>Get Price Suggestions</CardTitle>
          <CardDescription>
            Provide details about your scrap material to receive an AI-powered price suggestion based on market data.
          </CardDescription>
        </CardHeader>
      <CardContent>
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
            <Label htmlFor="marketTrends">Known Market Trends (Optional)</Label>
            <Textarea id="marketTrends" name="marketTrends" placeholder="e.g., Prices are currently high due to demand." />
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
          <CardContent className="space-y-4 pt-6">
             <div className="space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className='flex items-start gap-4'>
                    <Lightbulb className="h-6 w-6 text-primary mt-1" />
                    <div className='flex-1'>
                        <h3 className="text-lg font-semibold text-primary">Pricing Suggestion</h3>
                        <div>
                          <p className="text-2xl font-bold">
                            ₹{state.result.suggestedPrice.toFixed(2)} / kg
                          </p>
                        </div>
                        <p className="text-sm text-foreground/80 mt-2">{state.result.reasoning}</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
