// src/services/pricing-data.ts

/**
 * @fileOverview This file defines the data structure and a service for
 * fetching company pricing information from CSV files in the repository root.
 * It loads companies from companies.csv and pricing tiers from pricing_tiers.csv,
 * then joins them by company ID.
 */

import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
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

const DATA_FILE_CANDIDATES = {
  companies: [
    join(process.cwd(), 'public', 'data', 'companies.csv'),
    join(process.cwd(), 'companies.csv'),
    join(process.cwd(), 'src', 'data', 'companies.csv'),
  ],
  pricingTiers: [
    join(process.cwd(), 'public', 'data', 'pricing_tiers.csv'),
    join(process.cwd(), 'pricing_tiers.csv'),
    join(process.cwd(), 'src', 'data', 'pricing_tiers.csv'),
  ],
};

let cachedPricingData: PricingInfo[] | null = null;

async function resolveCsvPath(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  throw new Error(`Unable to locate pricing data CSV. Checked: ${candidates.join(', ')}`);
}

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

  const [companiesPath, tiersPath] = await Promise.all([
    resolveCsvPath(DATA_FILE_CANDIDATES.companies),
    resolveCsvPath(DATA_FILE_CANDIDATES.pricingTiers),
  ]);

  const [companiesCsv, tiersCsv] = await Promise.all([
    readFile(companiesPath, 'utf8'),
    readFile(tiersPath, 'utf8'),
  ]);

  const companyRows = csvRowsToObjects(parseCsv(companiesCsv));
  const tierRows = csvRowsToObjects(parseCsv(tiersCsv));

  const tiersByCompanyId = new Map<string, Array<{ name: string; price: string; features: string }>>();

  for (const tier of tierRows) {
    const companyId = tier.company_id;
    if (!companyId) {
      continue;
    }

    const tierInfo = {
      name: tier.name || '',
      price: tier.price || '',
      features: tier.features || '',
    };

    const existing = tiersByCompanyId.get(companyId) ?? [];
    existing.push(tierInfo);
    tiersByCompanyId.set(companyId, existing);
  }

  const pricingData: PricingInfo[] = companyRows.map((company) => ({
    companyName: company.company_name || '',
    category: company.category || '',
    url: company.url || '',
    tiers: tiersByCompanyId.get(company.id) ?? [],
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
