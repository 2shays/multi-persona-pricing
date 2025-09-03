import PricingEstimator from "./pricing-estimator";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background font-sans antialiased">
      <PricingEstimator />
    </main>
  );
}
