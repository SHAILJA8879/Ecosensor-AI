import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../../components/layout/HeroSection';

describe('HeroSection Component', () => {
  test('renders text correctly', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Carbon Footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Get personalized AI insights/i)).toBeInTheDocument();
  });

  test('button scrolls to calculator', () => {
    render(<HeroSection />);
    
    // Mock the DOM element and scrollIntoView
    const mockScrollIntoView = jest.fn();
    const mockElement = document.createElement('div');
    mockElement.id = 'calculator-section';
    mockElement.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(mockElement);

    const btn = screen.getByRole('button', { name: /calculate my footprint/i });
    fireEvent.click(btn);

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Cleanup
    document.body.removeChild(mockElement);
  });
});
