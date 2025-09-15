import { supabase } from './supabase';
import { Session, AuthError } from '@supabase/supabase-js';
import { enableEmailVerification, enableSocialLogin } from '../config/environment';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  pharmacy_name?: string;
  role: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  pharmacy_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: Session | null;
  error: AuthError | null;
}

export class SupabaseAuthService {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No user from Supabase auth:', error);
        return null;
      }

      console.log('Supabase user found:', user.email);

      // Try to get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('Profile not found, using auth user data:', profileError.message);
        // If profile doesn't exist, return user data from auth
        return {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 'User',
          pharmacy_name: user.user_metadata?.pharmacy_name || 'Pharmacy',
          role: 'pharmacy_owner',
          created_at: user.created_at
        };
      }

      if (!profile) {
        console.log('Profile is null, using auth user data');
        return {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 'User',
          pharmacy_name: user.user_metadata?.pharmacy_name || 'Pharmacy',
          role: 'pharmacy_owner',
          created_at: user.created_at
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        pharmacy_name: profile.pharmacy_name,
        role: profile.role,
        created_at: profile.created_at
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Sign up with email and password
  async signUp(data: RegisterData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            pharmacy_name: data.pharmacy_name
          },
          emailRedirectTo: enableEmailVerification ? `${window.location.origin}/auth/verify` : undefined
        }
      });

      if (authError) {
        return {
          user: null,
          session: null,
          error: authError
        };
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            pharmacy_name: data.pharmacy_name,
            role: 'pharmacy_owner'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: data.full_name,
          pharmacy_name: data.pharmacy_name,
          role: 'pharmacy_owner',
          created_at: authData.user.created_at
        } : null,
        session: authData.session,
        error: null
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  // Sign in with email and password
  async signIn(data: LoginData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        return {
          user: null,
          session: null,
          error: authError
        };
      }

      // Get user profile
      const user = await this.getCurrentUser();

      return {
        user,
        session: authData.session,
        error: null
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          pharmacy_name: updates.pharmacy_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.id!);

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Social login
  async signInWithProvider(provider: 'google' | 'microsoft' | 'apple'): Promise<{ error: AuthError | null }> {
    try {
      if (!enableSocialLogin) {
        return { error: { message: 'Social login is disabled' } as AuthError };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { error };
    } catch (error) {
      console.error('Social login error:', error);
      return { error: error as AuthError };
    }
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();
