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
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableEmailVerification: boolean;
  enableSocialLogin: boolean;
  sessionTimeout: number;
  autoLogout: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    // API Configuration
    apiUrl: process.env.REACT_APP_API_URL || 'https://dara-medics.vercel.app',
    
    // Environment
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
    
    // Feature Flags
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableDebug: process.env.REACT_APP_DEBUG_MODE === 'true' || isDevelopment,
    
    // API Settings
    mockApi: process.env.REACT_APP_MOCK_API === 'true',
    logLevel: (process.env.REACT_APP_LOG_LEVEL as any) || (isProduction ? 'error' : 'debug'),
    
    // External Services
    googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    sentryDsn: process.env.REACT_APP_SENTRY_DSN,
    
    // Supabase Configuration
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
    supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    enableEmailVerification: process.env.REACT_APP_ENABLE_EMAIL_VERIFICATION !== 'false',
    enableSocialLogin: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true',
    sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT || '1440'),
    autoLogout: process.env.REACT_APP_AUTO_LOGOUT !== 'false',
  };
};

export const config = getEnvironmentConfig();

// Validation
if (!config.apiUrl) {
  console.warn('REACT_APP_API_URL is not set. API calls may fail.');
}

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('Supabase configuration is missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables');
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
  supabaseUrl,
  supabaseAnonKey,
  enableEmailVerification,
  enableSocialLogin,
  sessionTimeout,
  autoLogout,
} = config;

export default config;
