import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { calculateTotalEmissions, calculateCarbonScore } from '../utils/carbonCalculator';

/**
 * Calculator component for EcoSense AI.
 * Renders a validated, accessible carbon footprint input form.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onCalculate - Callback function triggered after calculations succeed
 * @param {Object} [props.prefilledValues] - Optional external values to populate form state
 * @returns {React.ReactElement} The carbon footprint calculator component
 */
export default function Calculator({ onCalculate, prefilledValues }) {
  const [values, setValues] = useState({
    transport: '',
    foodHabit: 'veg',
    electricity: ''
  });

  const [errors, setErrors] = useState({
    transport: '',
    foodHabit: '',
    electricity: ''
  });

  useEffect(() => {
    if (prefilledValues) {
      setValues((prev) => {
        const nextValues = { ...prev };
        if (prefilledValues.transport !== undefined && prefilledValues.transport !== null) {
          nextValues.transport = String(prefilledValues.transport);
        }
        if (prefilledValues.electricity !== undefined && prefilledValues.electricity !== null) {
          nextValues.electricity = String(prefilledValues.electricity);
        }
        if (prefilledValues.foodHabit !== undefined && prefilledValues.foodHabit !== null) {
          nextValues.foodHabit = String(prefilledValues.foodHabit);
        }
        return nextValues;
      });
      // Clear errors on autofill
      setErrors({ transport: '', foodHabit: '', electricity: '' });
    }
  }, [prefilledValues]);

  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Blocks negative signs, exponents, and operator signs in number fields
  const handleKeyPress = useCallback((e) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  }, []);

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error message when the user starts typing/correcting
    if (value !== '') {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = { transport: '', foodHabit: '', electricity: '' };
    let isValid = true;

    // Transport validation
    if (values.transport === '') {
      newErrors.transport = 'Transport distance is required.';
      isValid = false;
    } else {
      const transportNum = parseFloat(values.transport);
      if (isNaN(transportNum) || transportNum < 0) {
        newErrors.transport = 'Transport distance must be a non-negative number.';
        isValid = false;
      }
    }

    // Electricity validation
    if (values.electricity === '') {
      newErrors.electricity = 'Electricity usage is required.';
      isValid = false;
    } else {
      const electricityNum = parseFloat(values.electricity);
      if (isNaN(electricityNum) || electricityNum < 0) {
        newErrors.electricity = 'Electricity usage must be a non-negative number.';
        isValid = false;
      }
    }

    // Food Habit validation
    if (!['veg', 'mixed', 'non-veg'].includes(values.foodHabit)) {
      newErrors.foodHabit = 'Please select a valid food habit.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [values]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAnnouncement('Calculation failed. Please check the inline error messages.');
      return;
    }

    setIsLoading(true);
    setAnnouncement('Calculating your carbon footprint emissions...');

    // Simulate standard computation delay for polished micro-interaction experience
    setTimeout(() => {
      try {
        const transportVal = parseFloat(values.transport);
        const electricityVal = parseFloat(values.electricity);
        
        const emissionBreakdown = calculateTotalEmissions(
          transportVal,
          values.foodHabit,
          electricityVal
        );
        const score = calculateCarbonScore(emissionBreakdown.total);

        setAnnouncement('Emissions calculation successfully updated.');
        
        if (onCalculate) {
          onCalculate({
            breakdown: emissionBreakdown,
            score,
            rawInputs: {
              transport: transportVal,
              foodHabit: values.foodHabit,
              electricity: electricityVal
            }
          });
        }
      } catch (err) {
        setAnnouncement(`Error calculating emissions: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [values, validateForm, onCalculate]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
      {/* Hidden live region to announce calculation events to screen readers */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <fieldset className="space-y-6">
          <legend className="text-xl font-bold font-display text-white mb-2">
            Calculate Your Emissions
          </legend>
          <p className="text-slate-400 text-sm mb-6">
            Enter your environmental statistics below to estimate your monthly carbon footprint score.
          </p>

          {/* Transport Input */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="transport-input" className="text-sm font-semibold text-slate-200">
                Transport Distance
              </label>
              <span className="text-xs text-slate-400 font-medium">km / week</span>
            </div>
            <input
              id="transport-input"
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={values.transport}
              onKeyPress={handleKeyPress}
              onChange={(e) => handleChange('transport', e.target.value)}
              aria-label="Transport distance in kilometers per week"
              aria-invalid={errors.transport ? 'true' : 'false'}
              aria-describedby={errors.transport ? 'transport-error' : undefined}
              className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.transport 
                  ? 'border-red-500/50 focus-visible:border-red-500' 
                  : 'border-slate-800 hover:border-slate-700 focus-visible:border-emerald-500'
              }`}
            />
            {errors.transport && (
              <span id="transport-error" className="text-red-400 text-xs font-medium mt-1">
                {errors.transport}
              </span>
            )}
          </div>

          {/* Food Habit Dropdown */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="food-select" className="text-sm font-semibold text-slate-200">
              Dietary Habits
            </label>
            <div className="relative">
              <select
                id="food-select"
                value={values.foodHabit}
                onChange={(e) => handleChange('foodHabit', e.target.value)}
                aria-label="Your primary food diet category"
                aria-invalid={errors.foodHabit ? 'true' : 'false'}
                aria-describedby={errors.foodHabit ? 'food-error' : undefined}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 appearance-none"
              >
                <option value="veg">Vegetarian (Low emissions)</option>
                <option value="mixed">Mixed Diet (Average emissions)</option>
                <option value="non-veg">Non-Vegetarian (High emissions)</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.foodHabit && (
              <span id="food-error" className="text-red-400 text-xs font-medium mt-1">
                {errors.foodHabit}
              </span>
            )}
          </div>

          {/* Electricity Input */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="electricity-input" className="text-sm font-semibold text-slate-200">
                Electricity Usage
              </label>
              <span className="text-xs text-slate-400 font-medium">kWh / month</span>
            </div>
            <input
              id="electricity-input"
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={values.electricity}
              onKeyPress={handleKeyPress}
              onChange={(e) => handleChange('electricity', e.target.value)}
              aria-label="Electricity usage in kilowatt-hours per month"
              aria-invalid={errors.electricity ? 'true' : 'false'}
              aria-describedby={errors.electricity ? 'electricity-error' : undefined}
              className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.electricity 
                  ? 'border-red-500/50 focus-visible:border-red-500' 
                  : 'border-slate-800 hover:border-slate-700 focus-visible:border-emerald-500'
              }`}
            />
            {errors.electricity && (
              <span id="electricity-error" className="text-red-400 text-xs font-medium mt-1">
                {errors.electricity}
              </span>
            )}
          </div>
        </fieldset>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading || Object.values(errors).some((e) => e !== '')}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-850 disabled:text-slate-500 disabled:border-slate-800 text-slate-950 font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed border border-transparent"
        >
          {isLoading ? (
            <>
              {/* Spinner Icon */}
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Calculating...</span>
            </>
          ) : (
            <span>Compute Footprint</span>
          )}
        </button>
      </form>
    </div>
  );
}

Calculator.propTypes = {
  onCalculate: PropTypes.func.isRequired,
  prefilledValues: PropTypes.shape({
    transport: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    electricity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    foodHabit: PropTypes.string,
  }),
};

Calculator.defaultProps = {
  prefilledValues: null,
};

