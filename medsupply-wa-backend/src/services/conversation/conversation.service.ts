import { DatabaseService } from '../../core/database/database.service';

export interface ConversationContext {
  pharmacyId: string;
  customerId: string;
  sessionData: Record<string, any>;
  requiresPrescription: boolean;
  prescriptionVerified: boolean;
}

export interface Conversation {
  id: string;
  customerId: string;
  pharmacyId: string;
  status: 'active' | 'closed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
  context: ConversationContext;
}

export class ConversationService {
  private logger: any;
  private databaseService: DatabaseService;

  constructor(logger: any, databaseService?: DatabaseService) {
    this.logger = logger;
    this.databaseService = databaseService || new DatabaseService();
  }

  public async createConversation(customerId: string, pharmacyId: string): Promise<Conversation> {
    try {
      const context = {
          pharmacyId,
          customerId,
          sessionData: {},
          requiresPrescription: false,
          prescriptionVerified: false
      };

      const dbConversation = await this.databaseService.createConversation({
        customer_id: customerId,
        pharmacy_id: pharmacyId,
        phone_number: customerId, // Assuming customerId is phone number
        status: 'active',
        context,
        last_message_at: new Date().toISOString(),
        metadata: {
          createdBy: 'system'
        }
      });

      const conversation: Conversation = {
        id: dbConversation.id,
        customerId: dbConversation.customer_id,
        pharmacyId: dbConversation.pharmacy_id,
        status: dbConversation.status as 'active' | 'closed' | 'escalated',
        createdAt: new Date(dbConversation.created_at),
        updatedAt: new Date(dbConversation.updated_at),
        context: dbConversation.context
      };

      this.logger.info('Conversation created', { conversationId: conversation.id });
      return conversation;
    } catch (error) {
      this.logger.error('Conversation creation failed', { error, customerId, pharmacyId });
      throw error;
    }
  }

  public async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const dbConversation = await this.databaseService.getConversationById(conversationId);
      if (!dbConversation) {
        return null;
      }

      const conversation: Conversation = {
        id: dbConversation.id,
        customerId: dbConversation.customer_id,
        pharmacyId: dbConversation.pharmacy_id,
        status: dbConversation.status as 'active' | 'closed' | 'escalated',
        createdAt: new Date(dbConversation.created_at),
        updatedAt: new Date(dbConversation.updated_at),
        context: dbConversation.context
      };

      return conversation;
    } catch (error) {
      this.logger.error('Get conversation failed', { error, conversationId });
      return null;
    }
  }

  public async getConversationById(conversationId: string): Promise<Conversation | null> {
    return this.getConversation(conversationId);
  }

  public async updateConversation(conversationId: string, updates: any): Promise<boolean> {
    try {
      await this.databaseService.updateConversation(conversationId, updates);
      this.logger.info('Conversation updated', { conversationId, updates });
      return true;
    } catch (error) {
      this.logger.error('Conversation update failed', { error, conversationId, updates });
      return false;
    }
  }

  public async getConversationByPhone(phoneNumber: string): Promise<Conversation | null> {
    try {
      const dbConversation = await this.databaseService.getConversationByPhone(phoneNumber);
      if (!dbConversation) {
        return null;
      }

      const conversation: Conversation = {
        id: dbConversation.id,
        customerId: dbConversation.customer_id,
        pharmacyId: dbConversation.pharmacy_id,
        status: dbConversation.status as 'active' | 'closed' | 'escalated',
        createdAt: new Date(dbConversation.created_at),
        updatedAt: new Date(dbConversation.updated_at),
        context: dbConversation.context
      };

      return conversation;
    } catch (error) {
      this.logger.error('Get conversation by phone failed', { error, phoneNumber });
      return null;
    }
  }

  public async getOrCreateConversation(customerId: string, pharmacyId: string): Promise<Conversation> {
    try {
      // Try to get existing conversation
      const existing = await this.getConversation('CONV-' + customerId);
      if (existing) {
        return existing;
      }

      // Create new conversation
      return await this.createConversation(customerId, pharmacyId);
    } catch (error) {
      this.logger.error('Get or create conversation failed', { error, customerId, pharmacyId });
      throw error;
    }
  }
}
