import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { getHistory, getWeeklyData, getMonthlyData } from '../utils/historyStorage';

// Mock historyStorage utility
jest.mock('../utils/historyStorage', () => ({
  getHistory: jest.fn(),
  getWeeklyData: jest.fn(),
  getMonthlyData: jest.fn()
}));

// Mock react-chartjs-2 to avoid JSDOM canvas failures
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />
}));

// Mock lazy loaded charts to render synchronously
jest.mock('../components/DashboardCharts', () => ({
  ProgressChart: () => <div data-testid="mock-progress-chart" />,
  CategoryChart: () => <div data-testid="mock-category-chart" />
}));

describe('Dashboard', () => {
  let onNavigateToCalculatorMock;

  beforeEach(() => {
    onNavigateToCalculatorMock = jest.fn();
    jest.clearAllMocks();
  });

  it('should show empty state when no history exists', () => {
    getHistory.mockReturnValue([]);

    render(<Dashboard onNavigateToCalculator={onNavigateToCalculatorMock} />);

    // Assert empty state title and text
    expect(screen.getByText('No Carbon History Found')).toBeInTheDocument();
    expect(screen.getByText(/unlock the tracking dashboard/i)).toBeInTheDocument();

    // Click redirect button
    const redirectBtn = screen.getByRole('button', { name: /compute first footprint/i });
    fireEvent.click(redirectBtn);

    expect(onNavigateToCalculatorMock).toHaveBeenCalledTimes(1);
  });

  it('should render chart components and history stats when history exists', async () => {
    const mockHistory = [
      {
        date: '2026-06-12',
        carbonScore: 85,
        transport: 90,
        food: 45,
        electricity: 165,
        total: 300,
        predictedScore: 90
      },
      {
        date: '2026-06-11',
        carbonScore: 80,
        transport: 100,
        food: 45,
        electricity: 180,
        total: 325,
        predictedScore: 85
      }
    ];

    getHistory.mockReturnValue(mockHistory);
    getWeeklyData.mockReturnValue(mockHistory);

    render(<Dashboard onNavigateToCalculator={onNavigateToCalculatorMock} />);

    // Validate score display (from ScoreGauge)
    expect(screen.getByText('85')).toBeInTheDocument();

    // Validate trend arrow badge (+5 pts)
    expect(screen.getByText('+5 pts')).toBeInTheDocument();

    // Validate charts presence
    expect(await screen.findByTestId('mock-progress-chart')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-category-chart')).toBeInTheDocument();

    // Validate category percentage splits
    // Transport: 90 / 300 = 30%
    expect(screen.getByText('30% of total')).toBeInTheDocument();
    expect(screen.getByText('90 kg')).toBeInTheDocument();
    // Food: 45 / 300 = 15%
    expect(screen.getByText('15% of total')).toBeInTheDocument();
    expect(screen.getByText('45 kg')).toBeInTheDocument();
    // Electricity: 165 / 300 = 55%
    expect(screen.getByText('55% of total')).toBeInTheDocument();
    expect(screen.getByText('165 kg')).toBeInTheDocument();

    // Validate table content
    expect(screen.getAllByText('2026-06-12')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2026-06-11')[0]).toBeInTheDocument();
  });

  it('should toggle between weekly/monthly view when timeline tabs are clicked', () => {
    const mockHistory = [
      {
        date: '2026-06-12',
        carbonScore: 85,
        transport: 90,
        food: 45,
        electricity: 165,
        total: 300
      }
    ];

    getHistory.mockReturnValue(mockHistory);
    getWeeklyData.mockReturnValue(mockHistory);
    getMonthlyData.mockReturnValue(mockHistory);

    render(<Dashboard onNavigateToCalculator={onNavigateToCalculatorMock} />);

    const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
    const monthlyTab = screen.getByRole('tab', { name: /monthly/i });

    // Initial state is weekly
    expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
    expect(monthlyTab).toHaveAttribute('aria-selected', 'false');

    // Click Monthly Tab
    fireEvent.click(monthlyTab);
    expect(weeklyTab).toHaveAttribute('aria-selected', 'false');
    expect(monthlyTab).toHaveAttribute('aria-selected', 'true');
    expect(getMonthlyData).toHaveBeenCalledTimes(1);

    // Click Weekly Tab
    fireEvent.click(weeklyTab);
    expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
    expect(monthlyTab).toHaveAttribute('aria-selected', 'false');
    expect(getWeeklyData).toHaveBeenCalledTimes(2); // On mount + this click
  });
});
