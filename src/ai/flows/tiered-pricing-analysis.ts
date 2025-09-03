'use server';

/**
 * @fileOverview This file defines a Genkit flow for tiered pricing analysis.
 *
 * - tieredPricingAnalysis - The main function to initiate the tiered pricing analysis.
 * - TieredPricingAnalysisInput - The input type for the tieredPricingAnalysis function.
 * - TieredPricingAnalysisOutput - The return type for the tieredPricingAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TieredPricingAnalysisInputSchema = z.object({
  companyName: z.string().describe('The name of the company to analyze.'),
});
export type TieredPricingAnalysisInput = z.infer<typeof TieredPricingAnalysisInputSchema>;

const TieredPricingAnalysisOutputSchema = z.object({
  companyInfo: z.object({
    qualitative: z.string().describe('A qualitative description of the company.'),
    tiers: z.array(
      z.object({
        name: z.string().describe('The name of the pricing tier.'),
        features: z.string().describe('The features offered in this tier.'),
      })
    ).describe('An array of pricing tiers for the company.'),
  }).describe('Information about the company and its pricing tiers.'),
});
export type TieredPricingAnalysisOutput = z.infer<typeof TieredPricingAnalysisOutputSchema>;

export async function tieredPricingAnalysis(input: TieredPricingAnalysisInput): Promise<TieredPricingAnalysisOutput> {
  return tieredPricingAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tieredPricingAnalysisPrompt',
  input: {schema: TieredPricingAnalysisInputSchema},
  output: {schema: TieredPricingAnalysisOutputSchema},
  prompt: `You are an AI assistant tasked with fetching and structuring company information for pricing analysis.

  Your goal is to extract the qualitative description and pricing tiers (name and features) for the given company.
  Return the result as a JSON object matching the schema.

  Company Name: {{{companyName}}}
  `, // Removed the system prompt since we don't need to add an extra layer of personas to the prompt
});

const tieredPricingAnalysisFlow = ai.defineFlow(
  {
    name: 'tieredPricingAnalysisFlow',
    inputSchema: TieredPricingAnalysisInputSchema,
    outputSchema: TieredPricingAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
