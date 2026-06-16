import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/layout/Footer';

describe('Footer Component', () => {
  test('renders footer text correctly', () => {
    render(<Footer />);
    expect(screen.getByText(/EcoSense AI/i)).toBeInTheDocument();
  });
});
