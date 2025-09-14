import { LoggerService } from '../../core/logger/logger.service';
import { DatabaseService } from '../../core/database/database.service';
import { MpesaGateway, MpesaConfig } from './gateways/mpesa.gateway';
import { AirtelMoneyGateway, AirtelConfig } from './gateways/airtel.gateway';
import { TigoPesaGateway, TigoConfig } from './gateways/tigo.gateway';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string;
  phone_number: string;
  customer_name: string;
  customer_email?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  AIRTEL_MONEY = 'airtel_money',
  TIGO_PESA = 'tigo_pesa',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer'
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  phoneNumber: string;
  customerName: string;
  customerEmail?: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  paymentUrl?: string;
  qrCode?: string;
  requiresConfirmation?: boolean;
}

export interface PaymentConfirmation {
  transactionId: string;
  status: PaymentStatus;
  confirmationCode?: string;
  metadata?: any;
}

export class PaymentService {
  private logger: LoggerService;
  private databaseService: DatabaseService;
  private mpesaGateway: MpesaGateway | null = null;
  private airtelGateway: AirtelMoneyGateway | null = null;
  private tigoGateway: TigoPesaGateway | null = null;

  constructor(databaseService?: DatabaseService) {
    this.logger = new LoggerService();
    this.databaseService = databaseService || new DatabaseService();
    // Initialize gateways will be called explicitly after construction
  }

  public async initializeGateways(): Promise<void> {
    try {
      // Initialize M-Pesa gateway
      if (process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET) {
        const mpesaConfig: MpesaConfig = {
          consumerKey: process.env.MPESA_CONSUMER_KEY,
          consumerSecret: process.env.MPESA_CONSUMER_SECRET,
          passkey: process.env.MPESA_PASSKEY || '',
          businessShortcode: process.env.MPESA_BUSINESS_SHORTCODE || '',
          environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
        };
        this.mpesaGateway = new MpesaGateway(mpesaConfig, this.logger);
      }

      // Initialize Airtel Money gateway
      if (process.env.AIRTEL_MONEY_CLIENT_ID && process.env.AIRTEL_MONEY_CLIENT_SECRET) {
        const airtelConfig: AirtelConfig = {
          clientId: process.env.AIRTEL_MONEY_CLIENT_ID,
          clientSecret: process.env.AIRTEL_MONEY_CLIENT_SECRET,
          apiKey: process.env.AIRTEL_MONEY_API_KEY || '',
          environment: (process.env.AIRTEL_MONEY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
        };
        this.airtelGateway = new AirtelMoneyGateway(airtelConfig, this.logger);
      }

      // Initialize Tigo Pesa gateway
      if (process.env.TIGO_PESA_CLIENT_ID && process.env.TIGO_PESA_CLIENT_SECRET) {
        const tigoConfig: TigoConfig = {
          clientId: process.env.TIGO_PESA_CLIENT_ID,
          clientSecret: process.env.TIGO_PESA_CLIENT_SECRET,
          apiKey: process.env.TIGO_PESA_API_KEY || '',
          environment: (process.env.TIGO_PESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
        };
        this.tigoGateway = new TigoPesaGateway(tigoConfig, this.logger);
      }

      this.logger.info('Payment gateways initialized', {
        mpesa: !!this.mpesaGateway,
        airtel: !!this.airtelGateway,
        tigo: !!this.tigoGateway
      });
    } catch (error) {
      this.logger.error('Failed to initialize payment gateways:', error);
    }
  }

  public async processPaymentRequest(content: string, _context: any, _intent: any): Promise<any> {
    try {
      // Mock payment processing
      const mockResponse = {
        success: true,
        response: 'I understand you have a payment-related question. Let me help you with that. Could you please provide your order number or payment details?',
        requiresHumanReview: false
      };

      this.logger.info('Payment request processed', { content: content.substring(0, 100) });
      return mockResponse;
    } catch (error) {
      this.logger.error('Process payment request failed', { error, content });
      return {
        success: false,
        response: 'I encountered an error while processing your payment request. Please try again.',
        requiresHumanReview: true
      };
    }
  }

  public async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.logger.info('Initiating payment', { 
        orderId: request.orderId,
        amount: request.amount,
        method: request.method 
      });

      // Validate payment request
      const validation = this.validatePaymentRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Create payment record
      const payment = await this.createPaymentRecord(request);

      // Process payment based on method
      let paymentResponse: PaymentResponse;

      switch (request.method) {
        case PaymentMethod.MPESA:
          paymentResponse = await this.processMpesaPayment(request, payment);
          break;
        case PaymentMethod.AIRTEL_MONEY:
          paymentResponse = await this.processAirtelMoneyPayment(request, payment);
          break;
        case PaymentMethod.TIGO_PESA:
          paymentResponse = await this.processTigoPesaPayment(request, payment);
          break;
        default:
          paymentResponse = {
            success: false,
            message: 'Unsupported payment method.'
          };
      }

      if (paymentResponse.success) {
        // Update payment record with transaction details
        await this.updatePaymentRecord(payment.id, {
          transaction_id: paymentResponse.transactionId,
          status: PaymentStatus.PENDING,
          metadata: {
            paymentUrl: paymentResponse.paymentUrl,
            qrCode: paymentResponse.qrCode,
            requiresConfirmation: paymentResponse.requiresConfirmation
          }
        });
      }

      this.logger.info('Payment initiated', { 
        paymentId: payment.id,
        success: paymentResponse.success 
      });

      return paymentResponse;
    } catch (error) {
      this.logger.error('Error initiating payment:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error while processing your payment. Please try again.'
      };
    }
  }

  public async confirmPayment(confirmation: PaymentConfirmation): Promise<PaymentResponse> {
    try {
      this.logger.info('Confirming payment', { 
        transactionId: confirmation.transactionId 
      });

      // Find payment by transaction ID
      const payment = await this.findPaymentByTransactionId(confirmation.transactionId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found.'
        };
      }

      // Verify payment with payment provider
      const verificationResult = await this.verifyPaymentWithProvider(
        payment.method as PaymentMethod,
        confirmation.transactionId,
        confirmation.confirmationCode
      );

      if (verificationResult.success) {
        // Update payment status
        await this.updatePaymentRecord(payment.id, {
          status: PaymentStatus.COMPLETED,
          confirmed_at: new Date(),
          metadata: {
            ...payment.metadata,
            confirmationCode: confirmation.confirmationCode,
            verificationResult: verificationResult.metadata
          }
        });

        // Update order payment status
        await this.updateOrderPaymentStatus(payment.order_id, PaymentStatus.COMPLETED);

        this.logger.info('Payment confirmed successfully', { 
          paymentId: payment.id,
          transactionId: confirmation.transactionId 
        });

        return {
          success: true,
          message: 'Payment confirmed successfully! Your order is now being processed.',
          transactionId: confirmation.transactionId
        };
      } else {
        // Update payment status to failed
        await this.updatePaymentRecord(payment.id, {
          status: PaymentStatus.FAILED,
          metadata: {
            ...payment.metadata,
            failureReason: verificationResult.message
          }
        });

        return {
          success: false,
          message: `Payment verification failed: ${verificationResult.message}`
        };
      }
    } catch (error) {
      this.logger.error('Error confirming payment:', error);
      return {
        success: false,
        message: 'Error occurred while confirming payment. Please contact support.'
      };
    }
  }

  public async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.findPaymentByTransactionId(transactionId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found.'
        };
      }

      return {
        success: true,
        message: `Payment status: ${payment.status}`,
        transactionId: payment.transaction_id,
        requiresConfirmation: payment.status === PaymentStatus.PENDING
      };
    } catch (error) {
      this.logger.error('Error getting payment status:', error);
      return {
        success: false,
        message: 'Error occurred while retrieving payment status.'
      };
    }
  }

  public async refundPayment(paymentId: string, reason: string): Promise<PaymentResponse> {
    try {
      this.logger.info('Processing refund', { paymentId, reason });

      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found.'
        };
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        return {
          success: false,
          message: 'Only completed payments can be refunded.'
        };
      }

      // Process refund with payment provider
      const refundResult = await this.processRefundWithProvider(
        payment.method as PaymentMethod,
        payment.transaction_id || 'mock-transaction-id',
        payment.amount,
        reason
      );

      if (refundResult.success) {
        // Update payment status
        await this.updatePaymentRecord(paymentId, {
          status: PaymentStatus.REFUNDED,
          refunded_at: new Date(),
          refund_reason: reason,
          metadata: {
            ...payment.metadata,
            refundResult: refundResult.metadata
          }
        });

        // Update order payment status
        await this.updateOrderPaymentStatus(payment.order_id, PaymentStatus.REFUNDED);

        this.logger.info('Refund processed successfully', { paymentId });

        return {
          success: true,
          message: 'Refund processed successfully.',
          transactionId: payment.transaction_id
        };
      } else {
        return {
          success: false,
          message: `Refund failed: ${refundResult.message}`
        };
      }
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      return {
        success: false,
        message: 'Error occurred while processing refund.'
      };
    }
  }

  private validatePaymentRequest(request: PaymentRequest): { isValid: boolean; message: string } {
    if (!request.orderId) {
      return { isValid: false, message: 'Order ID is required.' };
    }

    if (!request.amount || request.amount <= 0) {
      return { isValid: false, message: 'Valid amount is required.' };
    }

    if (!request.method) {
      return { isValid: false, message: 'Payment method is required.' };
    }

    if (!request.phoneNumber) {
      return { isValid: false, message: 'Phone number is required.' };
    }

    if (!request.customerName) {
      return { isValid: false, message: 'Customer name is required.' };
    }

    return { isValid: true, message: 'Payment request is valid.' };
  }

  private async createPaymentRecord(request: PaymentRequest): Promise<Payment> {
    const dbPayment = await this.databaseService.createPayment({
      order_id: request.orderId,
      amount: request.amount,
      method: request.method,
      status: PaymentStatus.PENDING,
      phone_number: request.phoneNumber,
      customer_name: request.customerName,
      customer_email: request.customerEmail,
      description: request.description || `Payment for order ${request.orderId}`,
      metadata: {
        originalRequest: request
      }
    });

    // Convert to service interface
    const payment: Payment = {
      id: dbPayment.id,
      order_id: dbPayment.order_id,
      amount: dbPayment.amount,
      method: dbPayment.method,
      status: dbPayment.status,
      transaction_id: dbPayment.transaction_id,
      phone_number: dbPayment.phone_number,
      customer_name: dbPayment.customer_name,
      customer_email: dbPayment.customer_email,
      description: dbPayment.description,
      metadata: dbPayment.metadata,
      created_at: dbPayment.created_at,
      updated_at: dbPayment.updated_at
    };

    this.logger.info('Payment record created', { paymentId: payment.id });

    return payment;
  }

  private async processMpesaPayment(request: PaymentRequest, payment: Payment): Promise<PaymentResponse> {
    try {
      this.logger.info('Processing M-Pesa payment', { paymentId: payment.id });

      if (!this.mpesaGateway) {
        return {
          success: false,
          message: 'M-Pesa gateway not configured'
        };
      }

      const mpesaResponse = await this.mpesaGateway.initiatePayment({
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        reference: payment.id,
        description: request.description || `Payment for order ${request.orderId}`
      });

      if (mpesaResponse.success) {
        return {
          success: true,
          transactionId: mpesaResponse.transactionId,
          message: mpesaResponse.message,
          requiresConfirmation: true
        };
      } else {
        return {
          success: false,
          message: mpesaResponse.message
        };
      }
    } catch (error) {
      this.logger.error('Error processing M-Pesa payment:', error);
      return {
        success: false,
        message: 'Error occurred while processing M-Pesa payment.'
      };
    }
  }

  private async processAirtelMoneyPayment(request: PaymentRequest, payment: Payment): Promise<PaymentResponse> {
    try {
      this.logger.info('Processing Airtel Money payment', { paymentId: payment.id });

      if (!this.airtelGateway) {
        return {
          success: false,
          message: 'Airtel Money gateway not configured'
        };
      }

      const airtelResponse = await this.airtelGateway.initiatePayment({
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        reference: payment.id,
        description: request.description || `Payment for order ${request.orderId}`
      });

      if (airtelResponse.success) {
        return {
          success: true,
          transactionId: airtelResponse.transactionId,
          message: airtelResponse.message,
          requiresConfirmation: true
        };
      } else {
        return {
          success: false,
          message: airtelResponse.message
        };
      }
    } catch (error) {
      this.logger.error('Error processing Airtel Money payment:', error);
      return {
        success: false,
        message: 'Error occurred while processing Airtel Money payment.'
      };
    }
  }

  private async processTigoPesaPayment(request: PaymentRequest, payment: Payment): Promise<PaymentResponse> {
    try {
      this.logger.info('Processing Tigo Pesa payment', { paymentId: payment.id });

      if (!this.tigoGateway) {
        return {
          success: false,
          message: 'Tigo Pesa gateway not configured'
        };
      }

      const tigoResponse = await this.tigoGateway.initiatePayment({
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        reference: payment.id,
        description: request.description || `Payment for order ${request.orderId}`
      });

      if (tigoResponse.success) {
        return {
          success: true,
          transactionId: tigoResponse.transactionId,
          message: tigoResponse.message,
          requiresConfirmation: true
        };
      } else {
        return {
          success: false,
          message: tigoResponse.message
        };
      }
    } catch (error) {
      this.logger.error('Error processing Tigo Pesa payment:', error);
      return {
        success: false,
        message: 'Error occurred while processing Tigo Pesa payment.'
      };
    }
  }


  private async verifyPaymentWithProvider(
    method: PaymentMethod,
    transactionId: string,
    _confirmationCode?: string
  ): Promise<{ success: boolean; message: string; metadata?: any }> {
    // Mock payment verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate verification success
    return {
      success: true,
      message: 'Payment verified successfully',
      metadata: {
        verifiedAt: new Date().toISOString(),
        method,
        transactionId
      }
    };
  }

  private async processRefundWithProvider(
    method: PaymentMethod,
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; message: string; metadata?: any }> {
    // Mock refund processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate refund success
    return {
      success: true,
      message: 'Refund processed successfully',
      metadata: {
        refundedAt: new Date().toISOString(),
        method,
        transactionId,
        amount,
        reason
      }
    };
  }

  private async findPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
    const dbPayment = await this.databaseService.getPaymentByTransactionId(transactionId);
    if (!dbPayment) {
      return null;
    }

    // Convert to service interface
    const payment: Payment = {
      id: dbPayment.id,
      order_id: dbPayment.order_id,
      amount: dbPayment.amount,
      method: dbPayment.method,
      status: dbPayment.status,
      transaction_id: dbPayment.transaction_id,
      phone_number: dbPayment.phone_number,
      customer_name: dbPayment.customer_name,
      customer_email: dbPayment.customer_email,
      description: dbPayment.description,
      metadata: dbPayment.metadata,
      created_at: dbPayment.created_at,
      updated_at: dbPayment.updated_at
    };

    return payment;
  }

  private async getPaymentById(paymentId: string): Promise<Payment | null> {
    const dbPayment = await this.databaseService.getPaymentById(paymentId);
    if (!dbPayment) {
      return null;
    }

    // Convert to service interface
    const payment: Payment = {
      id: dbPayment.id,
      order_id: dbPayment.order_id,
      amount: dbPayment.amount,
      method: dbPayment.method,
      status: dbPayment.status,
      transaction_id: dbPayment.transaction_id,
      phone_number: dbPayment.phone_number,
      customer_name: dbPayment.customer_name,
      customer_email: dbPayment.customer_email,
      description: dbPayment.description,
      metadata: dbPayment.metadata,
      created_at: dbPayment.created_at,
      updated_at: dbPayment.updated_at
    };

    return payment;
  }

  private async updatePaymentRecord(paymentId: string, updates: any): Promise<void> {
    await this.databaseService.updatePayment(paymentId, updates);
    this.logger.info('Payment record updated', { paymentId, updates });
  }

  private async updateOrderPaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
    await this.databaseService.updateOrderStatus(orderId, status);
    this.logger.info('Order payment status updated', { orderId, status });
  }
}
