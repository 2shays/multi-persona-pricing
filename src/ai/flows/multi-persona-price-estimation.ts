'use server';
/**
 * @fileOverview This file defines the multi-persona price estimation flow, which leverages
 * multiple AI personas (Market Analyst, Value Engineer, Quantitative Analyst, and Head of Pricing)
 * to generate price estimations and a synthesized recommendation for a given company and tier.
 *
 * - multiPersonaPriceEstimation - The main function to trigger the price estimation flow.
 * - MultiPersonaPriceEstimationInput - The input type for the multiPersonaPriceEstimation function.
 * - MultiPersonaPriceEstimationOutput - The output type for the multiPersonaPriceEstimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getPricingDataForCompany} from '@/ai/tools/pricing-data-tool';

// Define schemas for each persona's analysis
const MarketAnalystSchema = z.object({
  analysis: z.string().describe('A concise market analysis of the company and tier.'),
  estimatedPriceRange: z.string().describe('The estimated monthly price range based on market analysis (e.g., \'$5,000 - $7,000/month\').'),
});
type MarketAnalystOutput = z.infer<typeof MarketAnalystSchema>;

const ValueEngineerSchema = z.object({
  analysis: z.string().describe('A concise analysis of the financial value (ROI) for the customer.'),
  estimatedValueToCustomer: z.string().optional(),
  justifiedPricePoint: z.string().describe('The justified monthly price point based on value engineering (e.g., \'$10,000/month\').'),
});
type ValueEngineerOutput = z.infer<typeof ValueEngineerSchema>;

const QuantAnalystSchema = z.object({
  analysis: z.string().describe('A concise quantitative analysis simulating Van Westendorp price sensitivity.'),
  optimalPricePoint: z.string().describe('The optimal monthly price point based on quantitative analysis (e.g., \'$8,500/month\').'),
  acceptablePriceRange: z.string().describe('Acceptable price range from consumer psychology perspective.'),
});
type QuantAnalystOutput = z.infer<typeof QuantAnalystSchema>;

const HeadOfPricingSchema = z.object({
  synthesis: z.string().describe('A concise synthesis of the market analyst, value engineer, and quantitative analyst reports.'),
  recommendedPrice: z.string().describe('The final recommended monthly price (e.g., \'$9,000/month\').'),
  confidencePercentage: z.number().describe('The confidence percentage (0-100) in the recommended price.'),
});
type HeadOfPricingOutput = z.infer<typeof HeadOfPricingSchema>;

// Define the input schema for the overall flow
const MultiPersonaPriceEstimationInputSchema = z.object({
  companyName: z.string().describe('The name of the company to analyze.'),
  companyDescription: z.string().describe('Qualitative description of the company'),
  targetTierName: z.string().describe('The name of the target tier for analysis.'),
  targetTierFeatures: z.string().describe('The features of the target tier.'),
});
export type MultiPersonaPriceEstimationInput = z.infer<typeof MultiPersonaPriceEstimationInputSchema>;

// Define the output schema for the overall flow
const MultiPersonaPriceEstimationOutputSchema = z.object({
  marketAnalyst: MarketAnalystSchema,
  valueEngineer: ValueEngineerSchema,
  quantitativeAnalyst: QuantAnalystSchema,
  headOfPricing: HeadOfPricingSchema,
});
export type MultiPersonaPriceEstimationOutput = z.infer<typeof MultiPersonaPriceEstimationOutputSchema>;

export async function multiPersonaPriceEstimation(input: MultiPersonaPriceEstimationInput): Promise<MultiPersonaPriceEstimationOutput> {
  return multiPersonaPriceEstimationFlow(input);
}

// Define the individual persona prompts
const marketAnalystPrompt = ai.definePrompt({
  name: 'marketAnalystPrompt',
  tools: [getPricingDataForCompany],
  input: {schema: MultiPersonaPriceEstimationInputSchema},
  output: {schema: MarketAnalystSchema},
  prompt: `Act as a Market Analyst. Analyze the market for Company: "{{companyName}}", described as "{{companyDescription}}". The Target Tier is "{{targetTierName}}" with features: "{{targetTierFeatures}}". Use the getPricingDataForCompany tool to get real-world pricing data for similar companies to inform your analysis. Provide a justifiable monthly price range. The 'estimatedPriceRange' field must contain ONLY the price string (e.g., '$5,000 - $7,000/month') with no other text. Keep your 'analysis' concise (under 40 words). Respond in JSON format.`,
});

const valueEngineerPrompt = ai.definePrompt({
  name: 'valueEngineerPrompt',
  input: {schema: MultiPersonaPriceEstimationInputSchema},
  output: {schema: ValueEngineerSchema},
  prompt: `Act as a Value Engineer. Estimate the financial value (ROI) for the customer of Company: "{{companyName}}", described as "{{companyDescription}}". The Target Tier is "{{targetTierName}}" with features: "{{targetTierFeatures}}". Provide a justified monthly price point. The 'justifiedPricePoint' field must contain ONLY the price string (e.g., '$10,000/month'). Keep your 'analysis' concise (under 40 words). Respond in JSON format.`,
});

const quantAnalystPrompt = ai.definePrompt({
  name: 'quantAnalystPrompt',
  input: {schema: MultiPersonaPriceEstimationInputSchema},
  output: {schema: QuantAnalystSchema},
  prompt: `Act as a Quantitative Analyst. Simulate Van Westendorp price sensitivity for Company: "{{companyName}}", described as "{{companyDescription}}". The Target Tier is "{{targetTierName}}" with features: "{{targetTierFeatures}}". Provide an optimal monthly price point. The 'optimalPricePoint' field must contain ONLY the price string (e.g., '$8,500/month'). Keep your 'analysis' concise (under 40 words). Respond in JSON format.`,
});

const headOfPricingPrompt = ai.definePrompt({
  name: 'headOfPricingPrompt',
  input: {schema: z.object({
    companyName: z.string(),
    targetTierName: z.string(),
    marketAnalyst: MarketAnalystSchema,
    valueEngineer: ValueEngineerSchema,
    quantitativeAnalyst: QuantAnalystSchema
  })},
  output: {schema: HeadOfPricingSchema},
  prompt: `You are the Head of Pricing. You have three reports for "{{companyName}}"'s "{{targetTierName}}" tier: 

1. Market Analyst:
{{json marketAnalyst}}

2. Value Engineer:
{{json valueEngineer}}

3. Quantitative Analyst:
{{json quantitativeAnalyst}}

Synthesize these and provide a final recommended monthly price. The 'recommendedPrice' field must contain ONLY the price string (e.g., '$9,000/month'). Explain your reasoning concisely in 'synthesis'. Respond in JSON format.`,
});

// Define the main flow
const multiPersonaPriceEstimationFlow = ai.defineFlow(
  {
    name: 'multiPersonaPriceEstimationFlow',
    inputSchema: MultiPersonaPriceEstimationInputSchema,
    outputSchema: MultiPersonaPriceEstimationOutputSchema,
  },
  async input => {
    // Call the individual persona prompts in parallel
    const [marketAnalyst, valueEngineer, quantitativeAnalyst] = await Promise.all([
      marketAnalystPrompt(input),
      valueEngineerPrompt(input),
      quantAnalystPrompt(input),
    ]).then(results => results.map(result => result.output!));

    // Call the head of pricing prompt with the results from the other personas
    const headOfPricingResult = await headOfPricingPrompt({
      companyName: input.companyName,
      targetTierName: input.targetTierName,
      marketAnalyst: marketAnalyst,
      valueEngineer: valueEngineer,
      quantitativeAnalyst: quantitativeAnalyst
    });

    // Return the combined results
    return {
      marketAnalyst: marketAnalyst,
      valueEngineer: valueEngineer,
      quantitativeAnalyst: quantitativeAnalyst,
      headOfPricing: headOfPricingResult.output!,
    };
  }
);
