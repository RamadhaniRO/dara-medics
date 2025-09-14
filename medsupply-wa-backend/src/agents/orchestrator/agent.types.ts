// Agent Orchestrator Types

export interface ConversationContext {
  pharmacyId?: string;
  customerId?: string;
  currentOrderId?: string;
  lastIntent?: string;
  confidence?: number;
  sessionData?: any;
  requiresPrescription?: boolean;
  prescriptionVerified?: boolean;
  cartItems?: CartItem[];
  paymentMethod?: string;
  deliveryAddress?: DeliveryAddress;
  lastActivity?: Date;
  agentNotes?: string;
  escalationHistory?: EscalationRecord[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  requiresPrescription: boolean;
  prescriptionId?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

export interface EscalationRecord {
  timestamp: Date;
  reason: string;
  agentId?: string;
  resolved: boolean;
  notes?: string;
}

export interface MessageProcessingResult {
  success: boolean;
  response?: string;
  actions?: AgentAction[];
  requiresHumanReview: boolean;
  escalationReason?: string;
  metadata?: any;
  agentName?: string;
  confidence?: number;
  nextSteps?: string[];
  suggestedResponses?: string[];
}

export interface AgentAction {
  type: 'send_message' | 'create_order' | 'update_inventory' | 'send_payment_link' | 'escalate_to_human' | 'update_context' | 'log_event';
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delay?: number; // milliseconds
  retryCount?: number;
  maxRetries?: number;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  alternatives?: IntentAlternative[];
  context?: any;
  metadata?: any;
}

export interface IntentAlternative {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export interface ConversationState {
  status: 'active' | 'paused' | 'escalated' | 'closed' | 'not_found' | 'error';
  context?: ConversationContext;
  lastMessageAt?: Date;
  messageCount?: number;
  requiresHumanReview?: boolean;
  currentAgent?: string;
  estimatedResponseTime?: number;
}

export interface AgentCapability {
  name: string;
  version: string;
  intents: string[];
  entities: string[];
  maxResponseTime: number;
  supportsAsync: boolean;
  fallbackStrategy: 'escalate' | 'retry' | 'ignore';
}

export interface AgentHealth {
  isHealthy: boolean;
  lastHeartbeat: Date;
  responseTime: number;
  errorCount: number;
  lastError?: string;
  uptime: number;
}

export interface ProcessingMetrics {
  startTime: Date;
  endTime?: Date;
  processingTime?: number;
  agentUsed: string;
  intentDetected: string;
  confidence: number;
  entitiesExtracted: number;
  actionsPerformed: number;
  humanEscalation: boolean;
  errorOccurred: boolean;
  errorMessage?: string;
}

export interface ConversationFlow {
  id: string;
  name: string;
  steps: FlowStep[];
  currentStep: number;
  context: ConversationContext;
  metadata?: any;
}

export interface FlowStep {
  id: string;
  name: string;
  type: 'intent_detection' | 'entity_extraction' | 'agent_processing' | 'user_input' | 'decision' | 'action';
  agent?: string;
  required: boolean;
  timeout?: number;
  fallback?: string;
  metadata?: any;
}

export interface AgentResponse {
  success: boolean;
  content: string;
  type: 'text' | 'quick_reply' | 'template' | 'interactive' | 'media';
  actions?: AgentAction[];
  context?: ConversationContext;
  metadata?: any;
  confidence?: number;
  alternatives?: string[];
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  confidence: number;
  metadata?: any;
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
  metadata?: any;
}

export interface ProductQuery {
  query: string;
  filters?: ProductFilters;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  requiresPrescription?: boolean;
  dosageForm?: string;
  strength?: string;
}

export interface OrderRequest {
  type: 'new' | 'modify' | 'cancel' | 'status';
  items: OrderItem[];
  customerInfo: CustomerInfo;
  deliveryInfo?: DeliveryInfo;
  paymentInfo?: PaymentInfo;
  specialInstructions?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  requiresPrescription: boolean;
  prescriptionId?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  pharmacyId?: string;
}

export interface DeliveryInfo {
  method: 'delivery' | 'pickup' | 'courier';
  address?: DeliveryAddress;
  preferredTime?: string;
  urgent?: boolean;
}

export interface PaymentInfo {
  method: 'mpesa' | 'airtel' | 'tigo' | 'card' | 'cash';
  amount: number;
  currency: string;
  reference?: string;
}

export interface ComplianceCheck {
  type: 'prescription' | 'regulatory' | 'age_verification' | 'quantity_limit';
  data: any;
  required: boolean;
  autoApprove: boolean;
  humanReviewThreshold: number;
}

export interface ComplianceResult {
  approved: boolean;
  requiresHumanReview: boolean;
  reason?: string;
  restrictions?: string[];
  metadata?: any;
}

export interface FulfillmentRequest {
  type: 'tracking' | 'delivery_update' | 'pickup_arrangement' | 'delivery_scheduling';
  orderId?: string;
  trackingNumber?: string;
  customerPhone: string;
  metadata?: any;
}

export interface FulfillmentResponse {
  success: boolean;
  information: any;
  estimatedDelivery?: Date;
  currentStatus?: string;
  nextSteps?: string[];
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  availableHours?: string;
}

export interface AgentError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  agentName: string;
  conversationId?: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  humanEscalations: number;
  lastUpdated: Date;
  performanceByIntent: Record<string, IntentMetrics>;
}

export interface IntentMetrics {
  count: number;
  successRate: number;
  averageResponseTime: number;
  humanEscalationRate: number;
  lastProcessed: Date;
}

export interface AgentConfiguration {
  name: string;
  version: string;
  enabled: boolean;
  maxConcurrentRequests: number;
  timeout: number;
  retryAttempts: number;
  fallbackAgent?: string;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeMetadata: boolean;
    includeContext: boolean;
  };
  performance: {
    maxResponseTime: number;
    maxMemoryUsage: number;
    enableMetrics: boolean;
  };
}
