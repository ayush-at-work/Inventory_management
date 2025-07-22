'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting pricing for scrap materials.
 *
 * - suggestPricing - A function that suggests pricing based on inventory, market trends, and historical data.
 * - SuggestPricingInput - The input type for the suggestPricing function.
 * - SuggestPricingOutput - The return type for the suggestPricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestPricingInputSchema = z.object({
  materialType: z.string().describe('The type of scrap material.'),
  quantity: z.number().describe('The quantity of scrap material in stock.'),
  marketTrends: z.string().describe('Current market trends for the material.'),
  historicalData: z.string().describe('Historical pricing data for the material.'),
});
export type SuggestPricingInput = z.infer<typeof SuggestPricingInputSchema>;

// Define the output schema
const SuggestPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested price per unit for the scrap material.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestPricingOutput = z.infer<typeof SuggestPricingOutputSchema>;

// Define the tool to get historical pricing data
const getHistoricalPricingData = ai.defineTool({
    name: 'getHistoricalPricingData',
    description: 'Retrieves historical pricing data for a specific scrap material.',
    inputSchema: z.object({
      materialType: z.string().describe('The type of scrap material.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Placeholder implementation - replace with actual data retrieval logic
    console.log(`Fetching historical data for ${input.materialType}`);
    return `Historical pricing data for ${input.materialType} - replace with actual data`;
  }
);

// Define the prompt
const suggestPricingPrompt = ai.definePrompt({
  name: 'suggestPricingPrompt',
  input: {schema: SuggestPricingInputSchema},
  output: {schema: SuggestPricingOutputSchema},
  tools: [getHistoricalPricingData],
  prompt: `You are an expert in scrap material pricing.

  Based on the current inventory, market trends, and historical data, suggest a pricing for the scrap materials to ensure profitability. You must use getHistoricalPricingData to determine historical prices.

  Material Type: {{{materialType}}}
  Quantity: {{{quantity}}}
  Market Trends: {{{marketTrends}}}
  Historical Data: {{tool_code tool=getHistoricalPricingData input=this}}
  
  Provide the suggested price and the reasoning behind it.
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
 * Suggests pricing for scrap materials based on current inventory, market trends, and historical data.
 * @param input - The input data for suggesting pricing.
 * @returns The suggested price and reasoning.
 */
export async function suggestPricing(input: SuggestPricingInput): Promise<SuggestPricingOutput> {
  return suggestPricingFlow(input);
}
