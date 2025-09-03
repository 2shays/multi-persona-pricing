"use client";

import { useEffect, useState, useTransition, useRef } from 'react';
import { runAnalysis, type AnalysisResult } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  HeadOfPricingIcon,
  LineChart,
  LoaderIcon,
  MarketAnalystIcon,
  SearchIcon,
  BrainCircuit,
} from '@/components/icons';
import type { MultiPersonaPriceEstimationOutput } from '@/ai/flows/multi-persona-price-estimation';
import { AnalysisCard } from '@/components/analysis-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { LoadingAnalysis } from '@/components/loading-analysis';

function PersonaCard({
  icon,
  title,
  description,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-card/50 p-6 rounded-2xl border flex flex-col items-start text-left w-full sm:w-1/3',
        className
      )}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export default function PricingEstimator() {
  const [companyInput, setCompanyInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [analysisResults, setAnalysisResults] =
    useState<MultiPersonaPriceEstimationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);


  const isLoading = isPending;

  const handleAnalysis = () => {
    if (!companyInput) {
      setError('Please enter a company name or URL.');
      return;
    }
    setError(null);
    setAnalysisResults(null);
    startTransition(async () => {
      const result: AnalysisResult = await runAnalysis(companyInput);
      if (result.success) {
        setAnalysisResults(result.data);
      } else {
        setError(result.error);
      }
    });
  };
  
  useEffect(() => {
    if (analysisResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResults]);

  return (
    <div className="w-full flex flex-col items-center relative">
        {isLoading && <LoadingAnalysis />}

      <header className="w-full py-20 md:py-32 text-center bg-gradient-to-r from-[#17D8B1] via-[#363A8F] to-[#412352] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Multi-Persona Pricing Intelligence
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Leverage AI-powered analysis from Market Analysts, Value Engineers
            and Customer Psychologists to determine optimal pricing strategy
            for your product or service.
          </p>
        </div>
      </header>

      <main className="w-full container mx-auto px-4 py-16 md:py-24 text-center bg-grid-pattern">
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          Three AI perspectives analyze pricing: Marketing Analyst for
          positioning, Value Engineer for cost optimization, and Customer
          Psychologist for willingness to pay.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <PersonaCard
            icon={<MarketAnalystIcon className="w-10 h-10 text-primary" />}
            title="Marketing Analyst"
            description="Analysis of market trends, customer segments, and pricing elasticity."
            className="border-primary/30 shadow-lg shadow-primary/10"
          />
          <PersonaCard
            icon={<LineChart className="w-10 h-10 text-secondary" />}
            title="Value Engineer"
            description="Estimates the tangible financial benefit (ROI) for a customer, competitor pricing data and positioning analysis."
            className="border-secondary/30 shadow-lg shadow-secondary/10"
          />
          <PersonaCard
            icon={<BrainCircuit className="w-10 h-10 text-accent" />}
            title="Customer Psychologist"
            description="Simulates consumer price sensitivity to find an optimal price that isn't perceived as too cheap or too expensive."
            className="border-accent/30 shadow-lg shadow-accent/10"
          />
        </div>

        <section
          id="analysis-section"
          className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-card/50 shadow-2xl rounded-2xl border border-border relative"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Start Your Pricing Analysis
          </h2>
          <p className="text-muted-foreground mb-6">
            Enter a company name or URL to begin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              id="company-input"
              type="text"
              className="flex-1 p-3 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-12 text-base bg-input"
              placeholder="e.g., Microsoft Sustainability Manager, Aplanet"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !isLoading && handleAnalysis()
              }
              disabled={isLoading}
            />
            <Button
              onClick={handleAnalysis}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12 text-base"
              disabled={isLoading || !companyInput}
            >
              {isPending ? (
                <LoaderIcon className="animate-spin mr-2" />
              ) : (
                <SearchIcon className="mr-2" />
              )}
              {isPending ? 'Running...' : 'Run Pricing Analysis'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="p-4 mt-6 text-left">
              <AlertTitle className="font-medium">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        {analysisResults && (
          <div ref={resultsRef} className="w-full max-w-5xl mx-auto space-y-8 mt-16 animate-in fade-in duration-500 text-left">
            {analysisResults.headOfPricing && (
              <section className="bg-success/10 p-6 rounded-2xl border border-success/20">
                <div className="flex items-center mb-4">
                  <HeadOfPricingIcon className="w-8 h-8 text-success mr-3" />
                  <h2 className="text-2xl font-bold text-success/90">
                    Final Recommendation
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
                  <Separator
                    orientation="vertical"
                    className="h-16 hidden sm:block bg-border/50"
                  />
                  <div className="flex-1">
                    <p className="text-lg text-muted-foreground">
                      Confidence:
                    </p>
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
                  icon={<LineChart />}
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
                  icon={<User />}
                  title="Quantitative Analyst"
                  description="Simulates consumer price sensitivity to find an optimal price that isn't perceived as too cheap or too expensive."
                  data={analysisResults.quantitativeAnalyst}
                  priceKey="optimalPricePoint"
                  priceLabel="Optimal Price Point"
                  accentClass="text-accent"
                  subPriceKey="acceptablePriceRange"
                  subPriceLabel="Acceptable Range"
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
