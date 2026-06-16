import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../components/layout/Header';

describe('Header Component', () => {
  test('renders logo correctly', () => {
    render(<Header activeTab="calculator" setActiveTab={jest.fn()} />);
    expect(screen.getByText(/EcoSense/i)).toBeInTheDocument();
    expect(screen.getByText(/AI/i)).toBeInTheDocument();
  });

  test('calls setActiveTab when navigation buttons are clicked', () => {
    const setActiveTabMock = jest.fn();
    render(<Header activeTab="calculator" setActiveTab={setActiveTabMock} />);
    
    const dashboardBtn = screen.getByRole('button', { name: /dashboard/i });
    fireEvent.click(dashboardBtn);
    
    expect(setActiveTabMock).toHaveBeenCalledWith('dashboard');
  });

  test('applies active styling to the correct tab', () => {
    const { rerender } = render(<Header activeTab="calculator" setActiveTab={jest.fn()} />);
    
    const calcBtn = screen.getByRole('button', { name: /calculator/i });
    const dashboardBtn = screen.getByRole('button', { name: /dashboard/i });
    
    expect(calcBtn).toHaveAttribute('aria-current', 'page');
    expect(dashboardBtn).not.toHaveAttribute('aria-current');

    // Re-render with dashboard active
    rerender(<Header activeTab="dashboard" setActiveTab={jest.fn()} />);
    
    expect(dashboardBtn).toHaveAttribute('aria-current', 'page');
    expect(calcBtn).not.toHaveAttribute('aria-current');
  });
});
