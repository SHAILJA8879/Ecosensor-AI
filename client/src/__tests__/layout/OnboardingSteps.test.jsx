import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingSteps from '../../components/layout/OnboardingSteps';

describe('OnboardingSteps Component', () => {
  test('renders all three onboarding steps', () => {
    render(<OnboardingSteps />);
    
    expect(screen.getByText(/Your Onboarding Journey/i)).toBeInTheDocument();
    
    // Step 1
    expect(screen.getByText('Calculate')).toBeInTheDocument();
    expect(screen.getByText(/Compute your transport/i)).toBeInTheDocument();

    // Step 2
    expect(screen.getByText('Get AI Insights')).toBeInTheDocument();
    expect(screen.getByText(/Receive your Carbon Health Score/i)).toBeInTheDocument();

    // Step 3
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText(/Log calculations/i)).toBeInTheDocument();
  });
});
