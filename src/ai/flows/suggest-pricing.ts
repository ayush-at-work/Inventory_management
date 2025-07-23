'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting pricing for scrap materials.
 *
 * - suggestPricing - A function that suggests pricing based on inventory, market trends, and live web search data.
 * - SuggestPricingInput - The input type for the suggestPricing function.
 * - SuggestPricingOutput - The return type for the suggestPricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestPricingInputSchema = z.object({
  materialType: z.string().describe('The type of scrap material.'),
  quantity: z.number().describe('The quantity of scrap material in stock.'),
  marketTrends: z.string().describe('Any known market trends for the material.'),
});
export type SuggestPricingInput = z.infer<typeof SuggestPricingInputSchema>;

// Define the output schema
const SuggestPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested price per unit for the scrap material.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestPricingOutput = z.infer<typeof SuggestPricingOutputSchema>;

// Define the prompt
const suggestPricingPrompt = ai.definePrompt({
  name: 'suggestPricingPrompt',
  input: {schema: SuggestPricingInputSchema},
  output: {schema: SuggestPricingOutputSchema},
  prompt: `You are an expert in scrap material pricing. Your task is to suggest a competitive and profitable price for a given scrap material.

  To do this, you MUST use the web search tool to find the current market price and latest trends for the specified material.

  Base your recommendation on the following information:
  - Current inventory quantity.
  - User-provided market trends.
  - Real-time data obtained from your web search.

  Material Type: {{{materialType}}}
  Quantity in Stock: {{{quantity}}}
  Known Market Trends: {{{marketTrends}}}

  Provide a suggested price per unit and a clear reasoning for your suggestion, citing the data you found online.
  `,
});

// Define the flow
const suggestPricingFlow = ai.defineFlow(
  {
    name: 'suggestPricingFlow',
    inputSchema: SuggestPricingInputSchema,
    outputSchema: SuggestPricingOutputSchema,
  },
  async (input) => {
    const {output} = await suggestPricingPrompt(input);
    return output!;
  }
);

/**
 * Suggests pricing for scrap materials based on current inventory and real-time market data.
 * @param input - The input data for suggesting pricing.
 * @returns The suggested price and reasoning.
 */
export async function suggestPricing(input: SuggestPricingInput): Promise<SuggestPricingOutput> {
  return suggestPricingFlow(input);
}
