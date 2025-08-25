
import { AiPricingForm } from './ai-pricing-form';
import { Sparkles } from 'lucide-react';

export default function AiPricingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Sparkles className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">AI Pricing Assistant</h2>
      </div>
      <div className="max-w-2xl mx-auto">
        <AiPricingForm />
      </div>
    </div>
  );
}
