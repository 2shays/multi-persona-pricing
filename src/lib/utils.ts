import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Currency = 'INR' | 'EUR' | 'USD';
type BillingPeriod = 'monthly' | 'yearly';

const currencySymbols: Record<Currency, string> = {
  INR: '₹',
  EUR: '€',
  USD: '$',
};

/**
 * Converts a price string from USD to a selected currency and adjusts for billing period.
 * Handles single numbers, ranges, and suffixes like "/month", "/year", or "/org/year".
 * @param priceString The input price string, assumed to be in USD (e.g., "$5,000", "$5k-$7k/month").
 * @param toCurrency The target currency ('INR', 'EUR', 'USD').
 * @param rates The exchange rates relative to USD.
 * @param toPeriod The target billing period ('monthly' or 'yearly').
 * @returns A formatted price string in the target currency and period.
 */
export function convertPrice(
  priceString: string,
  toCurrency: Currency,
  rates: { [key: string]: number },
  toPeriod: BillingPeriod
): string {
  if (!priceString || typeof priceString !== 'string') {
    return 'N/A';
  }

  const originalPeriod = /year/i.test(priceString) ? 'yearly' : 'monthly';
  
  // Extract suffix like /month, /year, etc.
  const suffixMatch = priceString.match(/(\s*\/.*)$/);
  let suffix = suffixMatch ? suffixMatch[0] : '';
  const pricePart = priceString.replace(suffix, '').trim();
  
  // Update suffix based on target period
  if (toPeriod === 'yearly') {
    suffix = suffix.replace(/month/i, 'year');
    if (!/year/i.test(suffix)) suffix += '/year';
  } else {
    suffix = suffix.replace(/year/i, 'month');
    if (!/month/i.test(suffix)) suffix += '/month';
  }


  // Function to convert a single numeric value
  const convertValue = (value: number) => {
    let adjustedValue = value;
    if (originalPeriod === 'monthly' && toPeriod === 'yearly') {
      adjustedValue *= 12;
    } else if (originalPeriod === 'yearly' && toPeriod === 'monthly') {
      adjustedValue /= 12;
    }

    const rate = rates[toCurrency] || 1;
    const converted = adjustedValue * rate;
    
    const fixedDigits = toCurrency === 'INR' ? 0 : 2;
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: fixedDigits,
    }).format(converted);
  };

  // Regex to find numbers, ignoring commas and dollar signs
  const numbers = pricePart.replace(/[$,]/g, '').match(/\d+(\.\d+)?/g);

  if (!numbers) {
    return priceString; // Return original if no numbers found (e.g., "Contact Us")
  }

  const convertedNumbers = numbers.map(numStr => convertValue(parseFloat(numStr)));
  const symbol = currencySymbols[toCurrency];

  if (convertedNumbers.length === 1) {
    return `${symbol}${convertedNumbers[0]}${suffix}`;
  }
  
  if (convertedNumbers.length === 2) {
    return `${symbol}${convertedNumbers[0]} - ${symbol}${convertedNumbers[1]}${suffix}`;
  }

  // Fallback for unexpected formats
  return priceString;
}
