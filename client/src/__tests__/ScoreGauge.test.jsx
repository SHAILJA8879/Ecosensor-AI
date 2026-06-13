import { render, screen } from '@testing-library/react';
import ScoreGauge from '../components/ScoreGauge';

// Mock react-chartjs-2 to avoid JSDOM canvas rendering failures
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />
}));

describe('ScoreGauge', () => {
  it('should display score value correctly when score is rendered', () => {
    render(<ScoreGauge score={85} />);

    // Check if the score is printed as text
    expect(screen.getByText('85')).toBeInTheDocument();
    
    // Check if the rating label is present
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('should render correct color class for score ranges when score is <= 40 (Poor)', () => {
    render(<ScoreGauge score={30} />);

    const labelElement = screen.getByText('Poor');
    expect(labelElement).toBeInTheDocument();
    
    // Validate text color class matches red rating
    expect(labelElement).toHaveClass('text-red-400');
    expect(screen.getByText(/your carbon emissions are very high/i)).toBeInTheDocument();
  });

  it('should render correct color class for score ranges when score is 41-70 (Moderate)', () => {
    render(<ScoreGauge score={55} />);

    const labelElement = screen.getByText('Moderate');
    expect(labelElement).toBeInTheDocument();
    
    // Validate text color class matches yellow/amber rating
    expect(labelElement).toHaveClass('text-amber-400');
    expect(screen.getByText(/your carbon emissions are average/i)).toBeInTheDocument();
  });

  it('should render correct color class for score ranges when score is > 70 (Excellent)', () => {
    render(<ScoreGauge score={90} />);

    const labelElement = screen.getByText('Excellent');
    expect(labelElement).toBeInTheDocument();
    
    // Validate text color class matches green rating
    expect(labelElement).toHaveClass('text-emerald-400');
    expect(screen.getByText(/great job/i)).toBeInTheDocument();
  });
});
