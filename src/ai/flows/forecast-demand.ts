'use server';

/**
 * @fileOverview This file defines a Genkit flow for forecasting demand for scrap materials.
 *
 * - forecastDemand - A function that forecasts demand based on historical sales data.
 * - ForecastDemandInput - The input type for the forecastDemand function.
 * - ForecastDemandOutput - The return type for the forecastDemand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema
const ForecastDemandInputSchema = z.object({
  materialType: z.string().describe('The type of scrap material to forecast.'),
  historicalSalesData: z.string().describe('A JSON string representing historical sales data.'),
  forecastPeriod: z.string().describe('The period for which to forecast demand (e.g., "next 30 days").'),
});
export type ForecastDemandInput = z.infer<typeof ForecastDemandInputSchema>;

// Define the output schema
const ForecastDemandOutputSchema = z.object({
  predictedDemand: z.number().describe('The predicted demand quantity for the material in its standard unit (e.g., kg).'),
  analysis: z.string().describe('A textual analysis of the forecast, including trends, seasonality, and confidence levels.'),
  unit: z.string().describe('The unit of the predicted demand (e.g., kg, NOS).'),
});
export type ForecastDemandOutput = z.infer<typeof ForecastDemandOutputSchema>;

// Define the prompt
const forecastDemandPrompt = ai.definePrompt({
  name: 'forecastDemandPrompt',
  input: {schema: ForecastDemandInputSchema},
  output: {schema: ForecastDemandOutputSchema},
  prompt: `You are an expert in supply chain management and data analysis, specializing in the scrap metal industry.
  Your task is to forecast the demand for a specific material based on its historical sales data.

  Analyze the provided historical data for patterns, trends, and seasonality.
  Based on your analysis, predict the demand for the specified forecast period.

  Material Type: {{{materialType}}}
  Forecast Period: {{{forecastPeriod}}}
  Historical Sales Data (JSON):
  \`\`\`json
  {{{historicalSalesData}}}
  \`\`\`

  Provide a predicted demand quantity and a detailed analysis explaining your forecast.
  The analysis should cover any identified trends (e.g., increasing sales), seasonality (e.g., higher sales in winter),
  and your confidence in the prediction. The unit for the predicted demand should be the most common unit from the historical data.
  `,
});

// Define the flow
const forecastDemandFlow = ai.defineFlow(
  {
    name: 'forecastDemandFlow',
    inputSchema: ForecastDemandInputSchema,
    outputSchema: ForecastDemandOutputSchema,
  },
  async (input) => {
    const {output} = await forecastDemandPrompt(input);
    return output!;
  }
);

/**
 * Forecasts demand for scrap materials.
 * @param input - The input data for forecasting demand.
 * @returns The predicted demand and analysis.
 */
export async function forecastDemand(input: ForecastDemandInput): Promise<ForecastDemandOutput> {
  return forecastDemandFlow(input);
}
