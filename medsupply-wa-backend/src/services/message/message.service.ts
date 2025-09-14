export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'pharmacy' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

export class MessageService {
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
  }

  public async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    try {
      const savedMessage: Message = {
        ...message,
        id: 'MSG-' + Date.now(),
        timestamp: new Date()
      };

      this.logger.info('Message saved', { messageId: savedMessage.id });
      return savedMessage;
    } catch (error) {
      this.logger.error('Message save failed', { error, message });
      throw error;
    }
  }

  public async getMessages(conversationId: string, _limit: number = 50): Promise<Message[]> {
    try {
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: 'MSG-001',
          conversationId,
          senderId: 'CUST-001',
          senderType: 'customer',
          content: 'Hello, I need some medication',
          messageType: 'text',
          timestamp: new Date(),
          status: 'read'
        },
        {
          id: 'MSG-002',
          conversationId,
          senderId: 'PHARM-001',
          senderType: 'pharmacy',
          content: 'Hello! How can I help you today?',
          messageType: 'text',
          timestamp: new Date(),
          status: 'read'
        }
      ];

      return mockMessages;
    } catch (error) {
      this.logger.error('Get messages failed', { error, conversationId });
      return [];
    }
  }

  public async createMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    return this.saveMessage(message);
  }

  public async updateMessage(messageId: string, updates: any): Promise<boolean> {
    try {
      this.logger.info('Message updated', { messageId, updates });
      return true;
    } catch (error) {
      this.logger.error('Message update failed', { error, messageId, updates });
      return false;
    }
  }

  public async updateMessageByExternalId(externalId: string, updates: any): Promise<boolean> {
    try {
      this.logger.info('Message updated by external ID', { externalId, updates });
      return true;
    } catch (error) {
      this.logger.error('Message update by external ID failed', { error, externalId, updates });
      return false;
    }
  }

  public async getMessageCount(conversationId: string): Promise<number> {
    try {
      const messages = await this.getMessages(conversationId);
      return messages.length;
    } catch (error) {
      this.logger.error('Get message count failed', { error, conversationId });
      return 0;
    }
  }
}
