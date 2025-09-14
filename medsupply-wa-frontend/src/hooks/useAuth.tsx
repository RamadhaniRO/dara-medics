import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiClient, User, RegisterRequest, RegisterResponse } from '../services/api';
import { frontendAuthConfig } from '../config/auth.config';

// User interface is now imported from api.ts

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'microsoft' | 'apple') => Promise<void>;
  handleSocialCallback: (token: string, provider: string) => Promise<void>;
  getSocialProviders: () => Promise<any[]>;
  loading: boolean;
  isAuthenticated: boolean;
}

// RegisterData interface is now imported from api.ts as RegisterRequest

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Log environment configuration on initialization
  useEffect(() => {
    if (frontendAuthConfig.development.enableConsoleLogs) {
      console.log('🔐 Auth Provider initialized');
      console.log('🌍 Environment:', frontendAuthConfig.environment);
      console.log('📧 Email verification enabled:', frontendAuthConfig.auth.enableEmailVerification);
      console.log('🔗 API Base URL:', frontendAuthConfig.api.baseUrl);
    }
  }, []);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = apiClient.getToken();
    if (token) {
      // Validate token with backend
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await apiClient.validateToken();
      
      if (response.data) {
        setUser(response.data);
        console.log('✅ Token validation successful, user authenticated:', response.data.email);
      } else {
        console.log('❌ Token validation failed, clearing token');
        apiClient.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      apiClient.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.login({ email, password });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      console.log('Sending registration request to API:', userData);
      console.log('Full userData object:', JSON.stringify(userData, null, 2));
      const response = await apiClient.register(userData);

      if (response.error) {
        console.error('API returned error:', response.error);
        throw new Error(response.error);
      }

      console.log('Registration API response:', response);
      
      // Return the response data for the component to use
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      const response = await apiClient.changePassword(currentPassword, newPassword);

      if (response.error) {
        throw new Error(response.error);
      }

      // Password changed successfully
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const socialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      setLoading(true);
      await apiClient.initiateSocialLogin(provider);
      // The redirect will happen automatically
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSocialCallback = async (token: string, provider: string) => {
    try {
      setLoading(true);
      const response = await apiClient.handleSocialCallback(token, provider);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setUser(response.data.user);
        console.log('Social login successful:', response.data.user.email);
      }
    } catch (error) {
      console.error('Social callback error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSocialProviders = async () => {
    try {
      const response = await apiClient.getSocialAuthProviders();
      return response.data?.providers || [];
    } catch (error) {
      console.error('Failed to get social providers:', error);
      return [];
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    changePassword,
    socialLogin,
    handleSocialCallback,
    getSocialProviders,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
