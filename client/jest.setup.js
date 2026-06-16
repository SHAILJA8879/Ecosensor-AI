import React from 'react';
import '@testing-library/jest-dom';
// Global mock for react-chartjs-2 to prevent canvas errors in JSDOM
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
  Line: () => <div data-testid="mock-line" />,
  Bar: () => <div data-testid="mock-bar" />
}));
