import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService, AuthUser, RegisterData } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'microsoft' | 'apple') => Promise<void>;
  handleSocialCallback: (token: string, provider: string) => Promise<void>;
  getSocialProviders: () => Promise<any[]>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Set a timeout to ensure loading doesn't persist indefinitely
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        const user = await authService.getCurrentUser();
        
        console.log('Initial session check:', { 
          hasSession: !!session, 
          hasUser: !!user, 
          sessionUser: !!session?.user 
        });
        
        if (isMounted) {
          setSession(session);
          setUser(user);
          
          // If we have a session but no user, clear the session
          if (session && !user) {
            console.log('Session exists but no user - clearing session');
            setSession(null);
            await authService.signOut();
          }
          
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    };

    getInitialSession();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (isMounted) {
        setSession(session);
        
        if (session?.user) {
          console.log('Session has user, fetching user data...');
          console.log('Session user details:', session.user);
          try {
            const user = await authService.getCurrentUser();
            console.log('Fetched user data:', user);
            if (user) {
              console.log('Setting user state with:', user);
              setUser(user);
            } else {
              console.log('getCurrentUser returned null, this should not happen');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If we can't get user data, clear the session
            setSession(null);
            setUser(null);
          }
        } else {
          console.log('No session user, clearing user data');
          setUser(null);
        }
        
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.signIn({ email, password });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (!result.user) {
        throw new Error('Login failed');
      }
      
      setUser(result.user);
      setSession(result.session);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const result = await authService.signUp(userData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (!result.user) {
        throw new Error('Registration failed');
      }
      
      // Note: User will need to verify email before they can log in
      // Don't set user state until email is verified
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await authService.updatePassword(newPassword);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await authService.signInWithProvider(provider);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // User will be redirected to OAuth provider
    } catch (error: any) {
      console.error('Social login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSocialCallback = async (token: string, provider: string) => {
    // This is handled automatically by Supabase auth state change listener
    console.log('Social callback handled by Supabase');
  };

  const getSocialProviders = async () => {
    // Return available providers
    return [
      { id: 'google', name: 'Google' },
      { id: 'microsoft', name: 'Microsoft' },
      { id: 'apple', name: 'Apple' }
    ];
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    logout,
    register,
    changePassword,
    socialLogin,
    handleSocialCallback,
    getSocialProviders,
    loading,
    isAuthenticated: !!user && !!session && !!session.user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
