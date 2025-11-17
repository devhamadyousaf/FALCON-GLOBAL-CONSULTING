import React from 'react';
import Toast from './Toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showToast: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Check if this is a Supabase AuthApiError
    const isAuthError = error?.name === 'AuthApiError' || error?.constructor?.name === 'AuthApiError';
    
    if (isAuthError) {
      console.log('Auth error caught and suppressed by ErrorBoundary');
      // For auth errors, just show the toast and don't break the app
      this.setState({
        error,
        errorInfo,
        showToast: true,
        hasError: false // Don't break the app for auth errors
      });
    } else {
      // For other errors, set hasError to true
      this.setState({
        error,
        errorInfo,
        showToast: true,
        hasError: true
      });
    }

    // Auto-hide toast after 5 seconds and reset error
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showToast: false
      });
    }, 5000);
  }

  getErrorMessage = () => {
    const { error } = this.state;

    if (!error) return 'An unexpected error occurred';

    // Handle specific error types with user-friendly messages
    const message = error.message || error.toString();
    const errorName = error.name || error.constructor?.name || '';

    // Supabase Auth errors
    if (errorName === 'AuthApiError' || errorName.includes('Auth')) {
      if (message.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (message.includes('Email not confirmed')) {
        return 'Please verify your email before continuing. Check your inbox.';
      }
      if (message.includes('Too many requests')) {
        return 'Too many attempts. Please wait a moment and try again.';
      }
      if (message.includes('request this after')) {
        return 'Please wait a moment before trying again.';
      }
    }

    // Network errors
    if (message.includes('fetch failed') || message.includes('NetworkError')) {
      return 'Network error. Please check your internet connection.';
    }

    // Database errors
    if (message.includes('RLS') || message.includes('Row Level Security')) {
      return 'Permission denied. Please contact support if this persists.';
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }

    // Generic fallback
    return 'An error occurred. Please try again.';
  };

  render() {
    const { hasError, showToast } = this.state;
    const { children } = this.props;

    // Show toast with error message but DON'T break the UI
    // Just show the toast and let the app continue
    return (
      <>
        {children}
        {showToast && (
          <Toast
            message={this.getErrorMessage()}
            type="error"
            onClose={() => this.setState({ showToast: false, hasError: false })}
            duration={5000}
          />
        )}
      </>
    );
  }
}

export default ErrorBoundary;
