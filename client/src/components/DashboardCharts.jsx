import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register core Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Line Chart rendering score progress over time.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object[]} props.historyData - Sorted chronological array of history entries
 * @returns {React.ReactElement} The Progress Line Chart component
 */
export function ProgressChart({ historyData }) {
  const chartData = {
    labels: historyData.map((item) => {
      // Format YYYY-MM-DD to short display string e.g. "Jun 12"
      const dateParts = item.date.split('-');
      if (dateParts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIndex = parseInt(dateParts[1], 10) - 1;
        return `${months[mIndex]} ${parseInt(dateParts[2], 10)}`;
      }
      return item.date;
    }),
    datasets: [
      {
        label: 'Carbon Health Score',
        data: historyData.map((item) => item.carbonScore),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointHoverBackgroundColor: '#fff',
        pointBorderColor: '#0f172a', // slate-900
        pointHoverBorderColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` Score: ${context.parsed.y}/100`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[260px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

/**
 * Doughnut Chart rendering emission categories (Transport vs Food vs Electricity) of the latest entry.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.latestEntry - The most recent history entry
 * @returns {React.ReactElement} The Category Doughnut Chart component
 */
export function CategoryChart({ latestEntry }) {
  const chartData = {
    labels: ['Transport', 'Food Habits', 'Electricity'],
    datasets: [
      {
        data: [latestEntry.transport, latestEntry.food, latestEntry.electricity],
        backgroundColor: [
          '#f59e0b', // Amber (Transport)
          '#10b981', // Emerald (Food)
          '#06b6d4'  // Cyan (Electricity)
        ],
        hoverBackgroundColor: [
          '#d97706',
          '#059669',
          '#0891b2'
        ],
        borderWidth: 0,
        weight: 1
      }
    ]
  };

  const chartOptions = {
    cutout: '76%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed} kg CO2e`
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[200px]">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
}
