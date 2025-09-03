"use client";

import { useEffect, useState, useTransition } from 'react';
import { runAnalysis, type AnalysisResult } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  HeadOfPricingIcon,
  LoaderIcon,
  MarketAnalystIcon,
  QuantAnalystIcon,
  SearchIcon,
  ValueEngineerIcon,
} from '@/components/icons';
import type { MultiPersonaPriceEstimationOutput } from '@/ai/flows/multi-persona-price-estimation';
import { AnalysisCard } from '@/components/analysis-card';
import { Separator } from '@/components/ui/separator';

export default function PricingEstimator() {
  const [companyInput, setCompanyInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] =
    useState<MultiPersonaPriceEstimationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isLoading = isPending || progress > 0 && progress < 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setProgress(10); 
      setLoadingMessage('Running base models...');
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          if (prev >= 70) {
            setLoadingMessage('Synthesizing results...');
          }
          return prev + 5;
        });
      }, 500);
    } else {
        setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPending]);


  const handleAnalysis = () => {
    if (!companyInput) {
      setError('Please enter a company name.');
      return;
    }
    setError(null);
    setAnalysisResults(null);
    startTransition(async () => {
      const result: AnalysisResult = await runAnalysis(companyInput);
      if (result.success) {
        setProgress(100);
        setLoadingMessage('Analysis complete!');
        setAnalysisResults(result.data);
        setTimeout(() => setProgress(0), 1000);
      } else {
        setError(result.error);
        setProgress(0);
      }
    });
  };

  return (
    <div className="w-full max-w-5xl p-6 sm:p-8 bg-card shadow-2xl rounded-2xl border border-border">
      <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
        Multi-Persona Price Estimator
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        This tool uses a team of AI personas to analyze a product from multiple
        angles and synthesize a recommended price point.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          id="company-input"
          type="text"
          className="flex-1 p-3 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-12 text-base"
          placeholder="e.g., Microsoft Sustainability Manager, Aplanet"
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAnalysis()}
          disabled={isLoading}
        />
        <Button
          onClick={handleAnalysis}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:bg-primary/90 transition disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center h-12 text-base"
          disabled={isLoading || !companyInput}
        >
          {isPending ? (
            <LoaderIcon className="animate-spin mr-2" />
          ) : (
            <SearchIcon className="mr-2" />
          )}
          {isPending ? loadingMessage : 'Run Ensemble Analysis'}
        </Button>
      </div>

      {isLoading && (
        <div className="w-full bg-muted rounded-full h-2.5 mb-6">
          <Progress value={progress} className="h-2.5" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="p-4 mb-6">
          <AlertTitle className="font-medium">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResults && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {analysisResults.headOfPricing && (
            <section className="bg-success/10 p-6 rounded-2xl border border-success/20">
              <div className="flex items-center mb-4">
                <HeadOfPricingIcon className="w-8 h-8 text-success mr-3" />
                <h2 className="text-2xl font-bold text-success/90">
                  Final Recommendation (Head of Pricing)
                </h2>
              </div>
              <p className="text-foreground/90 mb-4 font-medium">
                {analysisResults.headOfPricing.synthesis}
              </p>
              <div className="bg-card/50 p-4 rounded-xl text-center flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground">
                    Recommended Monthly Price:
                  </p>
                  <p className="text-3xl font-bold text-success my-1">
                    {analysisResults.headOfPricing.recommendedPrice}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-16 hidden sm:block bg-border/50" />
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground">Confidence:</p>
                  <p className="text-3xl font-bold text-success my-1">
                    {analysisResults.headOfPricing.confidencePercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on agreement between the expert analyses.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {analysisResults.marketAnalyst && (
              <AnalysisCard
                icon={<MarketAnalystIcon />}
                title="Market Analyst"
                description="Analyzes the product against competitors and market trends to find a competitive price point."
                data={analysisResults.marketAnalyst}
                priceKey="estimatedPriceRange"
                priceLabel="Estimated Price Range"
                accentClass="text-primary"
              />
            )}
            {analysisResults.valueEngineer && (
              <AnalysisCard
                icon={<ValueEngineerIcon />}
                title="Value Engineer"
                description="Estimates the tangible financial benefit (ROI) a customer gets, pricing the product as a fraction of that value."
                data={analysisResults.valueEngineer}
                priceKey="justifiedPricePoint"
                priceLabel="Justified Price Point"
                accentClass="text-secondary"
              />
            )}
            {analysisResults.quantitativeAnalyst && (
              <AnalysisCard
                icon={<QuantAnalystIcon />}
                title="Quantitative Analyst"
                description="Simulates consumer price sensitivity to find an optimal price that isn't perceived as too cheap or too expensive."
                data={analysisResults.quantitativeAnalyst}
                priceKey="optimalPricePoint"
                priceLabel="Optimal Price Point"
                accentClass="text-accent"
                subPriceKey='acceptablePriceRange'
                subPriceLabel='Acceptable Range'
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
