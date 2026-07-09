// src/services/pricing-data.ts

/**
 * @fileOverview This file defines the data structure and a service for
 * fetching company pricing information from CSV files in the repository root.
 * It loads companies from companies.csv and pricing tiers from pricing_tiers.csv,
 * then joins them by company ID.
 */

import { z } from 'zod';
import pricingDataJson from '@/data/pricing-data.json';

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

let cachedPricingData: PricingInfo[] | null = null;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(current);
      current = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    if (char === '\n') {
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current !== '' || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

function csvRowsToObjects(rows: string[][]): Array<Record<string, string>> {
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(header => header.trim());

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? '').trim();
    });
    return record;
  });
}

async function loadPricingData(): Promise<PricingInfo[]> {
  if (cachedPricingData) {
    return cachedPricingData;
  }

  const pricingData = pricingDataJson.map((company) => ({
    companyName: company.companyName || '',
    category: company.category || '',
    url: company.url || '',
    tiers: (company.tiers || []).map((tier) => ({
      name: tier.name || '',
      price: tier.price || '',
      features: tier.features || '',
    })),
  }));

  cachedPricingData = pricingData;
  return pricingData;
}

/**
 * Searches the CSV-backed data for companies matching a query.
 * The search is case-insensitive and checks both company name and category.
 * @param query The search query string.
 * @returns A promise that resolves to an array of matching `PricingInfo` objects.
 */
export async function searchPricingData(
  query: string
): Promise<PricingInfo[]> {
  const lowerCaseQuery = query.toLowerCase();
  const pricingData = await loadPricingData();

  return pricingData.filter(
    (company) =>
      company.companyName.toLowerCase().includes(lowerCaseQuery) ||
      company.category.toLowerCase().includes(lowerCaseQuery)
  );
}
