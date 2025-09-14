import { LoggerService } from '../../core/logger/logger.service';
import { DatabaseService } from '../../core/database/database.service';

export interface Order {
  id: string;
  order_number: string;
  pharmacy_id: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  updated_at: string;
  confirmed_delivery_date?: Date;
  pickup_date?: Date;
  actual_delivery_date?: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum OrderType {
  WHOLESALE = 'wholesale',
  RETAIL = 'retail',
  PRESCRIPTION = 'prescription'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum DeliveryMethod {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  SHIPPING = 'shipping'
}

export interface CreateOrderRequest {
  pharmacyId: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    requiresPrescription?: boolean;
    prescriptionVerified?: boolean;
  }>;
  deliveryInfo?: {
    method: DeliveryMethod;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    instructions?: string;
  };
  specialInstructions?: string;
  orderType?: OrderType;
}

export class OrderService {
  private logger: LoggerService;
  private databaseService: DatabaseService;

  constructor(databaseService?: DatabaseService) {
    this.logger = new LoggerService();
    this.databaseService = databaseService || new DatabaseService();
  }

  public async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      this.logger.info('Creating new order', { 
        pharmacyId: request.pharmacyId,
        itemCount: request.items.length 
      });

      // Calculate totals
      const totalAmount = request.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const orderNumber = `MS-${Date.now()}`;

      // Create order in database
      const dbOrder = await this.databaseService.createOrder({
        order_number: orderNumber,
        pharmacy_id: request.pharmacyId,
        customer_id: request.customerInfo.phone, // Using phone as customer ID for now
        status: OrderStatus.PENDING,
        order_type: request.orderType || OrderType.WHOLESALE,
        total_amount: totalAmount,
        discount_amount: 0,
        tax_amount: 0,
        final_amount: totalAmount,
        payment_status: PaymentStatus.PENDING,
        delivery_method: request.deliveryInfo?.method || DeliveryMethod.DELIVERY,
        delivery_address: request.deliveryInfo?.address,
        delivery_instructions: request.deliveryInfo?.instructions,
        special_instructions: request.specialInstructions,
        metadata: {
          customerInfo: request.customerInfo,
          deliveryInfo: request.deliveryInfo
        }
      });

      // Create order items
      for (const item of request.items) {
        await this.databaseService.createOrderItem({
          order_id: dbOrder.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice,
          discount_amount: 0,
          requires_prescription: item.requiresPrescription || false,
          prescription_verified: item.prescriptionVerified || false,
          metadata: {
            originalRequest: item
          }
        });
      }

      // Convert to service interface
      const order: Order = {
        id: dbOrder.id,
        order_number: dbOrder.order_number,
        pharmacy_id: dbOrder.pharmacy_id,
        status: dbOrder.status,
        total_amount: dbOrder.total_amount,
        items_count: request.items.length,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        confirmed_delivery_date: dbOrder.confirmed_delivery_date ? new Date(dbOrder.confirmed_delivery_date) : undefined,
        pickup_date: dbOrder.pickup_date ? new Date(dbOrder.pickup_date) : undefined,
        actual_delivery_date: dbOrder.actual_delivery_date ? new Date(dbOrder.actual_delivery_date) : undefined
      };

      this.logger.info('Order created successfully', { 
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount
      });

      return order;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const dbOrder = await this.databaseService.getOrderById(orderId);
      if (!dbOrder) {
        return null;
      }

      // Get order items count
      const orderItems = await this.databaseService.getOrderItems(orderId);

      // Convert to service interface
      const order: Order = {
        id: dbOrder.id,
        order_number: dbOrder.order_number,
        pharmacy_id: dbOrder.pharmacy_id,
        status: dbOrder.status,
        total_amount: dbOrder.total_amount,
        items_count: orderItems.length,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        confirmed_delivery_date: dbOrder.confirmed_delivery_date ? new Date(dbOrder.confirmed_delivery_date) : undefined,
        pickup_date: dbOrder.pickup_date ? new Date(dbOrder.pickup_date) : undefined,
        actual_delivery_date: dbOrder.actual_delivery_date ? new Date(dbOrder.actual_delivery_date) : undefined
      };

      return order;
    } catch (error) {
      this.logger.error('Error getting order by ID:', error);
      throw error;
    }
  }

  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    try {
      const dbOrder = await this.databaseService.updateOrderStatus(orderId, newStatus);
      
      // Get order items count
      const orderItems = await this.databaseService.getOrderItems(orderId);

      // Convert to service interface
      const order: Order = {
        id: dbOrder.id,
        order_number: dbOrder.order_number,
        pharmacy_id: dbOrder.pharmacy_id,
        status: dbOrder.status,
        total_amount: dbOrder.total_amount,
        items_count: orderItems.length,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        confirmed_delivery_date: dbOrder.confirmed_delivery_date ? new Date(dbOrder.confirmed_delivery_date) : undefined,
        pickup_date: dbOrder.pickup_date ? new Date(dbOrder.pickup_date) : undefined,
        actual_delivery_date: dbOrder.actual_delivery_date ? new Date(dbOrder.actual_delivery_date) : undefined
      };
      
      this.logger.info('Order status updated', { 
        orderId, 
        newStatus 
      });

      return order;
    } catch (error) {
      this.logger.error('Error updating order status:', error);
      throw error;
    }
  }

  public async addItemToOrder(orderId: string, item: any): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Mock item addition
      order.total_amount += item.quantity * item.unitPrice;
      order.items_count += 1;

      this.logger.info('Item added to order', { 
        orderId, 
        productId: item.productId, 
        quantity: item.quantity 
      });

      return order;
    } catch (error) {
      this.logger.error('Error adding item to order:', error);
      throw error;
    }
  }

  public async removeItemFromOrder(orderId: string, itemId: string): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Mock item removal
      order.items_count = Math.max(0, order.items_count - 1);

      this.logger.info('Item removed from order', { orderId, itemId });

      return order;
    } catch (error) {
      this.logger.error('Error removing item from order:', error);
      throw error;
    }
  }

  public async scheduleDelivery(orderId: string, deliveryDate: string, deliveryTime: string): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Mock delivery scheduling
      order.confirmed_delivery_date = new Date(`${deliveryDate}T${deliveryTime}`);

      this.logger.info('Delivery scheduled', { 
        orderId, 
        deliveryDate: order.confirmed_delivery_date 
      });

      return order;
    } catch (error) {
      this.logger.error('Error scheduling delivery:', error);
      throw error;
    }
  }

  public async prepareForPickup(orderId: string, pickupDate: string, pickupTime: string): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Mock pickup preparation
      order.pickup_date = new Date(`${pickupDate}T${pickupTime}`);

      this.logger.info('Order prepared for pickup', { 
        orderId, 
        pickupDate: order.pickup_date 
      });

      return order;
    } catch (error) {
      this.logger.error('Error preparing order for pickup:', error);
      throw error;
    }
  }

  public async completeDelivery(orderId: string, _deliveryNotes?: string): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = OrderStatus.DELIVERED;
      order.actual_delivery_date = new Date();

      this.logger.info('Delivery completed', { orderId });

      return order;
    } catch (error) {
      this.logger.error('Error completing delivery:', error);
      throw error;
    }
  }
}
