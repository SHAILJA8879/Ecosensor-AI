import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import { SCORE_THRESHOLDS } from '../utils/constants';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * ScoreGauge component for EcoSense AI.
 * Renders a circular gauge visualization of the Carbon Health Score using Chart.js.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.score - The Carbon Health Score (0-100)
 * @returns {React.ReactElement} The visual score gauge component
 */
export default function ScoreGauge({ score }) {
  // Determine color coding and descriptions based on score boundaries
  let color = '#10b981'; // Green (Excellent/Optimal)
  let trackColor = '#1e293b'; // Slate track background
  let label = 'Excellent';
  let textColor = 'text-emerald-400';
  let textDescription = 'Great job! Your carbon footprint is well below critical limits.';

  if (score <= SCORE_THRESHOLDS.LOW) {
    color = '#ef4444'; // Red (Poor)
    textColor = 'text-red-400';
    label = 'Poor';
    textDescription = 'Your carbon emissions are very high. Consider carbon reduction strategies.';
  } else if (score <= SCORE_THRESHOLDS.MEDIUM) {
    color = '#f59e0b'; // Yellow/Amber (Moderate)
    textColor = 'text-amber-400';
    label = 'Moderate';
    textDescription = 'Your carbon emissions are average. Look for opportunities to go greener.';
  }

  // Chart data configuration
  const chartData = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, trackColor],
        borderWidth: 0,
        borderRadius: [10, 0],
        hoverBackgroundColor: [color, trackColor]
      }
    ]
  };

  // Chart configuration options
  const chartOptions = {
    cutout: '82%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center text-center">
      <h3 className="text-lg font-bold font-display text-white mb-6">Carbon Health Score</h3>

      {/* Visual Canvas Gauge Wrapper */}
      <div
        className="relative w-48 h-48 flex items-center justify-center"
        role="img"
        aria-label={`Carbon Health Score is ${score} out of 100, rated as ${label}.`}
      >
        <Doughnut data={chartData} options={chartOptions} />

        {/* Centered Score Label Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-5xl font-extrabold font-display text-white tracking-tight leading-none">
            {score}
          </span>
          <span className={`text-sm font-bold uppercase tracking-wider mt-2 ${textColor}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Accessibility details */}
      <p className="text-slate-400 text-sm mt-6 leading-relaxed max-w-sm">{textDescription}</p>
    </div>
  );
}

ScoreGauge.propTypes = {
  score: PropTypes.number.isRequired
};

ScoreGauge.defaultProps = {};
