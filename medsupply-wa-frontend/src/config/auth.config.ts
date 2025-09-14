// Frontend authentication configuration for different environments
export interface FrontendAuthConfig {
  // Environment detection
  environment: 'development' | 'staging' | 'production';
  
  // API configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  
  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    // Client-side settings
    enableEmailConfirmation: boolean;
    enablePasswordReset: boolean;
  };
  
  // Authentication flow settings
  auth: {
    enableEmailVerification: boolean;
    enablePasswordReset: boolean;
    enableSocialLogin: boolean;
    enableRememberMe: boolean;
    sessionTimeout: number; // in minutes
    autoLogout: boolean;
  };
  
  // UI/UX settings
  ui: {
    enableDebugMode: boolean;
    showEnvironmentBanner: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  
  // Development settings
  development: {
    skipEmailVerification: boolean;
    mockApi: boolean;
    enableConsoleLogs: boolean;
  };
}

export const getFrontendAuthConfig = (): FrontendAuthConfig => {
  const environment = (process.env.REACT_APP_ENV as 'development' | 'staging' | 'production') || 
                     (process.env.NODE_ENV === 'development' ? 'development' : 'production');
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';
  
  return {
    environment,
    
    api: {
      baseUrl: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3000' : ''),
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3'),
    },
    
    supabase: {
      url: process.env.REACT_APP_SUPABASE_URL || '',
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
      enableEmailConfirmation: !isDevelopment || process.env.REACT_APP_ENABLE_EMAIL_CONFIRMATION === 'true',
      enablePasswordReset: true,
    },
    
    auth: {
      enableEmailVerification: !isDevelopment || process.env.REACT_APP_ENABLE_EMAIL_VERIFICATION === 'true',
      enablePasswordReset: true,
      enableSocialLogin: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true',
      enableRememberMe: true,
      sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT || '1440'), // 24 hours
      autoLogout: process.env.REACT_APP_AUTO_LOGOUT !== 'false',
    },
    
    ui: {
      enableDebugMode: isDevelopment || process.env.REACT_APP_DEBUG_MODE === 'true',
      showEnvironmentBanner: !isProduction && process.env.REACT_APP_SHOW_ENV_BANNER !== 'false',
      enableAnalytics: isProduction && process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
      enableErrorReporting: isProduction && process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
    },
    
    development: {
      skipEmailVerification: isDevelopment && process.env.REACT_APP_SKIP_EMAIL_VERIFICATION !== 'false',
      mockApi: isDevelopment && process.env.REACT_APP_MOCK_API === 'true',
      enableConsoleLogs: isDevelopment || process.env.REACT_APP_ENABLE_CONSOLE_LOGS === 'true',
    },
  };
};

export const frontendAuthConfig = getFrontendAuthConfig();

// Validation
export const validateFrontendAuthConfig = (config: FrontendAuthConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.api.baseUrl) {
    errors.push('REACT_APP_API_URL is required');
  }
  
  if (!config.supabase.url) {
    errors.push('REACT_APP_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('REACT_APP_SUPABASE_ANON_KEY is required');
  }
  
  if (config.environment === 'production' && !config.api.baseUrl.startsWith('https://')) {
    errors.push('API URL should use HTTPS in production');
  }
  
  return errors;
};

// Export validation result
export const frontendAuthConfigErrors = validateFrontendAuthConfig(frontendAuthConfig);

if (frontendAuthConfigErrors.length > 0) {
  console.warn('⚠️  Frontend auth configuration warnings:', frontendAuthConfigErrors);
}

// Environment banner component data
export const getEnvironmentBanner = () => {
  if (!frontendAuthConfig.ui.showEnvironmentBanner) return null;
  
  const banners = {
    development: {
      text: 'Development Environment',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    staging: {
      text: 'Staging Environment',
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    production: null,
  };
  
  return banners[frontendAuthConfig.environment] || null;
};

export default frontendAuthConfig;
