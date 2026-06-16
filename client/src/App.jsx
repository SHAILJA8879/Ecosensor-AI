import { useState, useCallback } from 'react';
import {
  Calculator,
  Dashboard,
  AICoach,
  BillScanner,
  ScoreGauge,
  ErrorBoundary,
  Header,
  HeroSection,
  OnboardingSteps,
  Footer
} from './components';
import { saveEntry } from './utils/historyStorage';

/**
 * @typedef {Object} CalculationResults
 * @property {number} score - The Carbon Health Score (0-100)
 * @property {Object} breakdown - Detailed emissions breakdown in kg CO2
 * @property {number} breakdown.transport - Transport emissions (monthly)
 * @property {number} breakdown.food - Food emissions (monthly)
 * @property {number} breakdown.electricity - Electricity emissions (monthly)
 * @property {number} breakdown.total - Total emissions (monthly)
 */

/**
 * Main application layout and dashboard wrapper for EcoSense AI.
 * Integrates the Calculator form and visual ScoreGauge, managing
 * the application state and layout grid.
 *
 * @component
 * @returns {React.ReactElement} The main dashboard user interface
 */
export default function App() {
  /** @type {[CalculationResults | null, function]} */
  const [results, setResults] = useState(null);
  const [prefilledValues, setPrefilledValues] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'dashboard'

  // Callback triggered when the calculator form successfully computes values
  const handleCalculation = useCallback((data) => {
    setResults(data);

    // Save current calculations to history logs
    saveEntry({
      date: new Date().toISOString().split('T')[0],
      carbonScore: data.score,
      transport: data.breakdown.transport,
      food: data.breakdown.food,
      electricity: data.breakdown.electricity,
      total: data.breakdown.total
    });
  }, []);

  // Callback to update history entry with target prediction score from AI Coach
  const handlePlanGenerated = useCallback(
    (newScore) => {
      if (results) {
        saveEntry({
          date: new Date().toISOString().split('T')[0],
          carbonScore: results.score,
          transport: results.breakdown.transport,
          food: results.breakdown.food,
          electricity: results.breakdown.electricity,
          total: results.breakdown.total,
          predictedScore: newScore
        });

        // Update state to include target score overlay details
        setResults((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            predictedScore: newScore
          };
        });
      }
    },
    [results]
  );

  // Callback triggered when the BillScanner successfully extracts metrics
  const handleScanSuccess = useCallback((data) => {
    const prefilled = {};
    if (data.kwh !== null && data.kwh !== undefined) {
      prefilled.electricity = data.kwh;
    }
    if (data.fuel_liters !== null && data.fuel_liters !== undefined) {
      // Estimate weekly travel distance: (monthly fuel liters * 12 km/liter efficiency) / 4.33 weeks/month
      prefilled.transport = Math.round((data.fuel_liters * 12) / 4.33);
    }
    setPrefilledValues(prefilled);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen font-sans bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30">
        {/* Skip Navigation Link for Keyboard/Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Skip to main content
        </a>

        {/* Header Landmark */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 outline-none"
        >
          {/* Onboarding Hero and Journey Map for Landing Page */}
          {activeTab === 'calculator' && !results ? (
            <div className="w-full mb-12 space-y-10 animate-fade-in">
              {/* Hero Banner */}
              <HeroSection />

              {/* 3-Step Onboarding Journey Indicator */}
              <OnboardingSteps />
            </div>
          ) : (
            /* Standard Section Header */
            <section
              aria-labelledby="dashboard-title"
              className="mb-10 text-center md:text-left max-w-3xl animate-fade-in"
            >
              <h1
                id="dashboard-title"
                className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight leading-none mb-4"
              >
                Carbon Footprint Dashboard
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                {activeTab === 'calculator'
                  ? 'Estimate your impact, understand your major resource drivers, and improve your Carbon Health Score using our standardized calculation model.'
                  : 'Monitor your historical Carbon Health Score, trace recent emission trends, and analyze your primary resource footprints.'}
              </p>
            </section>
          )}

          {activeTab === 'calculator' ? (
            /* Workspace Layout Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form and Scanning Panels */}
              <section
                id="calculator-section"
                className="lg:col-span-5 space-y-6"
                aria-label="Calculator and Scanning Panels"
              >
                <BillScanner onScanSuccess={handleScanSuccess} />
                <Calculator onCalculate={handleCalculation} prefilledValues={prefilledValues} />
              </section>

              {/* Right Column: Visualization Panel */}
              <section className="lg:col-span-7 space-y-8" aria-label="Results Panel">
                {results ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Score Gauge Widget */}
                      <div className="md:col-span-6">
                        <ScoreGauge score={results.score} />
                      </div>

                      {/* Numeric Emissions Breakdown Card */}
                      <div className="md:col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold font-display text-white mb-4">
                            Emissions Breakdown
                          </h3>
                          <div className="space-y-4" role="list">
                            <div
                              className="flex justify-between items-center py-2 border-b border-slate-800/60"
                              role="listitem"
                            >
                              <span className="text-sm text-slate-400 font-medium">
                                🚗 Transport
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {results.breakdown.transport} kg CO2e
                              </span>
                            </div>
                            <div
                              className="flex justify-between items-center py-2 border-b border-slate-800/60"
                              role="listitem"
                            >
                              <span className="text-sm text-slate-400 font-medium">
                                🥗 Food Habits
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {results.breakdown.food} kg CO2e
                              </span>
                            </div>
                            <div
                              className="flex justify-between items-center py-2 border-b border-slate-800/60"
                              role="listitem"
                            >
                              <span className="text-sm text-slate-400 font-medium">
                                ⚡ Electricity
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {results.breakdown.electricity} kg CO2e
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-slate-300">
                              Total Monthly Impact
                            </span>
                            <span className="text-2xl font-extrabold text-emerald-400">
                              {results.breakdown.total} kg CO2e
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Carbon Coach action recommendation dashboard */}
                    <AICoach
                      score={results.score}
                      breakdown={results.breakdown}
                      rawInputs={results.rawInputs}
                      onPlanGenerated={handlePlanGenerated}
                    />
                  </div>
                ) : (
                  // Empty/Default visual state before calculation
                  <div className="h-full min-h-[350px] bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                    <div
                      className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600 mb-4"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-300 mb-2">
                      No Emissions Calculated
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      Fill in the calculator form and submit to generate your Carbon Health Score
                      and detailed footprint breakdown.
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <Dashboard onNavigateToCalculator={() => setActiveTab('calculator')} />
          )}
        </main>

        {/* Footer Landmark */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
