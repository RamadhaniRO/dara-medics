// Environment configuration for the frontend application

interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableDebug: boolean;
  mockApi: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  googleAnalyticsId?: string;
  sentryDsn?: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // API Configuration
    apiUrl: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3000' : ''),
    
    // Environment
    environment: (process.env.REACT_APP_ENV as any) || (isDevelopment ? 'development' : 'production'),
    
    // Feature Flags
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' && isProduction,
    enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true' || isDevelopment,
    
    // Development
    mockApi: process.env.REACT_APP_MOCK_API === 'true',
    logLevel: (process.env.REACT_APP_LOG_LEVEL as any) || (isDevelopment ? 'debug' : 'error'),
    
    // External Services
    googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  };
};

export const config = getEnvironmentConfig();

// Validation
if (!config.apiUrl) {
  console.warn('REACT_APP_API_URL is not set. API calls may fail.');
}

// Export individual config values for convenience
export const {
  apiUrl,
  environment,
  enableAnalytics,
  enableDebug,
  mockApi,
  logLevel,
  googleAnalyticsId,
  sentryDsn,
} = config;

export default config;
