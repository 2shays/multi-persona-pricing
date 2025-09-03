'use server';

import type { MultiPersonaPriceEstimationOutput } from '@/ai/flows/multi-persona-price-estimation';
import { multiPersonaPriceEstimation } from '@/ai/flows/multi-persona-price-estimation';
import { tieredPricingAnalysis } from '@/ai/flows/tiered-pricing-analysis';

export type AnalysisResult = {
  success: true;
  data: MultiPersonaPriceEstimationOutput;
} | {
  success: false;
  error: string;
};

export async function runAnalysis(
  companyName: string
): Promise<AnalysisResult> {
  if (!companyName) {
    return { success: false, error: 'Please enter a company name.' };
  }

  try {
    const companyInfo = await tieredPricingAnalysis({ companyName });

    if (
      !companyInfo ||
      !companyInfo.companyInfo ||
      !companyInfo.companyInfo.tiers ||
      companyInfo.companyInfo.tiers.length === 0
    ) {
      return {
        success: false,
        error: `Pricing tiers for "${companyName}" are not available. Please try an example company.`,
      };
    }

    const companyData = companyInfo.companyInfo;
    const targetTier =
      companyData.tiers.length > 1
        ? companyData.tiers[1]
        : companyData.tiers[0];

    const analysisData = await multiPersonaPriceEstimation({
      companyName: companyName,
      companyDescription: companyData.qualitative,
      targetTierName: targetTier.name,
      targetTierFeatures: targetTier.features,
    });

    return { success: true, data: analysisData };
  } catch (e: any) {
    console.error('Error in runAnalysis server action:', e);
    return {
      success: false,
      error:
        e.message ||
        'An unexpected error occurred during analysis. The model may have returned an unexpected format. Please try again.',
    };
  }
}
