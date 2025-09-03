'use server';
/**
 * @fileOverview This file defines a Genkit tool for fetching pricing data.
 * The tool allows the AI to query a mock database of company pricing information.
 */

import {ai} from '@/ai/genkit';
import {searchPricingData} from '@/services/pricing-data';
import {z} from 'genkit';

export const getPricingDataForCompany = ai.defineTool(
  {
    name: 'getPricingDataForCompany',
    description:
      'Returns pricing information for a given company or companies in a similar market. Use this to get real-world data to inform pricing analysis.',
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'The name of the company or a description of the market to search for.'
        ),
    }),
    outputSchema: z.array(
      z.object({
        companyName: z.string(),
        url: z.string(),
        tiers: z.array(
          z.object({
            name: z.string(),
            price: z.string(),
            features: z.string(),
          })
        ),
      })
    ),
  },
  async (input) => {
    return searchPricingData(input.query);
  }
);
