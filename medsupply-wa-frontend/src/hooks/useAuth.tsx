import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService, AuthUser, RegisterData } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ needsVerification: boolean; message: string } | void>;
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
        
        console.log('Initial session check:', { 
          hasSession: !!session, 
          sessionUser: !!session?.user 
        });
        
        if (isMounted) {
          setSession(session);
          
          if (session?.user) {
            // Create user data directly from session
            const userData = {
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || 'User',
              pharmacy_name: session.user.user_metadata?.pharmacy_name || 'Pharmacy',
              role: 'pharmacy_owner',
              created_at: session.user.created_at
            };
            console.log('Initial user data from session:', userData);
            setUser(userData);
          } else {
            setUser(null);
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
          console.log('Session has user, creating user data directly...');
          console.log('Session user details:', session.user);
          
          // Create user data directly from session instead of calling getCurrentUser
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || 'User',
            pharmacy_name: session.user.user_metadata?.pharmacy_name || 'Pharmacy',
            role: 'pharmacy_owner',
            created_at: session.user.created_at
          };
          
          console.log('Created user data directly from session:', userData);
          setUser(userData);
        } else {
          console.log('No session user, clearing user data');
          setUser(null);
        }
        
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    // Force a refresh after a short delay to ensure state is updated
    const forceRefresh = setTimeout(() => {
      if (isMounted) {
        console.log('Force refresh triggered - checking auth state');
        getInitialSession();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      clearTimeout(forceRefresh);
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
      
      // When email verification is enabled, Supabase doesn't return user/session immediately
      // Instead, it sends a verification email
      if (result.user && !result.session) {
        // User created but needs email verification
        console.log('User created, email verification sent');
        // Don't set user state - they need to verify email first
        return { needsVerification: true, message: 'Please check your email to verify your account' };
      }
      
      if (!result.user) {
        throw new Error('Registration failed');
      }
      
      // If we get here, email verification is disabled and user is signed in
      setUser(result.user);
      setSession(result.session);
      
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
