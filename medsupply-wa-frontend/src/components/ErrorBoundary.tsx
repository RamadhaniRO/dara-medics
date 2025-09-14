import { Component, ErrorInfo, ReactNode } from 'react';
import { classifyError, AppError } from '../services/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: (error: AppError) => ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    const appError = classifyError(error);
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const appError = classifyError(error);
    console.error('ErrorBoundary caught an error:', appError, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      
      // Return a simple error message for now
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
