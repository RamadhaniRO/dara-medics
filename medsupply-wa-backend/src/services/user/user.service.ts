import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';
import { User } from '../../core/database/entities';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'pharmacy' | 'customer';
  pharmacy_id?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export class UserService {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      console.log('👤 Creating user:', userData.email);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user in database
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          password_hash: hashedPassword,
          role: userData.role,
          pharmacy_id: userData.pharmacy_id,
          phone: userData.phone || '',
          is_verified: false,
          two_factor_enabled: false,
          login_attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.log('❌ User creation error:', error);
        this.logger.error('Error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      console.log('✅ User created:', data.id);
      return this.mapDbUserToUser(data);
    } catch (error) {
      console.log('❌ User creation failed:', error);
      this.logger.error('Error in createUser:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid hanging

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        this.logger.error('Error fetching user by email:', error);
        throw new Error('Failed to fetch user');
      }

      return this.mapDbUserToUser(data);
    } catch (error) {
      this.logger.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid hanging

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        this.logger.error('Error fetching user by ID:', error);
        throw new Error('Failed to fetch user');
      }

      return this.mapDbUserToUser(data);
    } catch (error) {
      this.logger.error('Error in getUserById:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Get user by email
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Get password hash from database
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();

      if (error) {
        this.logger.error('Error fetching password hash:', error);
        throw new Error('Authentication failed');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, data.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      this.logger.info(`User logged in successfully: ${user.email}`);
      return { user, token };
    } catch (error) {
      this.logger.error('Error in login:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating user:', error);
        throw new Error('Failed to update user');
      }

      this.logger.info(`User updated successfully: ${data.email}`);
      return this.mapDbUserToUser(data);
    } catch (error) {
      this.logger.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
      }

      this.logger.info(`User deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async verifyUser(id: string): Promise<User> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error verifying user:', error);
        throw new Error('Failed to verify user');
      }

      this.logger.info(`User verified successfully: ${data.email}`);
      return this.mapDbUserToUser(data);
    } catch (error) {
      this.logger.error('Error in verifyUser:', error);
      throw error;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current password hash
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching current password:', error);
        throw new Error('Failed to change password');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, data.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        this.logger.error('Error updating password:', updateError);
        throw new Error('Failed to change password');
      }

      this.logger.info(`Password changed successfully for user: ${id}`);
    } catch (error) {
      this.logger.error('Error in changePassword:', error);
      throw error;
    }
  }

  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }

      const users = data.map(user => this.mapDbUserToUser(user));
      return { users, total: count || 0 };
    } catch (error) {
      this.logger.error('Error in getUsers:', error);
      throw error;
    }
  }

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      password_hash: dbUser.password_hash || '',
      name: dbUser.name,
      role: dbUser.role,
      pharmacy_id: dbUser.pharmacy_id,
      phone: dbUser.phone,
      is_verified: dbUser.is_verified || false,
      two_factor_enabled: dbUser.two_factor_enabled || false,
      two_factor_secret: dbUser.two_factor_secret,
      last_login: dbUser.last_login,
      login_attempts: dbUser.login_attempts || 0,
      locked_until: dbUser.locked_until,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    };
  }
}
