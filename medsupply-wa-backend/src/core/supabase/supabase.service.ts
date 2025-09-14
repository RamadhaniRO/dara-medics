import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoggerService } from '../logger/logger.service';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export class SupabaseService {
  private client: SupabaseClient | null = null;
  private logger: LoggerService;

  constructor(config: SupabaseConfig | null, logger: LoggerService) {
    this.logger = logger;
    
    if (config && config.url && config.anonKey) {
      this.client = createClient(config.url, config.anonKey);
    } else {
      this.logger.warn('Supabase configuration not provided, running in mock mode');
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Supabase client not available, skipping connection test');
      return true; // Return true for mock mode
    }

    try {
      const { data: _data, error } = await this.client.from('health_check').select('*').limit(1);
      if (error) {
        this.logger.error('Supabase connection test failed', { error });
        return false;
      }
      this.logger.info('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test error', { error });
      return false;
    }
  }

  public async initialize(): Promise<void> {
    try {
      await this.testConnection();
      this.logger.info('Supabase service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase service:', error);
      throw error;
    }
  }

  public getAdminClient(): any {
    return this.client;
  }
}
