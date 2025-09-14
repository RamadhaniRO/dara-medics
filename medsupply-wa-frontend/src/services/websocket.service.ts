import { config } from '../config/environment';

// WebSocket interface definitions
export interface Socket {
  connected: boolean;
  disconnect(): void;
  emit(event: string, data: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
}

// Mock WebSocket implementation for development
const createMockSocket = (): Socket => ({
  connected: false,
  disconnect: () => {},
  emit: (event: string, data: any) => {
    console.log(`Mock WebSocket emit: ${event}`, data);
  },
  on: (event: string, callback: (data: any) => void) => {
    console.log(`Mock WebSocket listener: ${event}`);
  },
  off: (event: string, callback?: (data: any) => void) => {
    console.log(`Mock WebSocket remove listener: ${event}`);
  }
});

// WebSocket factory function
const createWebSocket = (url: string, options: any): Socket => {
  if (config.mockApi) {
    return createMockSocket();
  }
  
  // In production, you would use the actual socket.io-client
  // For now, return mock implementation
  console.warn('WebSocket not implemented - using mock implementation');
  return createMockSocket();
};

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
  pharmacyId?: string;
}

export interface WebSocketServiceConfig {
  token: string;
  userId: string;
  pharmacyId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onOrderUpdate?: (event: RealtimeEvent) => void;
  onPaymentUpdate?: (event: RealtimeEvent) => void;
  onInventoryUpdate?: (event: RealtimeEvent) => void;
  onAgentNotification?: (event: RealtimeEvent) => void;
  onCustomerMessage?: (event: RealtimeEvent) => void;
  onSystemNotification?: (event: RealtimeEvent) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketServiceConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: WebSocketServiceConfig) {
    this.config = config;
  }

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = config.apiUrl.replace('http', 'ws');
    
    this.socket = createWebSocket(wsUrl, {
      auth: {
        token: this.config.token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.config.onConnect?.();
      
      // Join pharmacy room if pharmacy ID is provided
      if (this.config.pharmacyId) {
        this.joinPharmacyRoom(this.config.pharmacyId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.config.onDisconnect?.();
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.config.onError?.(error);
      this.attemptReconnect();
    });

    // Authentication events
    this.socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    this.socket.on('unauthorized', (error) => {
      console.error('WebSocket unauthorized:', error);
      this.config.onError?.(new Error('Authentication failed'));
    });

    // Business events
    this.socket.on('order-updated', (event: RealtimeEvent) => {
      console.log('Order update received:', event);
      this.config.onOrderUpdate?.(event);
    });

    this.socket.on('payment-updated', (event: RealtimeEvent) => {
      console.log('Payment update received:', event);
      this.config.onPaymentUpdate?.(event);
    });

    this.socket.on('inventory-updated', (event: RealtimeEvent) => {
      console.log('Inventory update received:', event);
      this.config.onInventoryUpdate?.(event);
    });

    this.socket.on('agent-notification', (event: RealtimeEvent) => {
      console.log('Agent notification received:', event);
      this.config.onAgentNotification?.(event);
    });

    this.socket.on('customer-message', (event: RealtimeEvent) => {
      console.log('Customer message received:', event);
      this.config.onCustomerMessage?.(event);
    });

    this.socket.on('system-notification', (event: RealtimeEvent) => {
      console.log('System notification received:', event);
      this.config.onSystemNotification?.(event);
    });

    // Room events
    this.socket.on('user-joined', (data) => {
      console.log('User joined room:', data);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left room:', data);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public methods for sending events
  public joinPharmacyRoom(pharmacyId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-pharmacy', pharmacyId);
    }
  }

  public leavePharmacyRoom(pharmacyId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-pharmacy', pharmacyId);
    }
  }

  public sendOrderUpdate(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('order-update', data);
    }
  }

  public sendPaymentUpdate(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('payment-update', data);
    }
  }

  public sendInventoryUpdate(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('inventory-update', data);
    }
  }

  public sendAgentNotification(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('agent-notification', data);
    }
  }

  public sendCustomerMessage(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('customer-message', data);
    }
  }

  public sendSystemNotification(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('system-notification', data);
    }
  }

  // Update configuration
  public updateConfig(newConfig: Partial<WebSocketServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reconnect with new configuration if connected
    if (this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }
}

// Singleton instance
let websocketService: WebSocketService | null = null;

export const getWebSocketService = (config?: WebSocketServiceConfig): WebSocketService => {
  if (!websocketService && config) {
    websocketService = new WebSocketService(config);
  }
  return websocketService!;
};

export const initializeWebSocket = (config: WebSocketServiceConfig): WebSocketService => {
  if (websocketService) {
    websocketService.disconnect();
  }
  websocketService = new WebSocketService(config);
  return websocketService;
};

export const disconnectWebSocket = (): void => {
  if (websocketService) {
    websocketService.disconnect();
    websocketService = null;
  }
};
