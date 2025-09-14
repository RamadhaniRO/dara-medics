import { Server, Socket } from 'socket.io';
import { LoggerService } from '../../core/logger/logger.service';
import jwt from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  pharmacyId?: string;
}

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
  pharmacyId?: string;
}

export class RealtimeService {
  private io: Server;
  private logger: LoggerService;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private pharmacyRooms: Map<string, Set<string>> = new Map();

  constructor(io: Server, logger: LoggerService) {
    this.io = io;
    this.logger = logger;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        // Get pharmacy ID from user data if needed
        // This would typically come from the database
        socket.pharmacyId = decoded.pharmacyId;
        
        next();
      } catch (error) {
        this.logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.logger.info(`User connected: ${socket.userId} (${socket.id})`);
      
      // Store connected user
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
      }

      // Join pharmacy room if user has pharmacy ID
      if (socket.pharmacyId) {
        this.joinPharmacyRoom(socket, socket.pharmacyId);
      }

      // Handle joining pharmacy room
      socket.on('join-pharmacy', (pharmacyId: string) => {
        this.joinPharmacyRoom(socket, pharmacyId);
      });

      // Handle leaving pharmacy room
      socket.on('leave-pharmacy', (pharmacyId: string) => {
        this.leavePharmacyRoom(socket, pharmacyId);
      });

      // Handle order updates
      socket.on('order-update', (data: any) => {
        this.handleOrderUpdate(socket, data);
      });

      // Handle payment updates
      socket.on('payment-update', (data: any) => {
        this.handlePaymentUpdate(socket, data);
      });

      // Handle inventory updates
      socket.on('inventory-update', (data: any) => {
        this.handleInventoryUpdate(socket, data);
      });

      // Handle agent notifications
      socket.on('agent-notification', (data: any) => {
        this.handleAgentNotification(socket, data);
      });

      // Handle customer messages
      socket.on('customer-message', (data: any) => {
        this.handleCustomerMessage(socket, data);
      });

      // Handle system notifications
      socket.on('system-notification', (data: any) => {
        this.handleSystemNotification(socket, data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to MedSupply-WA real-time service',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
  }

  private joinPharmacyRoom(socket: AuthenticatedSocket, pharmacyId: string): void {
    const roomName = `pharmacy-${pharmacyId}`;
    socket.join(roomName);
    
    // Track pharmacy room membership
    if (!this.pharmacyRooms.has(pharmacyId)) {
      this.pharmacyRooms.set(pharmacyId, new Set());
    }
    this.pharmacyRooms.get(pharmacyId)!.add(socket.id);
    
    this.logger.info(`User ${socket.userId} joined pharmacy room: ${pharmacyId}`);
    
    // Notify other users in the pharmacy
    socket.to(roomName).emit('user-joined', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  }

  private leavePharmacyRoom(socket: AuthenticatedSocket, pharmacyId: string): void {
    const roomName = `pharmacy-${pharmacyId}`;
    socket.leave(roomName);
    
    // Remove from pharmacy room tracking
    const roomMembers = this.pharmacyRooms.get(pharmacyId);
    if (roomMembers) {
      roomMembers.delete(socket.id);
      if (roomMembers.size === 0) {
        this.pharmacyRooms.delete(pharmacyId);
      }
    }
    
    this.logger.info(`User ${socket.userId} left pharmacy room: ${pharmacyId}`);
    
    // Notify other users in the pharmacy
    socket.to(roomName).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  }

  private handleOrderUpdate(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'order-update',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to pharmacy room
    if (socket.pharmacyId) {
      this.io.to(`pharmacy-${socket.pharmacyId}`).emit('order-updated', event);
    }

    // Broadcast to admin users
    this.io.to('admin-room').emit('order-updated', event);
    
    this.logger.info(`Order update broadcasted: ${JSON.stringify(event)}`);
  }

  private handlePaymentUpdate(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'payment-update',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to pharmacy room
    if (socket.pharmacyId) {
      this.io.to(`pharmacy-${socket.pharmacyId}`).emit('payment-updated', event);
    }

    // Broadcast to admin users
    this.io.to('admin-room').emit('payment-updated', event);
    
    this.logger.info(`Payment update broadcasted: ${JSON.stringify(event)}`);
  }

  private handleInventoryUpdate(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'inventory-update',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to pharmacy room
    if (socket.pharmacyId) {
      this.io.to(`pharmacy-${socket.pharmacyId}`).emit('inventory-updated', event);
    }

    // Broadcast to admin users
    this.io.to('admin-room').emit('inventory-updated', event);
    
    this.logger.info(`Inventory update broadcasted: ${JSON.stringify(event)}`);
  }

  private handleAgentNotification(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'agent-notification',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to pharmacy room
    if (socket.pharmacyId) {
      this.io.to(`pharmacy-${socket.pharmacyId}`).emit('agent-notification', event);
    }

    // Broadcast to admin users
    this.io.to('admin-room').emit('agent-notification', event);
    
    this.logger.info(`Agent notification broadcasted: ${JSON.stringify(event)}`);
  }

  private handleCustomerMessage(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'customer-message',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to pharmacy room
    if (socket.pharmacyId) {
      this.io.to(`pharmacy-${socket.pharmacyId}`).emit('customer-message', event);
    }

    // Broadcast to admin users
    this.io.to('admin-room').emit('customer-message', event);
    
    this.logger.info(`Customer message broadcasted: ${JSON.stringify(event)}`);
  }

  private handleSystemNotification(socket: AuthenticatedSocket, data: any): void {
    const event: RealtimeEvent = {
      type: 'system-notification',
      data,
      timestamp: new Date().toISOString(),
      userId: socket.userId,
      pharmacyId: socket.pharmacyId
    };

    // Broadcast to all connected users
    this.io.emit('system-notification', event);
    
    this.logger.info(`System notification broadcasted: ${JSON.stringify(event)}`);
  }

  private handleDisconnect(socket: AuthenticatedSocket): void {
    this.logger.info(`User disconnected: ${socket.userId} (${socket.id})`);
    
    // Remove from connected users
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
    }

    // Remove from all pharmacy rooms
    if (socket.pharmacyId) {
      this.leavePharmacyRoom(socket, socket.pharmacyId);
    }
  }

  // Public methods for broadcasting events
  public broadcastOrderUpdate(orderData: any, pharmacyId?: string): void {
    const event: RealtimeEvent = {
      type: 'order-update',
      data: orderData,
      timestamp: new Date().toISOString()
    };

    if (pharmacyId) {
      this.io.to(`pharmacy-${pharmacyId}`).emit('order-updated', event);
    } else {
      this.io.emit('order-updated', event);
    }
  }

  public broadcastPaymentUpdate(paymentData: any, pharmacyId?: string): void {
    const event: RealtimeEvent = {
      type: 'payment-update',
      data: paymentData,
      timestamp: new Date().toISOString()
    };

    if (pharmacyId) {
      this.io.to(`pharmacy-${pharmacyId}`).emit('payment-updated', event);
    } else {
      this.io.emit('payment-updated', event);
    }
  }

  public broadcastInventoryUpdate(inventoryData: any, pharmacyId?: string): void {
    const event: RealtimeEvent = {
      type: 'inventory-update',
      data: inventoryData,
      timestamp: new Date().toISOString()
    };

    if (pharmacyId) {
      this.io.to(`pharmacy-${pharmacyId}`).emit('inventory-updated', event);
    } else {
      this.io.emit('inventory-updated', event);
    }
  }

  public broadcastAgentNotification(notificationData: any, pharmacyId?: string): void {
    const event: RealtimeEvent = {
      type: 'agent-notification',
      data: notificationData,
      timestamp: new Date().toISOString()
    };

    if (pharmacyId) {
      this.io.to(`pharmacy-${pharmacyId}`).emit('agent-notification', event);
    } else {
      this.io.emit('agent-notification', event);
    }
  }

  public broadcastSystemNotification(notificationData: any): void {
    const event: RealtimeEvent = {
      type: 'system-notification',
      data: notificationData,
      timestamp: new Date().toISOString()
    };

    this.io.emit('system-notification', event);
  }

  public getConnectedUsers(): number {
    return this.connectedUsers.size;
  }

  public getPharmacyRoomMembers(pharmacyId: string): number {
    const roomMembers = this.pharmacyRooms.get(pharmacyId);
    return roomMembers ? roomMembers.size : 0;
  }

  public sendToUser(userId: string, event: string, data: any): void {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  public sendToPharmacy(pharmacyId: string, event: string, data: any): void {
    this.io.to(`pharmacy-${pharmacyId}`).emit(event, data);
  }
}
