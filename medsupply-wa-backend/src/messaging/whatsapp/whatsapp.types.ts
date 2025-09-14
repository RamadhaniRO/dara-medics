// WhatsApp Business API Types

export interface WhatsAppWebhook {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    filename: string;
    mime_type: string;
    sha256: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256: string;
    voice: boolean;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: WhatsAppContact[];
  context?: {
    from: {
      name: string;
      phone: string;
    };
    id: string;
    forwarded: boolean;
    frequently_forwarded: boolean;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export type WhatsAppMessageType = 
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contact'
  | 'sticker'
  | 'button'
  | 'interactive'
  | 'order'
  | 'reaction'
  | 'system'
  | 'unknown';

export interface WhatsAppStatus {
  id: string;
  status: WhatsAppStatusType;
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WhatsAppError[];
}

export type WhatsAppStatusType = 
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface WhatsAppError {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

export interface WhatsAppTemplate {
  name: string;
  language: {
    code: string;
  };
  components?: WhatsAppComponent[];
}

export interface WhatsAppComponent {
  type: 'header' | 'body' | 'button' | 'footer';
  parameters?: WhatsAppParameter[];
  sub_type?: string;
  index?: number;
}

export interface WhatsAppParameter {
  type: 'text' | 'image' | 'document' | 'video' | 'audio' | 'date_time' | 'currency' | 'address';
  text?: string;
  image?: {
    link: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
  video?: {
    link: string;
  };
  audio?: {
    link: string;
  };
  date_time?: {
    fallback_value: string;
  };
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  address?: {
    fallback_value: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    type?: string;
    zip?: string;
  };
}

export interface WhatsAppInteractive {
  type: 'button' | 'list' | 'product' | 'product_list';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: {
      link: string;
    };
    video?: {
      link: string;
    };
    document?: {
      link: string;
      filename?: string;
    };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: WhatsAppAction;
}

export interface WhatsAppAction {
  buttons?: WhatsAppButton[];
  sections?: WhatsAppSection[];
  button?: string;
  product_retailer_id?: string;
  catalog_id?: string;
}

export interface WhatsAppButton {
  type: 'reply' | 'url' | 'phone_number';
  reply?: {
    id: string;
    title: string;
  };
  url?: {
    url: string;
  };
  phone_number?: {
    phone_number: string;
  };
}

export interface WhatsAppSection {
  title: string;
  rows: WhatsAppRow[];
}

export interface WhatsAppRow {
  id: string;
  title: string;
  description?: string;
}

// Request/Response interfaces for API calls
export interface SendMessageRequest {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: WhatsAppMessageType;
  text?: {
    body: string;
    preview_url?: boolean;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    caption?: string;
    filename?: string;
  };
  audio?: {
    link: string;
  };
  video?: {
    link: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  template?: WhatsAppTemplate;
  interactive?: WhatsAppInteractive;
}

export interface SendMessageResponse {
  messaging_product: string;
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

export interface MarkMessageReadRequest {
  messaging_product: string;
  status: 'read';
  message_id: string;
}

export interface GetMessageResponse {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: {
    body: string;
  };
  status: WhatsAppStatusType;
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

// Utility types for internal use
export interface ProcessedMessage {
  id: string;
  from: string;
  to: string;
  timestamp: Date;
  type: WhatsAppMessageType;
  content: string;
  metadata: any;
  requiresProcessing: boolean;
  processingPriority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface MessageProcessingResult {
  success: boolean;
  response?: string;
  actions?: string[];
  requiresHumanReview: boolean;
  escalationReason?: string;
  metadata?: any;
}

export interface ConversationContext {
  pharmacyId?: string;
  customerId?: string;
  currentOrderId?: string;
  lastIntent?: string;
  confidence?: number;
  sessionData?: any;
  requiresPrescription?: boolean;
  prescriptionVerified?: boolean;
}
