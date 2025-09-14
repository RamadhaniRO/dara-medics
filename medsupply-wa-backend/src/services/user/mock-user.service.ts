import { LoggerService } from '../../core/logger/logger.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pharmacy' | 'customer';
  pharmacy_id?: string;
  phone?: string;
  is_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

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

export class MockUserService {
  private users: Map<string, User & { password_hash: string }> = new Map();
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
    this.initializeMockUsers();
  }

  private initializeMockUsers(): void {
    // Create a default admin user for testing
    const adminUser: User & { password_hash: string } = {
      id: 'admin-001',
      email: 'admin@dara-medics.com',
      name: 'Admin User',
      role: 'admin',
      phone: '+1234567890',
      is_verified: true,
      two_factor_enabled: false,
      login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password: password
    };

    this.users.set(adminUser.email, adminUser);
    this.logger.info('Mock user service initialized with admin user');
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Check if user already exists
      if (this.users.has(userData.email)) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const newUser: User & { password_hash: string } = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        pharmacy_id: userData.pharmacy_id,
        phone: userData.phone,
        is_verified: false,
        two_factor_enabled: false,
        login_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password_hash: hashedPassword
      };

      this.users.set(newUser.email, newUser);
      this.logger.info(`Mock user created: ${newUser.email}`);

      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Error in createUser:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = this.users.get(email);
      if (!user) {
        return null;
      }

      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      for (const user of this.users.values()) {
        if (user.id === id) {
          const { password_hash, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Error in getUserById:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Get user by email
      const user = this.users.get(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
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

      this.logger.info(`Mock user logged in: ${user.email}`);

      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      this.logger.error('Error in login:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      for (const [email, user] of this.users.entries()) {
        if (user.id === id) {
          const updatedUser = {
            ...user,
            ...updateData,
            updated_at: new Date().toISOString()
          };
          this.users.set(email, updatedUser);
          
          const { password_hash, ...userWithoutPassword } = updatedUser;
          return userWithoutPassword;
        }
      }
      throw new Error('User not found');
    } catch (error) {
      this.logger.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      for (const [email, user] of this.users.entries()) {
        if (user.id === id) {
          this.users.delete(email);
          this.logger.info(`Mock user deleted: ${email}`);
          return;
        }
      }
      throw new Error('User not found');
    } catch (error) {
      this.logger.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async verifyUser(id: string): Promise<User> {
    try {
      for (const [email, user] of this.users.entries()) {
        if (user.id === id) {
          const updatedUser = {
            ...user,
            is_verified: true,
            updated_at: new Date().toISOString()
          };
          this.users.set(email, updatedUser);
          
          const { password_hash, ...userWithoutPassword } = updatedUser;
          return userWithoutPassword;
        }
      }
      throw new Error('User not found');
    } catch (error) {
      this.logger.error('Error in verifyUser:', error);
      throw error;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      for (const [email, user] of this.users.entries()) {
        if (user.id === id) {
          // Verify current password
          const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
          if (!isValidPassword) {
            throw new Error('Current password is incorrect');
          }

          // Hash new password
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);

          // Update password
          const updatedUser = {
            ...user,
            password_hash: hashedNewPassword,
            updated_at: new Date().toISOString()
          };
          this.users.set(email, updatedUser);
          
          this.logger.info(`Password changed for user: ${email}`);
          return;
        }
      }
      throw new Error('User not found');
    } catch (error) {
      this.logger.error('Error in changePassword:', error);
      throw error;
    }
  }

  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    try {
      const allUsers = Array.from(this.users.values());
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      const usersWithoutPasswords = paginatedUsers.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return { users: usersWithoutPasswords, total: allUsers.length };
    } catch (error) {
      this.logger.error('Error in getUsers:', error);
      throw error;
    }
  }
}
