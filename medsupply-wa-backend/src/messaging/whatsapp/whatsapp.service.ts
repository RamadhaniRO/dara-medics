import axios from 'axios';
import { LoggerService } from '../../core/logger/logger.service';
import { WhatsAppMessage, WhatsAppWebhook, WhatsAppResponse } from './whatsapp.types';
import { ConversationService } from '../../services/conversation/conversation.service';
import { MessageService } from '../../services/message/message.service';

export class WhatsAppService {
  private logger: LoggerService;
  private conversationService: ConversationService;
  private messageService: MessageService;
  private apiUrl: string;
  private phoneNumberId: string;
  private accessToken: string;
  private verifyToken: string;

  constructor() {
    this.logger = new LoggerService();
    this.conversationService = new ConversationService(this.logger);
    this.messageService = new MessageService(this.logger);
    
    // Load configuration from environment
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing WhatsApp service...');
      
      if (!this.phoneNumberId || !this.accessToken) {
        this.logger.warn('WhatsApp configuration incomplete. Running in development mode without WhatsApp.');
        this.logger.warn('To enable WhatsApp, set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN environment variables.');
        return; // Don't throw error, just log warning and continue
      }

      // Verify webhook configuration
      // await this.verifyWebhook();
      
      this.logger.info('WhatsApp service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp service:', error);
      throw error;
    }
  }

  public async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    try {
      if (mode === 'subscribe' && token === this.verifyToken) {
        this.logger.info('WhatsApp webhook verified successfully');
        return challenge;
      }
      
      this.logger.warn('WhatsApp webhook verification failed');
      return null;
    } catch (error) {
      this.logger.error('Error during webhook verification:', error);
      return null;
    }
  }

  public async processWebhook(webhookData: WhatsAppWebhook): Promise<void> {
    try {
      this.logger.info('Processing WhatsApp webhook', { 
        object: webhookData.object,
        entryCount: webhookData.entry?.length || 0 
      });

      if (webhookData.object !== 'whatsapp_business_account') {
        this.logger.warn('Invalid webhook object type', { object: webhookData.object });
        return;
      }

      for (const entry of webhookData.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value?.messages) {
            for (const message of change.value.messages) {
              await this.processIncomingMessage(message);
            }
          }

          if (change.value?.statuses) {
            for (const status of change.value.statuses) {
              await this.processMessageStatus(status);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
      throw error;
    }
  }

  private async processIncomingMessage(message: WhatsAppMessage): Promise<void> {
    try {
      this.logger.info('Processing incoming WhatsApp message', {
        messageId: message.id,
        from: message.from,
        type: message.type,
        timestamp: message.timestamp
      });

      // Store message in database
      const savedMessage = await this.messageService.createMessage({
        conversationId: '', // Will be set when conversation is created/retrieved
        senderId: message.from,
        senderType: 'customer' as any,
        content: this.extractMessageContent(message),
        messageType: message.type as any,
        status: 'delivered' as any,
        metadata: message
      });

      // Get or create conversation
      const conversation = await this.conversationService.getOrCreateConversation(
        message.from,
        savedMessage.id
      );

      // Update message with conversation ID
      await this.messageService.updateMessage(savedMessage.id, {
        conversation_id: conversation.id
      });

      // Log WhatsApp message
      this.logger.logWhatsAppMessage(message, 'inbound');

      // Emit event for agent processing
      // This will be handled by the agent orchestrator
      // await this.emitMessageForProcessing(conversation, savedMessage);

    } catch (error) {
      this.logger.error('Error processing incoming message:', error);
      throw error;
    }
  }

  private async processMessageStatus(status: any): Promise<void> {
    try {
      this.logger.info('Processing message status update', {
        messageId: status.id,
        status: status.status,
        timestamp: status.timestamp
      });

      // Update message status in database
      await this.messageService.updateMessageByExternalId(status.id, {
        status: status.status,
        status_metadata: status
      });

    } catch (error) {
      this.logger.error('Error processing message status:', error);
      throw error;
    }
  }

  private extractMessageContent(message: WhatsAppMessage): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return `[Image: ${message.image?.caption || 'No caption'}]`;
      case 'document':
        return `[Document: ${message.document?.filename || 'Unnamed document'}]`;
      case 'audio':
        return '[Audio message]';
      case 'video':
        return `[Video: ${message.video?.caption || 'No caption'}]`;
      case 'location':
        const location = message.location;
        return `[Location: ${location?.latitude}, ${location?.longitude}]`;
      case 'contact':
        const contact = message.contacts?.[0];
        return `[Contact: ${(contact as any)?.name?.formatted_name || 'Unknown'}]`;
      default:
        return `[${message.type} message]`;
    }
  }

  public async sendMessage(to: string, message: string, options?: {
    type?: 'text' | 'template' | 'interactive';
    templateName?: string;
    templateParams?: string[];
    quickReplies?: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'document' | 'audio' | 'video';
    caption?: string;
  }): Promise<WhatsAppResponse> {
    try {
      this.logger.info('Sending WhatsApp message', { to, type: options?.type || 'text' });

      const payload = this.buildMessagePayload(to, message, options);
      
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      
      this.logger.info('WhatsApp message sent successfully', {
        messageId: responseData.messages?.[0]?.id,
        to,
        type: options?.type || 'text'
      });

      // Store outbound message in database
      await this.storeOutboundMessage(to, message, options, responseData);

      return responseData;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  private buildMessagePayload(to: string, message: string, options?: any): any {
    const basePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: options?.type || 'text'
    };

    switch (options?.type) {
      case 'template':
        return {
          ...basePayload,
          type: 'template',
          template: {
            name: options.templateName,
            language: {
              code: 'en'
            },
            components: options.templateParams ? [{
              type: 'body',
              parameters: options.templateParams.map((param: string) => ({
                type: 'text',
                text: param
              }))
            }] : []
          }
        };

      case 'interactive':
        return {
          ...basePayload,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: message
            },
            action: {
              buttons: options.quickReplies?.map((reply: string, index: number) => ({
                type: 'reply',
                reply: {
                  id: `btn_${index}`,
                  title: reply
                }
              })) || []
            }
          }
        };

      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        return {
          ...basePayload,
          type: options.type,
          [options.type]: {
            link: options.mediaUrl,
            caption: options.caption || message
          }
        };

      default:
        return {
          ...basePayload,
          type: 'text',
          text: {
            body: message
          }
        };
    }
  }

  private async storeOutboundMessage(
    to: string, 
    message: string, 
    options: any, 
    responseData: any
  ): Promise<void> {
    try {
      // Get conversation for this phone number
      const conversation = await this.conversationService.getConversationByPhone(to);
      
      if (conversation) {
        await this.messageService.createMessage({
          conversationId: conversation.id,
          senderId: this.phoneNumberId,
          senderType: 'pharmacy' as any,
          content: message,
          messageType: (options?.type || 'text') as any,
          status: 'sent' as any,
          metadata: { options, response: responseData }
        });
      }
    } catch (error) {
      this.logger.error('Error storing outbound message:', error);
      // Don't throw error as this is not critical for message sending
    }
  }

  public async sendTemplateMessage(
    to: string, 
    templateName: string, 
    params: string[] = []
  ): Promise<WhatsAppResponse> {
    return this.sendMessage(to, '', {
      type: 'template',
      templateName,
      templateParams: params
    });
  }

  public async sendQuickReplyMessage(
    to: string, 
    message: string, 
    quickReplies: string[]
  ): Promise<WhatsAppResponse> {
    return this.sendMessage(to, message, {
      type: 'interactive',
      quickReplies
    });
  }

  public async sendMediaMessage(
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    caption?: string
  ): Promise<WhatsAppResponse> {
    return this.sendMessage(to, caption || '', {
      type: 'text' as any,
      mediaUrl,
      mediaType,
      caption
    });
  }

  public async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.info('Message marked as read', { messageId });
    } catch (error) {
      this.logger.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  public async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get message status:', error);
      throw error;
    }
  }

  // Removed duplicate verifyWebhook method

  public async getServiceHealth(): Promise<{
    isHealthy: boolean;
    phoneNumberId: string;
    apiUrl: string;
    lastError?: string;
  }> {
    try {
      // Test API connectivity
      await axios.get(`${this.apiUrl}/${this.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        isHealthy: true,
        phoneNumberId: this.phoneNumberId,
        apiUrl: this.apiUrl
      };
    } catch (error) {
      return {
        isHealthy: false,
        phoneNumberId: this.phoneNumberId,
        apiUrl: this.apiUrl,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async close(): Promise<void> {
    this.logger.info('WhatsApp service closed');
  }
}
