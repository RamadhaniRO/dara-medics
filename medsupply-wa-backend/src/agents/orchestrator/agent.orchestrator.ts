import { LoggerService } from '../../core/logger/logger.service';
import { RAGService } from '../../rag/rag.service';
import { PaymentService } from '../../services/payment/payment.service';
import { IntentExtractor } from '../intent-extractor/intent.extractor';
import { CatalogAgent } from '../catalog-agent/catalog.agent';
import { OrderAgent } from '../order-agent/order.agent';
import { ComplianceAgent } from '../compliance-agent/compliance.agent';
import { FulfillmentAgent } from '../fulfillment-agent/fulfillment.agent';
import { ConversationService } from '../../services/conversation/conversation.service';
import { MessageService } from '../../services/message/message.service';
import { 
  ConversationContext, 
  MessageProcessingResult, 
  IntentClassification,
  ConversationState
} from './agent.types';

export class AgentOrchestrator {
  private logger: LoggerService;
  private ragService: RAGService;
  private paymentService: PaymentService;
  private conversationService: ConversationService;
  private messageService: MessageService;

  // Agents
  private intentExtractor: IntentExtractor;
  private catalogAgent: CatalogAgent;
  private orderAgent: OrderAgent;
  private complianceAgent: ComplianceAgent;
  private fulfillmentAgent: FulfillmentAgent;

  constructor(
    ragService: RAGService,
    paymentService: PaymentService
  ) {
    this.logger = new LoggerService();
    this.ragService = ragService;
    this.paymentService = paymentService;
    this.conversationService = new ConversationService(this.logger);
    this.messageService = new MessageService(this.logger);

    // Initialize agents
    this.intentExtractor = new IntentExtractor(this.logger);
    this.catalogAgent = new CatalogAgent(this.logger);
    this.orderAgent = new OrderAgent(this.logger);
    this.complianceAgent = new ComplianceAgent(this.logger);
    this.fulfillmentAgent = new FulfillmentAgent(this.logger);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing agent orchestrator...');

      // Initialize agents that have initialize methods
      const initializationPromises = [];
      
      // Only initialize services that have initialize methods
      if (typeof this.ragService.initialize === 'function') {
        initializationPromises.push(this.ragService.initialize());
      }

      await Promise.all(initializationPromises);

      this.logger.info('Agent orchestrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize agent orchestrator:', error);
      throw error;
    }
  }

  public async processMessage(
    conversationId: string,
    messageId: string,
    phoneNumber: string,
    content: string,
    _metadata?: any
  ): Promise<MessageProcessingResult> {
    try {
      this.logger.info('Processing message through agent orchestrator', {
        conversationId,
        messageId,
        phoneNumber,
        content: content.substring(0, 100) + '...'
      });

      // Get or create conversation context
      const context = await this.getConversationContext(conversationId, phoneNumber);
      
      // Extract intent from message
      const intent = await this.intentExtractor.extractIntent(content);
      
      this.logger.info('Intent extracted', { 
        intent: intent.intent, 
        confidence: intent.confidence,
        entities: intent.entities 
      });

      // Update conversation context with new intent
      context.lastIntent = intent.intent;
      context.confidence = intent.confidence;
      await this.updateConversationContext(conversationId, context);

      // Route to appropriate agent based on intent
      const result = await this.routeToAgent(intent, context, content);

      // Log agent action
      this.logger.logAgentAction(
        result.agentName || 'orchestrator',
        'process_message',
        {
          conversationId,
          messageId,
          intent: intent.intent,
          confidence: intent.confidence,
          result: result.success,
          requiresHumanReview: result.requiresHumanReview
        }
      );

      return result;

    } catch (error) {
      this.logger.error('Error processing message through orchestrator:', error);
      
      // Return error result that will trigger human escalation
      return {
        success: false,
        response: 'I apologize, but I encountered an error processing your request. A human agent will assist you shortly.',
        requiresHumanReview: true,
        escalationReason: 'System error during message processing',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async routeToAgent(
    intent: IntentClassification,
    context: ConversationContext,
    content: string
  ): Promise<MessageProcessingResult> {
    try {
      let result: MessageProcessingResult;

      switch (intent.intent) {
        case 'product_search':
        case 'catalog_query':
        case 'stock_check':
        case 'price_inquiry':
          result = await this.catalogAgent.processQuery(content, context, intent);
          break;

        case 'place_order':
        case 'add_to_cart':
        case 'modify_order':
        case 'order_status':
          result = await this.orderAgent.processOrderRequest(content, context, intent);
          break;

        case 'prescription_upload':
        case 'prescription_verification':
        case 'compliance_check':
          result = await this.complianceAgent.processComplianceRequest(content, context, intent);
          break;

        case 'delivery_inquiry':
        case 'tracking_request':
        case 'delivery_update':
          result = await this.fulfillmentAgent.processFulfillmentRequest(content, context, intent);
          break;

        case 'payment_inquiry':
        case 'payment_method':
        case 'payment_status':
          result = await this.paymentService.processPaymentRequest(content, context, intent);
          break;

        case 'general_inquiry':
        case 'help_request':
        case 'complaint':
          result = await this.handleGeneralInquiry(content, context, intent);
          break;

        case 'greeting':
        case 'goodbye':
          result = await this.handleConversationalMessage(content, context, intent);
          break;

        default:
          result = await this.handleUnknownIntent(content, context, intent);
          break;
      }

              // Check if result requires human escalation
        if (result.requiresHumanReview) {
          // Get conversation to escalate - we'll need to find the conversation by customer/pharmacy ID
          // For now, we'll escalate without getting the specific conversation
          if (result.escalationReason) {
            await this.escalateToHuman('', context, result.escalationReason);
          }
        }

      return result;

    } catch (error) {
      this.logger.error('Error routing to agent:', error);
      throw error;
    }
  }

  private async handleGeneralInquiry(
    content: string,
    _context: ConversationContext,
    _intent: IntentClassification
  ): Promise<MessageProcessingResult> {
    try {
      // Use RAG to find relevant information
      const searchResults = await this.ragService.search(content, 3);
      
      if (searchResults.length > 0) {
        const response = this.buildResponseFromRAG(searchResults);
        return {
          success: true,
          response,
          requiresHumanReview: false
        };
      }

      // Fallback to generic response
      return {
        success: true,
        response: 'I understand you have a general inquiry. Let me connect you with our support team for personalized assistance.',
        requiresHumanReview: true,
        escalationReason: 'General inquiry requiring human expertise'
      };

    } catch (error) {
      this.logger.error('Error handling general inquiry:', error);
      throw error;
    }
  }

  private async handleConversationalMessage(
    _content: string,
    context: ConversationContext,
    intent: IntentClassification
  ): Promise<MessageProcessingResult> {
    try {
      let response: string;

      switch (intent.intent) {
        case 'greeting':
          response = this.getGreetingResponse(context);
          break;
        case 'goodbye':
          response = this.getGoodbyeResponse();
          break;
        default:
          response = 'Thank you for your message. How can I assist you today?';
      }

      return {
        success: true,
        response,
        requiresHumanReview: false
      };

    } catch (error) {
      this.logger.error('Error handling conversational message:', error);
      throw error;
    }
  }

  private async handleUnknownIntent(
    content: string,
    context: ConversationContext,
    intent: IntentClassification
  ): Promise<MessageProcessingResult> {
    try {
      // Try to extract any useful information from the message
      const entities = intent.entities || {};
      
      if (entities.product || entities.medication) {
        // Try to route to catalog agent
        return await this.catalogAgent.processQuery(content, context, intent);
      }

      if (entities.order || entities.payment) {
        // Try to route to order agent
        return await this.orderAgent.processOrderRequest(content, context, intent);
      }

      // Ask for clarification
      return {
        success: true,
        response: 'I\'m not sure I understood your request. Could you please rephrase it or let me know if you need help with:\n• Product information and availability\n• Placing an order\n• Payment options\n• Delivery tracking\n• General support',
        requiresHumanReview: false
      };

    } catch (error) {
      this.logger.error('Error handling unknown intent:', error);
      throw error;
    }
  }

  private async getConversationContext(
    conversationId: string,
    phoneNumber: string
  ): Promise<ConversationContext> {
    try {
      // Get existing context from database
      const conversation = await this.conversationService.getConversationById(conversationId);
      
      if (conversation?.context) {
        return conversation.context as ConversationContext;
      }

      // Create new context with default values
      const context: ConversationContext = {
        pharmacyId: (await this.getPharmacyIdFromPhone(phoneNumber)) || 'default-pharmacy',
        customerId: (await this.getCustomerIdFromPhone(phoneNumber)) || 'default-customer',
        sessionData: {},
        requiresPrescription: false,
        prescriptionVerified: false
      };

      return context;

    } catch (error) {
      this.logger.error('Error getting conversation context:', error);
      return {};
    }
  }

  private async updateConversationContext(
    conversationId: string,
    context: ConversationContext
  ): Promise<void> {
    try {
      await this.conversationService.updateConversation(conversationId, {
        context: JSON.stringify(context),
        updated_at: new Date()
      });
    } catch (error) {
      this.logger.error('Error updating conversation context:', error);
    }
  }

  private async getPharmacyIdFromPhone(_phoneNumber: string): Promise<string | undefined> {
    try {
      // This would typically query the database to find pharmacy by phone number
      // For now, return undefined
      return undefined;
    } catch (error) {
      this.logger.error('Error getting pharmacy ID from phone:', error);
      return undefined;
    }
  }

  private async getCustomerIdFromPhone(_phoneNumber: string): Promise<string | undefined> {
    try {
      // This would typically query the database to find customer by phone number
      // For now, return undefined
      return undefined;
    } catch (error) {
      this.logger.error('Error getting customer ID from phone:', error);
      return undefined;
    }
  }

  private buildResponseFromRAG(searchResults: any[]): string {
    try {
      if (searchResults.length === 0) {
        return 'I couldn\'t find specific information about that. Let me connect you with our support team.';
      }

      const topResult = searchResults[0];
      let response = 'Based on your inquiry, here\'s what I found:\n\n';
      
      response += topResult.content || topResult.text || 'Information not available in the expected format.';
      
      if (searchResults.length > 1) {
        response += '\n\nI found additional information that might be helpful. Would you like me to share more details?';
      }

      return response;

    } catch (error) {
      this.logger.error('Error building response from RAG:', error);
      return 'I apologize, but I encountered an error while processing your request. Let me connect you with our support team.';
    }
  }

  private getGreetingResponse(context: ConversationContext): string {
    const timeOfDay = this.getTimeOfDay();
    const pharmacyName = context.pharmacyId ? 'your pharmacy' : 'MedSupply';
    
    return `Good ${timeOfDay}! Welcome to ${pharmacyName}. I\'m your AI assistant, ready to help you with:\n\n` +
           `• Product information and availability\n` +
           `• Placing orders\n` +
           `• Payment options\n` +
           `• Delivery tracking\n\n` +
           `How can I assist you today?`;
  }

  private getGoodbyeResponse(): string {
    return 'Thank you for choosing MedSupply! If you need anything else, feel free to message us anytime. Have a great day!';
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private async escalateToHuman(
    conversationId: string,
    context: ConversationContext,
    reason: string
  ): Promise<void> {
    try {
      this.logger.info('Escalating conversation to human', {
        conversationId,
        reason,
        context
      });

      // Update conversation status
      await this.conversationService.updateConversation(conversationId, {
        status: 'escalated',
        escalation_reason: reason,
        escalated_at: new Date()
      });

      // Send escalation notification to human agents
      // This would typically emit an event or send a notification
      await this.notifyHumanAgents(conversationId, reason, context);

    } catch (error) {
      this.logger.error('Error escalating to human:', error);
    }
  }

  private async notifyHumanAgents(
    conversationId: string,
    reason: string,
    context: ConversationContext
  ): Promise<void> {
    try {
      // This would typically send a notification to human agents
      // For now, just log the escalation
      this.logger.info('Human escalation notification', {
        conversationId,
        reason,
        context,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error notifying human agents:', error);
    }
  }

  public async getConversationState(conversationId: string): Promise<ConversationState> {
    try {
      const conversation = await this.conversationService.getConversationById(conversationId);
      
      if (!conversation) {
        return { status: 'not_found' };
      }

      return {
        status: conversation.status || 'active',
        context: conversation.context as ConversationContext,
        lastMessageAt: conversation.updatedAt,
        messageCount: await this.messageService.getMessageCount(conversationId),
        requiresHumanReview: conversation.status === 'escalated'
      };

    } catch (error) {
      this.logger.error('Error getting conversation state:', error);
      return { status: 'error' };
    }
  }

  public async close(): Promise<void> {
    try {
      this.logger.info('Closing agent orchestrator...');
      
      // Close all agents
      await Promise.all([
        this.ragService.close()
      ]);

      this.logger.info('Agent orchestrator closed successfully');
    } catch (error) {
      this.logger.error('Error closing agent orchestrator:', error);
      throw error;
    }
  }
}
