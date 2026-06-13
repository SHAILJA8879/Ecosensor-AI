import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders EcoSense AI heading and dashboard structure', () => {
    render(<App />);
    
    // Check if the welcome heading renders
    const headingElement = screen.getByRole('heading', { 
      name: /carbon footprint dashboard/i 
    });
    expect(headingElement).toBeInTheDocument();

    // Check if navigation landmarks are accessible
    const navElement = screen.getByRole('navigation', { 
      name: /main navigation/i 
    });
    expect(navElement).toBeInTheDocument();
  });
});
