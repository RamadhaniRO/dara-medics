import { SupabaseService } from '../supabase/supabase.service';
import { LoggerService } from '../logger/logger.service';
import { 
  Product, 
  Order, 
  OrderItem, 
  Payment, 
  Conversation, 
  Message, 
  AgentLog, 
  SystemMetrics 
} from './entities';

export class DatabaseService {
  private supabaseService: SupabaseService;
  private logger: LoggerService;
  private isInitialized: boolean = false;

  constructor() {
    this.logger = new LoggerService();
    
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      this.supabaseService = new SupabaseService({
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        serviceKey: supabaseServiceKey
      }, this.logger);
    } else {
      this.logger.warn('Supabase environment variables not found, running in mock mode');
      this.supabaseService = new SupabaseService(null, this.logger);
    }
  }

  public async initialize(): Promise<void> {
    try {
      await this.supabaseService.initialize();
      this.isInitialized = true;
      this.logger.info('Database service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  // Getter for supabase client
  public get supabase() {
    return this.supabaseService.getClient();
  }

  public getClient() {
    return this.supabaseService.getClient();
  }

  public getAdminClient() {
    return this.supabaseService.getAdminClient();
  }

  // Product operations
  public async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('products')
      .insert([{ ...product, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating product:', error);
      throw error;
    }

    return data;
  }

  public async getProductById(id: string): Promise<Product | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting product by ID:', error);
      throw error;
    }

    return data;
  }

  public async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, sku.ilike.%${query}%, barcode.ilike.%${query}%`)
      .eq('active', true)
      .limit(limit);

    if (error) {
      this.logger.error('Error searching products:', error);
      throw error;
    }

    return data || [];
  }

  // Order operations
  public async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('orders')
      .insert([{ ...order, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }

    return data;
  }

  public async getOrderById(id: string): Promise<Order | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting order by ID:', error);
      throw error;
    }

    return data;
  }

  public async updateOrderStatus(id: string, status: string): Promise<Order> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating order status:', error);
      throw error;
    }

    return data;
  }

  // Order Item operations
  public async createOrderItem(item: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>): Promise<OrderItem> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('order_items')
      .insert([{ ...item, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating order item:', error);
      throw error;
    }

    return data;
  }

  public async getOrderItems(orderId: string): Promise<OrderItem[]> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      this.logger.error('Error getting order items:', error);
      throw error;
    }

    return data || [];
  }

  // Payment operations
  public async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('payments')
      .insert([{ ...payment, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating payment:', error);
      throw error;
    }

    return data;
  }

  public async getPaymentById(id: string): Promise<Payment | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting payment by ID:', error);
      throw error;
    }

    return data;
  }

  public async getPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting payment by transaction ID:', error);
      throw error;
    }

    return data;
  }

  public async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating payment:', error);
      throw error;
    }

    return data;
  }

  // Conversation operations
  public async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('conversations')
      .insert([{ ...conversation, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating conversation:', error);
      throw error;
    }

    return data;
  }

  public async getConversationById(id: string): Promise<Conversation | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting conversation by ID:', error);
      throw error;
    }

    return data;
  }

  public async getConversationByPhone(phoneNumber: string): Promise<Conversation | null> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error('Error getting conversation by phone:', error);
      throw error;
    }

    return data;
  }

  public async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating conversation:', error);
      throw error;
    }

    return data;
  }

  // Message operations
  public async createMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('messages')
      .insert([{ ...message, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating message:', error);
      throw error;
    }

    return data;
  }

  public async getMessagesByConversation(conversationId: string, limit: number = 50): Promise<Message[]> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error('Error getting messages by conversation:', error);
      throw error;
    }

    return data || [];
  }

  // Agent Log operations
  public async createAgentLog(log: Omit<AgentLog, 'id' | 'created_at'>): Promise<AgentLog> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('agent_logs')
      .insert([{ ...log, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating agent log:', error);
      throw error;
    }

    return data;
  }

  // System Metrics operations
  public async createSystemMetric(metric: Omit<SystemMetrics, 'id' | 'created_at'>): Promise<SystemMetrics> {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }

    const client = this.getClient();
    if (!client) {
      throw new Error('Database client not available');
    }

    const { data, error } = await client
      .from('system_metrics')
      .insert([{ ...metric, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating system metric:', error);
      throw error;
    }

    return data;
  }

  public async close(): Promise<void> {
    // Supabase client doesn't need explicit closing, but we can add cleanup logic here if needed
    this.isInitialized = false;
    this.logger.info('Database service closed');
  }
}
