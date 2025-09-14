// Database entities for Supabase integration

export interface User {
  id: string;
  email: string;
  password_hash: string;
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

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sku: string;
  barcode?: string;
  unit_price: number;
  wholesale_price: number;
  retail_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  requires_prescription: boolean;
  prescription_type?: string;
  manufacturer: string;
  expiry_date?: string;
  batch_number?: string;
  storage_conditions?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  business_hours?: any;
  delivery_radius: number;
  delivery_fee: number;
  min_order_amount: number;
  active: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Customer {
  id: string;
  pharmacy_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  customer_type: 'wholesale' | 'retail';
  credit_limit?: number;
  payment_terms?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Order {
  id: string;
  order_number: string;
  pharmacy_id: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  order_type: 'wholesale' | 'retail' | 'prescription';
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  delivery_method: 'pickup' | 'delivery' | 'shipping';
  delivery_address?: string;
  delivery_instructions?: string;
  special_instructions?: string;
  confirmed_delivery_date?: string;
  pickup_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  requires_prescription: boolean;
  prescription_verified: boolean;
  prescription_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'cash' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transaction_id?: string;
  phone_number: string;
  customer_name: string;
  customer_email?: string;
  description?: string;
  confirmed_at?: string;
  refunded_at?: string;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  customer_id: string;
  pharmacy_id: string;
  phone_number: string;
  status: 'active' | 'closed' | 'escalated';
  context: any;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Message {
  id: string;
  conversation_id: string;
  message_id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'sticker' | 'button' | 'interactive';
  content: string;
  media_url?: string;
  metadata?: any;
  processed: boolean;
  agent_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  order_id?: string;
  customer_id: string;
  pharmacy_id: string;
  prescription_number: string;
  doctor_name: string;
  doctor_license: string;
  patient_name: string;
  patient_id?: string;
  prescription_date: string;
  expiry_date?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface AgentLog {
  id: string;
  conversation_id: string;
  message_id: string;
  agent_type: 'intent_extractor' | 'catalog_agent' | 'order_agent' | 'compliance_agent' | 'fulfillment_agent';
  action: string;
  input: any;
  output: any;
  processing_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface SystemMetrics {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  tags?: any;
  timestamp: string;
  created_at: string;
}
