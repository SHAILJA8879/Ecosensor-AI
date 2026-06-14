import React from 'react';
import PropTypes from 'prop-types';

/**
 * @description Catches React rendering errors and displays fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EcoSense Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-screen p-8"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            Please refresh the page and try again
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg"
            aria-label="Reload the application"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
