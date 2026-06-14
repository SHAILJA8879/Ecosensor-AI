import { useState, useCallback } from 'react';
import { Calculator, Dashboard, AICoach, BillScanner, ScoreGauge, ErrorBoundary } from './components';
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
  const handlePlanGenerated = useCallback((newScore) => {
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
  }, [results]);

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
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold font-display text-lg shadow-lg shadow-emerald-500/20"
                aria-hidden="true"
              >
                ES
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                EcoSense <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <nav className="flex space-x-2" aria-label="Main Navigation">
              <button 
                onClick={() => setActiveTab('calculator')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  activeTab === 'calculator'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-current={activeTab === 'calculator' ? 'page' : undefined}
              >
                Calculator
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  activeTab === 'dashboard'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 outline-none">
          {/* Onboarding Hero and Journey Map for Landing Page */}
          {activeTab === 'calculator' && !results ? (
            <div className="w-full mb-12 space-y-10 animate-fade-in">
              {/* Hero Banner */}
              <section className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-900/60 to-emerald-955/10 border border-slate-900 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl">
                <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight max-w-2xl mx-auto mb-6">
                  Understand and Reduce Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-350 font-black">Carbon Footprint</span>
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
                  Get personalized AI insights in 3 simple steps. Estimate emissions, scan utilities automatically, and build sustainability habits.
                </p>
                <button
                  onClick={() => {
                    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                >
                  Calculate My Footprint
                </button>
              </section>

              {/* 3-Step Onboarding Journey Indicator */}
              <section className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 text-center">
                  Your Onboarding Journey
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Step 1
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 font-display font-black">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Calculate</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Compute your transport, food, and electricity emissions manually or scan bills with Gemini Vision.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Step 2
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-teal-400 mb-4 font-display font-black">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Get AI Insights</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Receive your Carbon Health Score and a custom sustainability action plan from your AI Coach.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-900/30 border border-slate-900/85 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-lg">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Step 3
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 font-display font-black">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Track Progress</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Log calculations, compare score trends, and monitor your long-term environmental target savings.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Standard Section Header */
            <section aria-labelledby="dashboard-title" className="mb-10 text-center md:text-left max-w-3xl animate-fade-in">
              <h1 id="dashboard-title" className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight leading-none mb-4">
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
              <section id="calculator-section" className="lg:col-span-5 space-y-6" aria-label="Calculator and Scanning Panels">
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
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/60" role="listitem">
                              <span className="text-sm text-slate-400 font-medium">🚗 Transport</span>
                              <span className="text-sm font-semibold text-white">{results.breakdown.transport} kg CO2e</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/60" role="listitem">
                              <span className="text-sm text-slate-400 font-medium">🥗 Food Habits</span>
                              <span className="text-sm font-semibold text-white">{results.breakdown.food} kg CO2e</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/60" role="listitem">
                              <span className="text-sm text-slate-400 font-medium">⚡ Electricity</span>
                              <span className="text-sm font-semibold text-white">{results.breakdown.electricity} kg CO2e</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-slate-300">Total Monthly Impact</span>
                            <span className="text-2xl font-extrabold text-emerald-400">{results.breakdown.total} kg CO2e</span>
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
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600 mb-4" aria-hidden="true">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-300 mb-2">No Emissions Calculated</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      Fill in the calculator form and submit to generate your Carbon Health Score and detailed footprint breakdown.
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
        <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} EcoSense AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-350 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
