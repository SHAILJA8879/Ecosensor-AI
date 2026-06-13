import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from '../components/Calculator';

describe('Calculator', () => {
  let onCalculateMock;

  beforeEach(() => {
    onCalculateMock = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should render all input fields with correct labels when mounted', () => {
    render(<Calculator onCalculate={onCalculateMock} />);

    // Check Transport Distance input and label
    const transportInput = screen.getByLabelText(/transport distance in kilometers per week/i);
    expect(transportInput).toBeInTheDocument();
    expect(screen.getByText(/transport distance/i)).toBeInTheDocument();

    // Check Dietary Habits dropdown and label
    const foodSelect = screen.getByLabelText(/your primary food diet category/i);
    expect(foodSelect).toBeInTheDocument();
    expect(screen.getByText(/dietary habits/i)).toBeInTheDocument();

    // Check Electricity Usage input and label
    const electricityInput = screen.getByLabelText(/electricity usage in kilowatt-hours per month/i);
    expect(electricityInput).toBeInTheDocument();
    expect(screen.getByText(/electricity usage/i)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /compute footprint/i })).toBeInTheDocument();
  });

  it('should show validation error when inputs are negative on submit', async () => {
    render(<Calculator onCalculate={onCalculateMock} />);

    const transportInput = screen.getByLabelText(/transport distance in kilometers per week/i);
    const electricityInput = screen.getByLabelText(/electricity usage in kilowatt-hours per month/i);
    const submitButton = screen.getByRole('button', { name: /compute footprint/i });

    // Try setting negative values (bypass keypress validation by assigning value directly)
    fireEvent.change(transportInput, { target: { value: '-10' } });
    fireEvent.change(electricityInput, { target: { value: '-5' } });

    fireEvent.click(submitButton);

    // Errors should be displayed inline
    expect(await screen.findByText(/transport distance must be a non-negative number/i)).toBeInTheDocument();
    expect(await screen.findByText(/electricity usage must be a non-negative number/i)).toBeInTheDocument();
    expect(onCalculateMock).not.toHaveBeenCalled();
  });

  it('should show validation error when inputs are empty on submit', async () => {
    render(<Calculator onCalculate={onCalculateMock} />);

    const submitButton = screen.getByRole('button', { name: /compute footprint/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/transport distance is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/electricity usage is required/i)).toBeInTheDocument();
    expect(onCalculateMock).not.toHaveBeenCalled();
  });

  it('should call onCalculate callback with correct values when form is submitted with valid inputs', async () => {
    render(<Calculator onCalculate={onCalculateMock} />);

    const transportInput = screen.getByLabelText(/transport distance in kilometers per week/i);
    const foodSelect = screen.getByLabelText(/your primary food diet category/i);
    const electricityInput = screen.getByLabelText(/electricity usage in kilowatt-hours per month/i);
    const submitButton = screen.getByRole('button', { name: /compute footprint/i });

    // Set valid values
    fireEvent.change(transportInput, { target: { value: '100' } });
    fireEvent.change(foodSelect, { target: { value: 'veg' } });
    fireEvent.change(electricityInput, { target: { value: '200' } });

    // Submit form
    fireEvent.click(submitButton);

    // Fast-forward timers to skip calculation delay (600ms)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(onCalculateMock).toHaveBeenCalledTimes(1);
    });

    expect(onCalculateMock).toHaveBeenCalledWith({
      breakdown: {
        transport: expect.any(Number),
        food: 45,
        electricity: 164,
        total: expect.any(Number)
      },
      score: expect.any(Number),
      rawInputs: {
        transport: 100,
        foodHabit: 'veg',
        electricity: 200
      }
    });
  });

  it('should prepopulate fields when prefilledValues props are provided', () => {
    const prefilled = {
      transport: 120,
      foodHabit: 'non-veg',
      electricity: 300
    };

    render(<Calculator onCalculate={onCalculateMock} prefilledValues={prefilled} />);

    expect(screen.getByLabelText(/transport distance in kilometers per week/i).value).toBe('120');
    expect(screen.getByLabelText(/your primary food diet category/i).value).toBe('non-veg');
    expect(screen.getByLabelText(/electricity usage in kilowatt-hours per month/i).value).toBe('300');
  });
});
