import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Currency = 'INR' | 'EUR' | 'USD';

const currencySymbols: Record<Currency, string> = {
  INR: '₹',
  EUR: '€',
  USD: '$',
};

/**
 * Converts a price string from USD to a selected currency.
 * Handles single numbers, ranges, and suffixes like "/month".
 * @param priceString The input price string, assumed to be in USD (e.g., "$5,000", "$5k-$7k/month").
 * @param toCurrency The target currency ('INR', 'EUR', 'USD').
 * @param rates The exchange rates relative to USD.
 * @returns A formatted price string in the target currency.
 */
export function convertPrice(
  priceString: string,
  toCurrency: Currency,
  rates: { [key: string]: number }
): string {
  if (!priceString || typeof priceString !== 'string') {
    return 'N/A';
  }

  // Extract suffix like /month, /year, etc.
  const suffixMatch = priceString.match(/(\s*\/.*)$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const pricePart = priceString.replace(suffix, '').trim();

  // Function to convert a single numeric value
  const convertValue = (value: number) => {
    const rate = rates[toCurrency] || 1;
    const converted = value * rate;
    // Format to 2 decimal places for EUR/USD, 0 for INR
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
