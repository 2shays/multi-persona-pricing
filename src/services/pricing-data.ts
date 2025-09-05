// src/services/pricing-data.ts

/**
 * @fileOverview This file defines the data structure and a service for
 * fetching company pricing information from a mock database. It also includes
 * the schema definitions for the data.
 */

import { z } from 'zod';

// Define the schema for a single pricing tier.
const PricingTierSchema = z.object({
  name: z.string().describe('The name of the pricing tier (e.g., "Basic", "Pro", "Enterprise").'),
  price: z.string().describe('The price of the tier (e.g., "$49/month", "Contact Us").'),
  features: z.string().describe('A summary of the key features for this tier.'),
});

// Define the schema for the overall company pricing information.
const PricingInfoSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  category: z.string().describe('The market category (e.g., "Sustainability Software", "CRM").'),
  url: z.string().url().describe('The URL of the company\'s pricing page.'),
  tiers: z.array(PricingTierSchema).describe('An array of the company\'s pricing tiers.'),
});

export type PricingInfo = z.infer<typeof PricingInfoSchema>;

// Mock data representing a database of company pricing information.
// You can expand this with more data from your spreadsheet.
const PRICING_DATA: PricingInfo[] = [
    {
        companyName: "Aplanet",
        category: "Sustainability Software",
        url: "https://aplanet.org/pricing",
        tiers: [
            {
                name: "Starter",
                price: "Contact Us",
                features: "For small teams getting started with ESG management. Includes data collection, basic reporting, and up to 5 users."
            },
            {
                name: "Business",
                price: "Contact Us",
                features: "For growing companies needing more advanced tools. Includes materiality analysis, custom dashboards, and up to 20 users."
            },
            {
                name: "Enterprise",
                price: "Contact Us",
                features: "Comprehensive solution for large organizations. Includes supply chain management, API access, and unlimited users."
            }
        ]
    },
    {
        companyName: "Microsoft Sustainability Manager",
        category: "Sustainability Software",
        url: "https://learn.microsoft.com/en-us/industry/sustainability/sustainability-manager-get-started",
        tiers: [
            {
                name: "Cloud for Sustainability",
                price: "$4,000/month",
                features: "Includes Microsoft Sustainability Manager, environmental credit service, and other tools. Price is for 1 tenant per month."
            },
            {
                name: "ESG Value Chain Solution",
                price: "$6,000/month",
                features: "Extends capabilities for deeper value chain engagement and reporting. Price is for 1 tenant per month."
            }
        ]
    },
    {
        companyName: "Salesforce Net Zero Cloud",
        category: "Sustainability Software",
        url: "https://www.salesforce.com/products/net-zero-cloud/overview/",
        tiers: [
            {
                name: "Net Zero Cloud Growth",
                price: "$48,000/org/year",
                features: "Calculate and track emissions (Scopes 1-3), basic carbon accounting, supplier engagement."
            },
            {
                name: "Net Zero Cloud Advanced",
                price: "$126,000/org/year",
                features: "Advanced carbon accounting, what-if analysis, waste management, and extended reporting."
            }
        ]
    }
];

/**
 * Searches the mock database for companies matching a query.
 * The search is case-insensitive and checks both company name and category.
 * @param query The search query string.
 * @returns A promise that resolves to an array of matching `PricingInfo` objects.
 */
export async function searchPricingData(
    query: string
): Promise<PricingInfo[]> {
    const lowerCaseQuery = query.toLowerCase();
    const results = PRICING_DATA.filter(
        (company) =>
            company.companyName.toLowerCase().includes(lowerCaseQuery) ||
            company.category.toLowerCase().includes(lowerCaseQuery)
    );
    return Promise.resolve(results);
}
