import axios from 'axios';
import { LoggerService } from '../../../core/logger/logger.service';

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  businessShortcode: string;
  environment: 'sandbox' | 'production';
}

export interface MpesaPaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export class MpesaGateway {
  private logger: LoggerService;
  private config: MpesaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private baseUrl: string;

  constructor(config: MpesaConfig, logger: LoggerService) {
    this.logger = logger;
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  public async initialize(): Promise<void> {
    try {
      await this.authenticate();
      this.logger.info('M-Pesa gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize M-Pesa gateway:', error);
      throw error;
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      this.logger.info('M-Pesa authentication successful');
    } catch (error) {
      this.logger.error('M-Pesa authentication failed:', error);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  public async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      await this.ensureValidToken();

      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.config.businessShortcode}${this.config.passkey}${timestamp}`).toString('base64');
      
      // Format phone number (remove + and ensure it starts with 254)
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);
      
      const payload = {
        BusinessShortCode: this.config.businessShortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount),
        PartyA: phoneNumber,
        PartyB: this.config.businessShortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/mpesa/callback`,
        AccountReference: request.reference,
        TransactionDesc: request.description
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.ResponseCode === '0') {
        this.logger.info('M-Pesa payment initiated successfully', {
          checkoutRequestId: responseData.CheckoutRequestID,
          merchantRequestId: responseData.MerchantRequestID,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: true,
          transactionId: responseData.CheckoutRequestID,
          message: 'Payment initiated successfully. Please check your phone for the payment prompt.',
          checkoutRequestId: responseData.CheckoutRequestID,
          merchantRequestId: responseData.MerchantRequestID,
          responseCode: responseData.ResponseCode,
          responseDescription: responseData.ResponseDescription
        };
      } else {
        this.logger.error('M-Pesa payment initiation failed', {
          responseCode: responseData.ResponseCode,
          responseDescription: responseData.ResponseDescription,
          amount: request.amount,
          phoneNumber: phoneNumber
        });

        return {
          success: false,
          message: `Payment failed: ${responseData.ResponseDescription}`,
          responseCode: responseData.ResponseCode,
          responseDescription: responseData.ResponseDescription
        };
      }
    } catch (error) {
      this.logger.error('M-Pesa payment initiation error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errorMessage || error.message;
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

  public async queryPaymentStatus(checkoutRequestId: string): Promise<MpesaPaymentResponse> {
    try {
      await this.ensureValidToken();

      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.config.businessShortcode}${this.config.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.config.businessShortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      this.logger.info('M-Pesa payment status queried', {
        checkoutRequestId,
        resultCode: responseData.ResultCode,
        resultDesc: responseData.ResultDesc
      });

      if (responseData.ResultCode === 0) {
        // Payment successful
        const callbackMetadata = responseData.CallbackMetadata?.Item || [];
        const receiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        // const _transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
        // const _amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;

        return {
          success: true,
          transactionId: receiptNumber as string,
          message: 'Payment completed successfully',
          responseCode: responseData.ResultCode.toString(),
          responseDescription: responseData.ResultDesc
        };
      } else {
        // Payment failed or pending
        return {
          success: false,
          message: `Payment status: ${responseData.ResultDesc}`,
          responseCode: responseData.ResultCode.toString(),
          responseDescription: responseData.ResultDesc
        };
      }
    } catch (error) {
      this.logger.error('M-Pesa payment status query error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errorMessage || error.message;
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

  public async processCallback(callbackData: MpesaCallbackData): Promise<MpesaPaymentResponse> {
    try {
      const stkCallback = callbackData.Body.stkCallback;
      
      this.logger.info('M-Pesa callback received', {
        merchantRequestId: stkCallback.MerchantRequestID,
        checkoutRequestId: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      });

      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        const receiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        // const _transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
        // const _amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
        // const _phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        return {
          success: true,
          transactionId: receiptNumber as string,
          message: 'Payment completed successfully',
          responseCode: stkCallback.ResultCode.toString(),
          responseDescription: stkCallback.ResultDesc
        };
      } else {
        // Payment failed
        return {
          success: false,
          message: `Payment failed: ${stkCallback.ResultDesc}`,
          responseCode: stkCallback.ResultCode.toString(),
          responseDescription: stkCallback.ResultDesc
        };
      }
    } catch (error) {
      this.logger.error('M-Pesa callback processing error:', error);
      return {
        success: false,
        message: 'Callback processing failed'
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
    
    // Add country code if not present
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  public async refundPayment(transactionId: string, amount: number, reason: string): Promise<MpesaPaymentResponse> {
    try {
      await this.ensureValidToken();

      const payload = {
        Initiator: process.env.MPESA_INITIATOR_NAME || 'testapi',
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || 'test',
        CommandID: 'TransactionReversal',
        TransactionID: transactionId,
        Amount: Math.round(amount),
        ReceiverParty: this.config.businessShortcode,
        RecieverIdentifierType: '4',
        ResultURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/mpesa/refund/callback`,
        QueueTimeOutURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/payments/mpesa/timeout`,
        Remarks: reason,
        Occasion: 'Refund'
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/reversal/v1/request`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      if (responseData.ResponseCode === '0') {
        this.logger.info('M-Pesa refund initiated successfully', {
          transactionId,
          amount,
          reason,
          conversationId: responseData.ConversationID
        });

        return {
          success: true,
          transactionId: responseData.ConversationID,
          message: 'Refund initiated successfully'
        };
      } else {
        this.logger.error('M-Pesa refund initiation failed', {
          responseCode: responseData.ResponseCode,
          responseDescription: responseData.ResponseDescription,
          transactionId,
          amount
        });

        return {
          success: false,
          message: `Refund failed: ${responseData.ResponseDescription}`,
          responseCode: responseData.ResponseCode,
          responseDescription: responseData.ResponseDescription
        };
      }
    } catch (error) {
      this.logger.error('M-Pesa refund error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errorMessage || error.message;
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
}
