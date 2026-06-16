import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AICoach from '../components/AICoach';

// Mock the fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock ScoreGauge to prevent Chart.js canvas issues in JSDOM
jest.mock('../components/ScoreGauge', () => {
  return {
    __esModule: true,
    default: function MockScoreGauge(props) {
      return <div data-testid="mock-score-gauge">Score: {props.score}</div>;
    }
  };
});

describe('AICoach Component', () => {
  const defaultProps = {
    score: 65,
    breakdown: { transport: 100, electricity: 50, food: 30, total: 180 },
    rawInputs: { transport: 200, electricity: 100, foodHabit: 'veg' },
    onPlanGenerated: jest.fn()
  };

  const mockSuccessfulResponse = {
    success: true,
    data: {
      analysis: 'Test Analysis',
      topEmissionSource: 'transport',
      topEmissionSourceExplanation: 'Test explanation',
      recommendations: [
        { title: 'Rec 1', description: 'Desc 1', estimatedCO2Saved: 10 }
      ],
      sevenDayChallenge: {
        title: 'Weekly Test Challenge',
        days: [{ day: 1, task: 'Test Task 1' }]
      },
      predictedImprovement: {
        newScore: 80,
        co2ReductionPercent: 20,
        explanation: 'Test improvement explanation'
      }
    }
  };

  beforeEach(() => {
    fetch.mockClear();
    window.localStorage.clear();
    defaultProps.onPlanGenerated.mockClear();
  });

  test('renders initial state correctly', () => {
    render(<AICoach {...defaultProps} />);
    expect(screen.getByText('Get Personalized Action Coach Insights')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get my ai action plan/i })).toBeInTheDocument();
  });

  test('handles successful plan generation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessfulResponse
    });

    render(<AICoach {...defaultProps} />);
    
    // Click button to fetch plan
    fireEvent.click(screen.getByRole('button', { name: /get my ai action plan/i }));

    // Check loading state
    expect(screen.getByText('Consulting AI Carbon Coach...')).toBeInTheDocument();

    // Wait for the plan to render
    await waitFor(() => {
      expect(screen.getByText('AI Coach Analysis')).toBeInTheDocument();
    });

    // Check content
    expect(screen.getByText('Test Analysis')).toBeInTheDocument();
    expect(screen.getByText('transport')).toBeInTheDocument();
    expect(screen.getByText('Weekly Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('Test improvement explanation')).toBeInTheDocument();

    // Check if onPlanGenerated was called
    expect(defaultProps.onPlanGenerated).toHaveBeenCalledWith(80);
  });

  test('handles API error correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'API failed' })
    });

    render(<AICoach {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /get my ai action plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Coaching Generation Error')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to retrieve your carbon action plan. Check your server settings and try again.')).toBeInTheDocument();
  });

  test('handles rate limit error correctly', async () => {
    fetch.mockRejectedValueOnce(new Error('429 Too Many Requests'));

    render(<AICoach {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /get my ai action plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Coaching Generation Error')).toBeInTheDocument();
    });

    expect(screen.getByText('The AI Coach is currently busy helping other users. Please try again in a few moments.')).toBeInTheDocument();
  });

  test('handles local storage and checkbox interactions', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessfulResponse
    });

    render(<AICoach {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /get my ai action plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Weekly Test Challenge')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /mark day 1 challenge task as completed/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('handles accordion toggle for recommendations', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessfulResponse
    });

    render(<AICoach {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /get my ai action plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Rec 1')).toBeInTheDocument();
    });

    const accordionBtn = screen.getByRole('button', { name: /rec 1/i });
    
    // Description shouldn't be visible yet
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(accordionBtn);
    expect(screen.getByText('Desc 1')).toBeInTheDocument();

    // Click to close
    fireEvent.click(accordionBtn);
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();
  });
});
