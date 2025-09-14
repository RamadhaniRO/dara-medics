// Authentication configuration for different environments
export interface AuthConfig {
  // Environment detection
  environment: 'development' | 'staging' | 'production';
  
  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    // Email verification settings
    emailRedirectTo?: string;
    enableEmailConfirmation: boolean;
  };
  
  // JWT configuration
  jwt: {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
  };
  
  // CORS configuration
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  
  // Security settings
  security: {
    enableRateLimit: boolean;
    enableHttps: boolean;
    enableCors: boolean;
    sessionSecret: string;
  };
  
  // Feature flags
  features: {
    enableEmailVerification: boolean;
    enablePasswordReset: boolean;
    enableSocialLogin: boolean;
    enableRememberMe: boolean;
    enableTwoFactor: boolean;
  };
  
  // Development settings
  development: {
    skipEmailVerification: boolean;
    mockAuth: boolean;
    debugMode: boolean;
  };
}

export const getAuthConfig = (): AuthConfig => {
  const environment = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';
  
  // Base URL configuration
  const baseUrl = process.env.BASE_URL || (isDevelopment ? 'http://localhost:3000' : 'https://your-domain.com');
  const frontendUrl = process.env.FRONTEND_URL || (isDevelopment ? 'http://localhost:3001' : 'https://your-frontend-domain.com');
  
  return {
    environment,
    
    supabase: {
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      // Email redirect configuration based on environment
      emailRedirectTo: isDevelopment ? undefined : `${frontendUrl}/auth/verify`,
      enableEmailConfirmation: !isDevelopment || process.env.ENABLE_EMAIL_CONFIRMATION === 'true',
    },
    
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || baseUrl,
      audience: process.env.JWT_AUDIENCE || frontendUrl,
    },
    
    cors: {
      origin: isDevelopment 
        ? [frontendUrl, 'http://localhost:3001', 'http://127.0.0.1:3001']
        : frontendUrl,
      credentials: true,
    },
    
    security: {
      enableRateLimit: isProduction || process.env.ENABLE_RATE_LIMIT === 'true',
      enableHttps: isProduction || process.env.ENABLE_HTTPS === 'true',
      enableCors: true,
      sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret',
    },
    
    features: {
      enableEmailVerification: !isDevelopment || process.env.ENABLE_EMAIL_VERIFICATION === 'true',
      enablePasswordReset: true,
      enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
      enableRememberMe: true,
      enableTwoFactor: process.env.ENABLE_TWO_FACTOR === 'true',
    },
    
    development: {
      skipEmailVerification: isDevelopment && process.env.SKIP_EMAIL_VERIFICATION !== 'false',
      mockAuth: isDevelopment && process.env.MOCK_AUTH === 'true',
      debugMode: isDevelopment || process.env.DEBUG_MODE === 'true',
    },
  };
};

export const authConfig = getAuthConfig();

// Validation
export const validateAuthConfig = (config: AuthConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('SUPABASE_ANON_KEY is required');
  }
  
  if (!config.supabase.serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  
  if (!config.jwt.secret || config.jwt.secret === 'fallback-secret-key-change-in-production') {
    if (config.environment === 'production') {
      errors.push('JWT_SECRET must be set in production');
    }
  }
  
  if (config.environment === 'production' && !config.security.enableHttps) {
    errors.push('HTTPS should be enabled in production');
  }
  
  return errors;
};

// Export validation result
export const authConfigErrors = validateAuthConfig(authConfig);

if (authConfigErrors.length > 0) {
  console.warn('⚠️  Auth configuration warnings:', authConfigErrors);
}
