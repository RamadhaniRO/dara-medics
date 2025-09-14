import { config } from '../config/environment';
import { handleError } from './errorHandler';

// API Configuration
const API_BASE_URL = config.apiUrl;

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  pharmacy?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  pharmacyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface SocialAuthProvider {
  name: string;
  url: string;
  enabled: boolean;
}

export interface SocialAuthProvidersResponse {
  providers: SocialAuthProvider[];
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  // Handle authentication errors
  private handleAuthError = (errorMessage: string) => {
    if (errorMessage.includes('Access token required') || 
        errorMessage.includes('Invalid access token') || 
        errorMessage.includes('Access token expired') ||
        errorMessage.includes('Authentication required') ||
        errorMessage.includes('Please try refreshing the page')) {
      
      console.log('Authentication error detected, clearing token and redirecting to login');
      this.setToken(null);
      
      // Clear localStorage to ensure clean state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return true;
    }
    return false;
  };

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication token
  getToken(): string | null {
    // First check instance variable, then localStorage
    if (this.token) {
      return this.token;
    }
    
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this.token = storedToken;
      return storedToken;
    }
    
    return null;
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    console.log(`Making API request to: ${url}`);
    console.log('Request options:', options);
    console.log('Request body (raw):', options.body);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        data = { error: 'Invalid response format' };
      }

      if (!response.ok) {
        const error = {
          status: response.status,
          message: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
        
        console.error('API request failed:', error);
        
        // Handle authentication errors
        if (response.status === 401) {
          this.setToken(null);
          // Check if it's an auth error and handle it
          if (this.handleAuthError(error.message)) {
            return { error: 'Authentication required - redirecting to login' };
          }
        }
        
        // Also check for auth errors in other status codes
        if (this.handleAuthError(error.message)) {
          return { error: 'Authentication required - redirecting to login' };
        }
        
        return {
          error: error.message,
        };
      }

      return { data };
    } catch (error) {
      console.error('Network or request error:', error);
      const appError = handleError(error, { showToast: false, logError: true });
      
      // Check if it's an authentication error
      if (this.handleAuthError(appError.message)) {
        return { error: 'Authentication required - redirecting to login' };
      }
      
      return {
        error: appError.message,
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    console.log('API Client - register method called with:', userData);
    console.log('API Client - JSON stringified body:', JSON.stringify(userData));
    return this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async validateToken(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/validate');
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Social Authentication endpoints
  async getSocialAuthProviders(): Promise<ApiResponse<SocialAuthProvidersResponse>> {
    return this.request<SocialAuthProvidersResponse>('/api/auth/providers');
  }

  async initiateSocialLogin(provider: 'google' | 'microsoft' | 'apple'): Promise<void> {
    // Redirect to the OAuth provider
    const response = await this.request<SocialAuthProvidersResponse>('/api/auth/providers');
    
    if (response.data?.providers) {
      const providerData = response.data.providers.find(p => p.name === provider);
      if (providerData?.url) {
        window.location.href = providerData.url;
      } else {
        throw new Error(`${provider} authentication is not available`);
      }
    } else {
      throw new Error('Failed to get authentication providers');
    }
  }

  async handleSocialCallback(token: string, provider: string): Promise<ApiResponse<LoginResponse>> {
    // This method handles the callback after social authentication
    // The token is already set by the backend redirect
    if (token) {
      this.setToken(token);
      
      // Validate the token to get user info
      const userResponse = await this.validateToken();
      if (userResponse.data) {
        return {
          data: {
            token,
            user: userResponse.data
          }
        };
      }
    }
    
    return {
      error: 'Social authentication failed'
    };
  }

  // Admin endpoints
  async getDashboard(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/dashboard');
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/health');
  }

  async getUsers(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users?page=${page}&limit=${limit}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getSystemConfig(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/config');
  }

  async updateSystemConfig(config: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }


  async getAgentPerformance(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/agents/performance');
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/analytics');
  }

  // Order endpoints
  async getOrders(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/orders/${id}`);
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  async getPayments(page: number = 1, limit: number = 20, status?: string, method?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (method) params.append('method', method);
    
    return this.request(`/api/v1/admin/payments?${params.toString()}`);
  }

  async getPayment(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/payments/${id}`);
  }

  async createPayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id: string, paymentData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  // WhatsApp endpoints
  async getWhatsAppConversations(page: number = 1, limit: number = 20, status?: string, agentId?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (agentId) params.append('agentId', agentId);
    
    return this.request(`/api/v1/admin/whatsapp/conversations?${params.toString()}`);
  }

  async getWhatsAppMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.request(`/api/v1/admin/whatsapp/conversations/${conversationId}/messages?${params.toString()}`);
  }

  // Settings endpoints
  async getSettings(userId?: string): Promise<ApiResponse<any>> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/api/v1/admin/settings${params}`);
  }

  async updateSettings(userId: string, settingsType: string, data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ userId, settingsType, data }),
    });
  }

  // Profile endpoints
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/profile/${userId}`);
  }

  async updateUserProfile(userId: string, profileData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/admin/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Compliance endpoints
  async getCompliance(page: number = 1, limit: number = 20, category?: string, status?: string, priority?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    return this.request(`/api/v1/admin/compliance?${params.toString()}`);
  }

  // Catalog endpoints
  async getCatalog(page: number = 1, limit: number = 20, category?: string, status?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    return this.request(`/api/v1/admin/catalog?${params.toString()}`);
  }

  // Agents endpoints
  async getAgents(page: number = 1, limit: number = 20, status?: string, role?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    
    return this.request(`/api/v1/admin/agents?${params.toString()}`);
  }

  // Audit endpoints
  async getAuditLogs(page: number = 1, limit: number = 20, category?: string, status?: string, dateRange?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (dateRange) params.append('dateRange', dateRange);
    
    return this.request(`/api/v1/admin/audit?${params.toString()}`);
  }

  // Support endpoints
  async getSupportTickets(page: number = 1, limit: number = 20, status?: string, priority?: string, category?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);
    
    return this.request(`/api/v1/admin/support?${params.toString()}`);
  }

  // Help endpoints
  async getHelpArticles(page: number = 1, limit: number = 20, category?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (category) params.append('category', category);
    
    return this.request(`/api/v1/admin/help?${params.toString()}`);
  }

  // Health check
  async getHealth(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  // Email verification methods
  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Logout (clear token)
  logout() {
    this.setToken(null);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Types are already exported above, no need to re-export
