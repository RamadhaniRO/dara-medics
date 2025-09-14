import axios from 'axios';
import { LoggerService } from '../../../core/logger/logger.service';

export interface TigoConfig {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export interface TigoPaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
}

export interface TigoPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status?: string;
  responseCode?: string;
  responseDescription?: string;
}

export class TigoPesaGateway {
  private logger: LoggerService;
  private config: TigoConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private baseUrl: string;

  constructor(config: TigoConfig, logger: LoggerService) {
    this.logger = logger;
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.tigo.com' 
      : 'https://sandbox.tigo.com';
  }

  public async initialize(): Promise<void> {
    try {
      await this.authenticate();
      this.logger.info('Tigo Pesa gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Tigo Pesa gateway:', error);
      throw error;
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.baseUrl}/oauth/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      this.logger.info('Tigo Pesa authentication successful');
    } catch (error) {
      this.logger.error('Tigo Pesa authentication failed:', error);
      throw new Error('Failed to authenticate with Tigo Pesa');
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  public async initiatePayment(request: TigoPaymentRequest): Promise<TigoPaymentResponse> {
    try {
      await this.ensureValidToken();

      // Format phone number (remove + and ensure it starts with country code)
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);
      
      const payload = {
        msisdn: phoneNumber,
        amount: Math.round(request.amount),
        externalId: request.reference,
        description: request.description,
        callbackUrl: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/tigo/callback`
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.status === 'PENDING' || responseData.status === 'SUCCESS') {
        this.logger.info('Tigo Pesa payment initiated successfully', {
          transactionId: responseData.transactionId,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: true,
          transactionId: responseData.transactionId,
          message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
          status: responseData.status,
          responseCode: responseData.status,
          responseDescription: 'Transaction initiated'
        };
      } else {
        this.logger.error('Tigo Pesa payment initiation failed', {
          response: responseData,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: false,
          message: `Payment failed: ${responseData.message || 'Unknown error'}`,
          responseCode: responseData.status || 'ERROR',
          responseDescription: responseData.message || 'Payment initiation failed'
        };
      }
    } catch (error) {
      this.logger.error('Tigo Pesa payment initiation error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          success: false,
          message: `Payment failed: ${errorMessage}`
        };
      }
      
      return {
        success: false,
        message: 'Payment failed due to a system error'
      };
    }
  }

  public async queryPaymentStatus(transactionId: string): Promise<TigoPaymentResponse> {
    try {
      await this.ensureValidToken();

      const response = await axios.get(
        `${this.baseUrl}/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          }
        }
      );

      const responseData = response.data;
      
      this.logger.info('Tigo Pesa payment status queried', {
        transactionId,
        status: responseData.status
      });

      if (responseData.status === 'SUCCESS') {
        return {
          success: true,
          transactionId: responseData.transactionId,
          message: 'Payment completed successfully',
          status: responseData.status,
          responseCode: responseData.status,
          responseDescription: 'Transaction successful'
        };
      } else if (responseData.status === 'FAILED') {
        return {
          success: false,
          message: 'Payment failed',
          status: responseData.status,
          responseCode: responseData.status,
          responseDescription: 'Transaction failed'
        };
      } else {
        return {
          success: false,
          message: `Payment status: ${responseData.status}`,
          status: responseData.status,
          responseCode: responseData.status,
          responseDescription: `Transaction status: ${responseData.status}`
        };
      }
    } catch (error) {
      this.logger.error('Tigo Pesa payment status query error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          success: false,
          message: `Status query failed: ${errorMessage}`
        };
      }
      
      return {
        success: false,
        message: 'Status query failed due to a system error'
      };
    }
  }

  public async refundPayment(transactionId: string, amount: number, reason: string): Promise<TigoPaymentResponse> {
    try {
      await this.ensureValidToken();

      const payload = {
        originalTransactionId: transactionId,
        amount: Math.round(amount),
        reason: reason,
        externalId: `REFUND_${transactionId}_${Date.now()}`
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/refunds/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.status === 'SUCCESS' || responseData.status === 'PENDING') {
        this.logger.info('Tigo Pesa refund initiated successfully', {
          originalTransactionId: transactionId,
          refundTransactionId: responseData.transactionId,
          amount,
          reason
        });

        return {
          success: true,
          transactionId: responseData.transactionId,
          message: 'Refund initiated successfully',
          status: responseData.status
        };
      } else {
        this.logger.error('Tigo Pesa refund initiation failed', {
          response: responseData,
          originalTransactionId: transactionId,
          amount
        });

        return {
          success: false,
          message: `Refund failed: ${responseData.message || 'Unknown error'}`,
          responseCode: responseData.status || 'ERROR',
          responseDescription: responseData.message || 'Refund initiation failed'
        };
      }
    } catch (error) {
      this.logger.error('Tigo Pesa refund error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          success: false,
          message: `Refund failed: ${errorMessage}`
        };
      }
      
      return {
        success: false,
        message: 'Refund failed due to a system error'
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add country code if not present (assuming Tanzania for Tigo Pesa)
    if (!cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }
    
    return cleaned;
  }
}
