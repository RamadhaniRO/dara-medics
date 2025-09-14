import { toast } from 'react-hot-toast';
import { config } from '../config/environment';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

// Error classification
export const classifyError = (error: any): AppError => {
  const timestamp = new Date();
  
  // Network errors
  if (!navigator.onLine) {
    return {
      type: ErrorType.NETWORK,
      message: 'No internet connection. Please check your network and try again.',
      timestamp
    };
  }

  // Fetch/API errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to the server. Please try again later.',
      timestamp
    };
  }

  // HTTP status code errors
  if (error.status || error.response?.status) {
    const status = error.status || error.response?.status;
    
    switch (status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Your session has expired. Please log in again.',
          code: status,
          timestamp
        };
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'You do not have permission to perform this action.',
          code: status,
          timestamp
        };
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: error.message || 'Invalid request. Please check your input.',
          code: status,
          timestamp
        };
      case 404:
        return {
          type: ErrorType.SERVER,
          message: 'The requested resource was not found.',
          code: status,
          timestamp
        };
      case 500:
        return {
          type: ErrorType.SERVER,
          message: 'Server error. Please try again later.',
          code: status,
          timestamp
        };
      default:
        return {
          type: ErrorType.SERVER,
          message: `Server error (${status}). Please try again later.`,
          code: status,
          timestamp
        };
    }
  }

  // String errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      timestamp
    };
  }

  // Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      details: config.enableDebug ? error.stack : undefined,
      timestamp
    };
  }

  // Fallback
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    details: config.enableDebug ? error : undefined,
    timestamp
  };
};

// Error handling strategies
export const handleError = (error: any, options: {
  showToast?: boolean;
  logError?: boolean;
  onError?: (appError: AppError) => void;
} = {}): AppError => {
  const appError = classifyError(error);
  
  // Log error if enabled
  if (options.logError !== false && config.enableDebug) {
    console.error('Application Error:', appError);
  }

  // Show toast notification
  if (options.showToast !== false) {
    const toastMessage = getToastMessage(appError);
    const toastType = getToastType(appError.type);
    
    if (toastType === 'error') {
      toast.error(toastMessage);
    } else if (toastType === 'warning') {
      toast.error(toastMessage); // Using error style for warnings too
    } else {
      toast(toastMessage);
    }
  }

  // Call custom error handler
  if (options.onError) {
    options.onError(appError);
  }

  return appError;
};

// Get appropriate toast message
const getToastMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return '🌐 ' + error.message;
    case ErrorType.AUTHENTICATION:
      return '🔐 ' + error.message;
    case ErrorType.AUTHORIZATION:
      return '🚫 ' + error.message;
    case ErrorType.VALIDATION:
      return '⚠️ ' + error.message;
    case ErrorType.SERVER:
      return '🔧 ' + error.message;
    default:
      return '❌ ' + error.message;
  }
};

// Get toast type based on error type
const getToastType = (errorType: ErrorType): 'error' | 'warning' | 'info' => {
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
    case ErrorType.SERVER:
      return 'error';
    case ErrorType.VALIDATION:
    case ErrorType.NETWORK:
      return 'warning';
    default:
      return 'error';
  }
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason, {
      showToast: true,
      logError: true
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    handleError(event.error, {
      showToast: true,
      logError: true
    });
  });
};

// Error boundary helper - returns a function that creates DOM elements
export const createErrorBoundaryFallback = (error: AppError) => {
  return () => {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 2rem;
      text-align: center;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin: 1rem;
    `;

    const heading = document.createElement('h2');
    heading.textContent = 'Something went wrong';
    heading.style.cssText = 'color: #dc2626; margin-bottom: 1rem;';

    const message = document.createElement('p');
    message.textContent = error.message;
    message.style.cssText = 'color: #7f1d1d; margin-bottom: 1rem;';

    const button = document.createElement('button');
    button.textContent = 'Reload Page';
    button.style.cssText = `
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    `;
    button.onclick = () => window.location.reload();

    container.appendChild(heading);
    container.appendChild(message);
    container.appendChild(button);

    return container;
  };
};

export default {
  classifyError,
  handleError,
  setupGlobalErrorHandling,
  createErrorBoundaryFallback
};
