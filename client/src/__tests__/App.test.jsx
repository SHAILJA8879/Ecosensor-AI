import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
  Line: () => <div data-testid="mock-line" />
}));

jest.mock('../components/ScoreGauge', () => {
  return {
    __esModule: true,
    default: function MockScoreGauge(props) {
      return <div data-testid="mock-score-gauge">Score: {props.score}</div>;
    }
  };
});

jest.mock('../components/DashboardCharts', () => {
  return {
    __esModule: true,
    default: function MockDashboardCharts() {
      return <div data-testid="mock-dashboard-charts" />;
    }
  };
});

describe('App Component', () => {
  test('renders EcoSense AI heading and dashboard structure', () => {
    render(<App />);

    // Check if the welcome heading renders
    const headingElement = screen.getByRole('heading', {
      name: /understand and reduce your carbon footprint/i
    });
    expect(headingElement).toBeInTheDocument();

    // Check if navigation landmarks are accessible
    const navElement = screen.getByRole('navigation', {
      name: /main navigation/i
    });
    expect(navElement).toBeInTheDocument();
  });
});
