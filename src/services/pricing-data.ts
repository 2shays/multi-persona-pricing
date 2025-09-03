/**
 * @fileOverview This file defines the data structure and a mock service for
 * fetching company pricing information.
 *
 * To add more data, simply add new objects to the `PRICING_DATA` array
 * following the `PricingInfo` schema.
 */

import {z} from 'zod';

// Defines the schema for a single pricing tier.
const PricingTierSchema = z.object({
  name: z.string().describe('The name of the pricing tier (e.g., "Basic", "Pro", "Enterprise").'),
  price: z.string().describe('The price of the tier (e.g., "$49/month", "Contact Us").'),
  features: z.string().describe('A summary of the key features for this tier.'),
});

// Defines the schema for the overall company pricing information.
const PricingInfoSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  category: z.string().describe('The market category (e.g., "Sustainability Software", "CRM").'),
  url: z.string().url().describe('The URL of the company\'s pricing page.'),
  tiers: z.array(PricingTierSchema).describe('An array of the company\'s pricing tiers.'),
});

export type PricingInfo = z.infer<typeof PricingInfoSchema>;

// ==============================================================================
// MOCK DATABASE
// To add more data for the AI to use, add new company objects to this array.
// Ensure each object matches the `PricingInfo` structure defined above.
// ==============================================================================
const PRICING_DATA: PricingInfo[] = [
  {
    companyName: 'Aplanet',
    category: 'Sustainability Software',
    url: 'https://aplanet.org/pricing',
    tiers: [
      {
        name: 'Starter',
        price: 'Contact Us',
        features: 'For small teams getting started with ESG management. Includes data collection, basic reporting, and up to 5 users.',
      },
      {
        name: 'Business',
        price: 'Contact Us',
        features: 'For growing companies needing more advanced tools. Includes materiality analysis, custom dashboards, and up to 20 users.',
      },
      {
        name: 'Enterprise',
        price: 'Contact Us',
        features: 'Comprehensive solution for large organizations. Includes supply chain management, API access, and unlimited users.',
      },
    ],
  },
  {
    companyName: 'Salesforce',
    category: 'CRM',
    url: 'https://www.salesforce.com/pricing/sales-cloud/',
    tiers: [
        {
            name: 'Starter',
            price: '$25/user/month',
            features: 'Basic CRM for up to 10 users. Lead management, account and contact management, opportunity tracking, and customizable reports.',
        },
        {
            name: 'Professional',
            price: '$75/user/month',
            features: 'Complete CRM for any size team. Includes all Starter features plus sales forecasting, workflow automation, and collaboration tools.',
        },
        {
            name: 'Enterprise',
            price: '$150/user/month',
            features: 'Customizable CRM for your entire business. Includes all Professional features plus advanced reporting, custom app development, and API access.',
        },
    ],
  },
  {
    companyName: 'HubSpot',
    category: 'CRM',
    url: 'https://www.hubspot.com/pricing/sales',
    tiers: [
        {
            name: 'Starter',
            price: '$45/month',
            features: 'Simple sales tools for small teams. Includes contact management, email tracking, and deal pipelines.',
        },
        {
            name: 'Professional',
            price: '$450/month',
            features: 'Powerful sales automation for growing teams. Includes all Starter features plus sales automation, custom reporting, and team management.',
        },
        {
            name: 'Enterprise',
            price: '$1,200/month',
            features: 'Advanced sales software for large teams. Includes all Professional features plus predictive lead scoring, custom objects, and advanced permissions.',
        },
    ]
  }
];
// ==============================================================================

/**
 * Searches the mock pricing data for companies matching a query.
 * The search is a simple case-insensitive text search on the company name and category.
 * @param query The search query string.
 * @returns A promise that resolves to an array of matching `PricingInfo` objects.
 */
export async function searchPricingData(
  query: string
): Promise<PricingInfo[]> {
  const lowerCaseQuery = query.toLowerCase();
  
  // In a real application, this would be a database query.
  const results = PRICING_DATA.filter(
    (company) =>
      company.companyName.toLowerCase().includes(lowerCaseQuery) ||
      company.category.toLowerCase().includes(lowerCaseQuery)
  );

  return results;
}
