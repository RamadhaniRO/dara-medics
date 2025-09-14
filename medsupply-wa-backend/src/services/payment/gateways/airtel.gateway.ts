import axios from 'axios';
import { LoggerService } from '../../../core/logger/logger.service';

export interface AirtelConfig {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export interface AirtelPaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
}

export interface AirtelPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status?: string;
  responseCode?: string;
  responseDescription?: string;
}

export class AirtelMoneyGateway {
  private logger: LoggerService;
  private config: AirtelConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private baseUrl: string;

  constructor(config: AirtelConfig, logger: LoggerService) {
    this.logger = logger;
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://openapiuat.airtel.africa' 
      : 'https://openapiuat.airtel.africa'; // Airtel uses same URL for sandbox
  }

  public async initialize(): Promise<void> {
    try {
      await this.authenticate();
      this.logger.info('Airtel Money gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Airtel Money gateway:', error);
      throw error;
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.baseUrl}/auth/oauth2/token`, 
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
      
      this.logger.info('Airtel Money authentication successful');
    } catch (error) {
      this.logger.error('Airtel Money authentication failed:', error);
      throw new Error('Failed to authenticate with Airtel Money');
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  public async initiatePayment(request: AirtelPaymentRequest): Promise<AirtelPaymentResponse> {
    try {
      await this.ensureValidToken();

      // Format phone number (remove + and ensure it starts with country code)
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);
      
      const payload = {
        payee: {
          msisdn: phoneNumber
        },
        reference: request.reference,
        pin: process.env.AIRTEL_MONEY_PIN || '1234', // In production, this should be securely stored
        transaction: {
          amount: Math.round(request.amount),
          id: request.reference
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/merchant/v1/payments/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Country': 'KE', // Kenya
            'X-Currency': 'KES',
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.data && responseData.data.transaction && responseData.data.transaction.status === 'TS') {
        this.logger.info('Airtel Money payment initiated successfully', {
          transactionId: responseData.data.transaction.id,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: true,
          transactionId: responseData.data.transaction.id,
          message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
          status: responseData.data.transaction.status,
          responseCode: responseData.data.transaction.status,
          responseDescription: 'Transaction initiated'
        };
      } else {
        this.logger.error('Airtel Money payment initiation failed', {
          response: responseData,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: false,
          message: `Payment failed: ${responseData.message || 'Unknown error'}`,
          responseCode: responseData.data?.transaction?.status || 'ERROR',
          responseDescription: responseData.message || 'Payment initiation failed'
        };
      }
    } catch (error) {
      this.logger.error('Airtel Money payment initiation error:', error);
      
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

  public async queryPaymentStatus(transactionId: string): Promise<AirtelPaymentResponse> {
    try {
      await this.ensureValidToken();

      const response = await axios.get(
        `${this.baseUrl}/standard/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Country': 'KE',
            'X-Currency': 'KES',
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      this.logger.info('Airtel Money payment status queried', {
        transactionId,
        status: responseData.data?.transaction?.status
      });

      if (responseData.data && responseData.data.transaction) {
        const transaction = responseData.data.transaction;
        
        if (transaction.status === 'TS') {
          return {
            success: true,
            transactionId: transaction.id,
            message: 'Payment completed successfully',
            status: transaction.status,
            responseCode: transaction.status,
            responseDescription: 'Transaction successful'
          };
        } else if (transaction.status === 'TF') {
          return {
            success: false,
            message: 'Payment failed',
            status: transaction.status,
            responseCode: transaction.status,
            responseDescription: 'Transaction failed'
          };
        } else {
          return {
            success: false,
            message: `Payment status: ${transaction.status}`,
            status: transaction.status,
            responseCode: transaction.status,
            responseDescription: `Transaction status: ${transaction.status}`
          };
        }
      } else {
        return {
          success: false,
          message: 'Payment not found',
          responseCode: 'NOT_FOUND',
          responseDescription: 'Transaction not found'
        };
      }
    } catch (error) {
      this.logger.error('Airtel Money payment status query error:', error);
      
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

  public async refundPayment(transactionId: string, amount: number, reason: string): Promise<AirtelPaymentResponse> {
    try {
      await this.ensureValidToken();

      const payload = {
        transaction: {
          amount: Math.round(amount),
          id: `REFUND_${transactionId}_${Date.now()}`
        },
        reference: `REFUND_${transactionId}`,
        pin: process.env.AIRTEL_MONEY_PIN || '1234'
      };

      const response = await axios.post(
        `${this.baseUrl}/standard/v1/payments/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Country': 'KE',
            'X-Currency': 'KES',
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.data && responseData.data.transaction && responseData.data.transaction.status === 'TS') {
        this.logger.info('Airtel Money refund initiated successfully', {
          originalTransactionId: transactionId,
          refundTransactionId: responseData.data.transaction.id,
          amount,
          reason
        });

        return {
          success: true,
          transactionId: responseData.data.transaction.id,
          message: 'Refund initiated successfully',
          status: responseData.data.transaction.status
        };
      } else {
        this.logger.error('Airtel Money refund initiation failed', {
          response: responseData,
          originalTransactionId: transactionId,
          amount
        });

        return {
          success: false,
          message: `Refund failed: ${responseData.message || 'Unknown error'}`,
          responseCode: responseData.data?.transaction?.status || 'ERROR',
          responseDescription: responseData.message || 'Refund initiation failed'
        };
      }
    } catch (error) {
      this.logger.error('Airtel Money refund error:', error);
      
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
    
    // Add country code if not present (assuming Kenya for now)
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }
}
