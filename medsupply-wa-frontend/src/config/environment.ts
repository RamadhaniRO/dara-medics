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
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // API Configuration - Always use production URL
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-domain.vercel.app',
    
    // Environment - Always production
    environment: 'production',
    
    // Feature Flags - Production settings
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableDebug: false,
    
    // Production settings
    mockApi: false,
    logLevel: 'error',
    
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
