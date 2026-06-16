import React, { useState, useMemo, useCallback, Suspense } from 'react';
import PropTypes from 'prop-types';
import ScoreGauge from './ScoreGauge';
import { getHistory, getWeeklyData, getMonthlyData } from '../utils/historyStorage';
import { SCORE_THRESHOLDS } from '../utils/constants';

// Lazy load the charts for optimized client initial loading performance
const ProgressChart = React.lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.ProgressChart }))
);
const CategoryChart = React.lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.CategoryChart }))
);

// Unified loading fallback spinner for lazily imported charts
const ChartLoadingFallback = () => (
  <div
    className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-slate-500 text-sm"
    aria-hidden="true"
  >
    <svg className="animate-spin h-6 w-6 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span>Loading visualization...</span>
  </div>
);

/**
 * Dashboard component for EcoSense AI.
 * Renders carbon history insights, timeline line charts, category doughnut charts, and sortable tables.
 *
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onNavigateToCalculator - Callback to redirect users to the calculator panel
 * @returns {React.ReactElement} The carbon dashboard user interface
 */
export default function Dashboard({ onNavigateToCalculator }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Retrieve complete sorted history from storage
  const history = useMemo(() => getHistory(), []);

  // Compute trend metrics comparing current and previous entries
  const trend = useMemo(() => {
    if (history.length < 2) {
      return { type: 'none', diff: 0 };
    }
    const current = history[0].carbonScore;
    const previous = history[1].carbonScore;
    const diff = current - previous;
    return {
      type: diff > 0 ? 'up' : diff < 0 ? 'down' : 'none',
      diff: Math.abs(diff)
    };
  }, [history]);

  // Extract latest entry properties
  const latestEntry = useMemo(() => {
    return history[0] || null;
  }, [history]);

  // Calculate percentage splits for the latest entry
  const percentages = useMemo(() => {
    if (!latestEntry || latestEntry.total === 0) {
      return { transport: 0, food: 0, electricity: 0 };
    }
    return {
      transport: Math.round((latestEntry.transport / latestEntry.total) * 100),
      food: Math.round((latestEntry.food / latestEntry.total) * 100),
      electricity: Math.round((latestEntry.electricity / latestEntry.total) * 100)
    };
  }, [latestEntry]);

  // Slice timeline data matching the toggle timeframe
  const timelineData = useMemo(() => {
    return timeframe === 'weekly' ? getWeeklyData() : getMonthlyData();
  }, [timeframe]);

  // Last 10 entries for history logs table
  const tableData = useMemo(() => {
    const list = history.slice(0, 10);
    return list.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [history, sortOrder]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  // Empty State Layout
  if (history.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-16 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-xs">
        <div
          className="w-16 h-16 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-6"
          aria-hidden="true"
        >
          <svg
            className="w-8 h-8 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-3">No Carbon History Found</h2>
        <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          It looks like you haven't computed your emissions footprint yet. Complete your first
          calculation to unlock the tracking dashboard.
        </p>
        <button
          onClick={onNavigateToCalculator}
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg hover:shadow-emerald-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Compute First Footprint
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Core score widget */}
        <section
          className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
          aria-label="Current Carbon Health Score Summary"
        >
          <ScoreGauge score={latestEntry.carbonScore} />

          {/* Trend Indicator badge */}
          {trend.type !== 'none' && (
            <div
              className={`absolute top-6 right-6 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                trend.type === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
              aria-label={`Score trend shows an ${trend.type === 'up' ? 'increase' : 'decrease'} of ${trend.diff} points compared to the last calculation.`}
            >
              {trend.type === 'up' ? (
                // Upward Arrow (Positive improvement)
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                // Downward Arrow (Decline)
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span>
                {trend.type === 'up' ? '+' : '-'}
                {trend.diff} pts
              </span>
            </div>
          )}
        </section>

        {/* Timeline Line Chart widget */}
        <section
          className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
          aria-label="Score Progress Timeline Chart"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display text-white">Score History</h3>

            {/* Keyboard-accessible timeframe selector */}
            <div
              className="flex bg-slate-950 p-1 rounded-lg border border-slate-850"
              role="tablist"
              aria-label="Chart Timeline Scope"
            >
              <button
                role="tab"
                aria-selected={timeframe === 'weekly'}
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  timeframe === 'weekly'
                    ? 'bg-slate-850 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly (Last 7)
              </button>
              <button
                role="tab"
                aria-selected={timeframe === 'monthly'}
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  timeframe === 'monthly'
                    ? 'bg-slate-850 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly (Last 30)
              </button>
            </div>
          </div>

          <div
            className="flex-grow h-64 relative"
            role="img"
            aria-label={`Line chart indicating Carbon Health Scores over the last ${timeframe === 'weekly' ? '7' : '30'} entries.`}
          >
            <Suspense fallback={<ChartLoadingFallback />}>
              <ProgressChart historyData={timelineData} />
            </Suspense>
          </div>

          {/* Accessible Text Alternative for Line Chart */}
          <div className="sr-only">
            Summary: Line chart tracking score timeline.
            {timelineData
              .map((item) => `On ${item.date}, score was ${item.carbonScore}.`)
              .join(' ')}
          </div>
        </section>
      </div>

      {/* Category breakdown emissions splits */}
      <section
        className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8"
        aria-label="Emissions Category Split Insights"
      >
        <h3 className="text-lg font-bold font-display text-white mb-6">Latest Emissions Split</h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Doughnut canvas visualization */}
          <div
            className="md:col-span-5 relative h-56 flex items-center justify-center"
            role="img"
            aria-label={`Doughnut chart indicating percentage splits for the latest monthly emissions total of ${latestEntry.total} kg CO2.`}
          >
            <Suspense fallback={<ChartLoadingFallback />}>
              <CategoryChart latestEntry={latestEntry} />
            </Suspense>
            {/* Centered Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl font-black text-white">
                {Math.round(latestEntry.total)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Total kg
              </span>
            </div>
          </div>

          {/* Accessible detailed values column */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Transport metric card */}
            <article className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-3">
              <span className="w-2.5 h-10 rounded bg-amber-500 shrink-0" aria-hidden="true"></span>
              <div>
                <h4 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Transport
                </h4>
                <div className="text-lg font-bold text-white mt-0.5">
                  {latestEntry.transport} kg
                </div>
                <div className="text-xs text-amber-400 font-semibold mt-0.5">
                  {percentages.transport}% of total
                </div>
              </div>
            </article>

            {/* Food Habits card */}
            <article className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-3">
              <span
                className="w-2.5 h-10 rounded bg-emerald-500 shrink-0"
                aria-hidden="true"
              ></span>
              <div>
                <h4 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Food Habits
                </h4>
                <div className="text-lg font-bold text-white mt-0.5">{latestEntry.food} kg</div>
                <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {percentages.food}% of total
                </div>
              </div>
            </article>

            {/* Electricity card */}
            <article className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-3">
              <span className="w-2.5 h-10 rounded bg-cyan-500 shrink-0" aria-hidden="true"></span>
              <div>
                <h4 className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Electricity
                </h4>
                <div className="text-lg font-bold text-white mt-0.5">
                  {latestEntry.electricity} kg
                </div>
                <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                  {percentages.electricity}% of total
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* History table and responsive logs list */}
      <section
        className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6"
        aria-label="Historical Emissions Log entries"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold font-display text-white">Historical Logs</h3>
          <span className="text-xs text-slate-400 font-medium">Displaying last 10 entries</span>
        </div>

        {/* Desktop Table view (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th
                  className="py-4 px-4"
                  aria-sort={sortOrder === 'desc' ? 'descending' : 'ascending'}
                >
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center space-x-1 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded p-1"
                    aria-label={`Sort entries by date. Current sorting is ${sortOrder === 'desc' ? 'newest first' : 'oldest first'}`}
                  >
                    <span>Calculation Date</span>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </th>
                <th className="py-4 px-4">Health Score</th>
                <th className="py-4 px-4 text-right">Emissions Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-sm">
              {tableData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-950/30 transition-colors text-slate-300">
                  <td className="py-4 px-4 font-semibold text-slate-400">{item.date}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.carbonScore <= SCORE_THRESHOLDS.LOW
                            ? 'bg-red-500'
                            : item.carbonScore <= SCORE_THRESHOLDS.MEDIUM
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        aria-hidden="true"
                      ></span>
                      <span className="font-bold text-white">{item.carbonScore}/100</span>
                      {item.predictedScore && (
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ml-2">
                          AI Target: {item.predictedScore}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-white">
                    {item.total} <span className="text-xs text-slate-400 font-medium">kg CO2e</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards view (< 768px) */}
        <div className="md:hidden space-y-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleSortOrder}
              className="flex items-center space-x-1.5 py-1.5 px-3 bg-slate-950 border border-slate-850 rounded-lg text-xs font-semibold text-slate-350 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={`Toggle Sort Date. Current: ${sortOrder === 'desc' ? 'newest first' : 'oldest first'}`}
            >
              <span>Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          {tableData.map((item, index) => (
            <article
              key={index}
              className="p-4 bg-slate-950/40 border border-slate-855 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {item.date}
                </span>
                <span className="font-extrabold text-white">{item.total} kg CO2e</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Carbon Health Score</span>
                <span className="inline-flex items-center space-x-1.5 text-sm font-bold text-white">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.carbonScore <= SCORE_THRESHOLDS.LOW
                        ? 'bg-red-500'
                        : item.carbonScore <= SCORE_THRESHOLDS.MEDIUM
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    aria-hidden="true"
                  ></span>
                  <span>{item.carbonScore}/100</span>
                  {item.predictedScore && (
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      AI Target: {item.predictedScore}
                    </span>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

Dashboard.propTypes = {
  onNavigateToCalculator: PropTypes.func.isRequired
};

Dashboard.defaultProps = {};
