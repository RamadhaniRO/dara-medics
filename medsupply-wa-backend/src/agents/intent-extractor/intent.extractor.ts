import { LLMService } from '../../core/llm/llm.service';

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export class IntentExtractor {
  private logger: any;
  private llmService: LLMService;

  constructor(logger: any, llmService?: LLMService) {
    this.logger = logger;
    
    // Initialize LLM service
    const llmConfig = {
      provider: (process.env.LLM_PROVIDER as 'openai' | 'huggingface') || 'huggingface',
      openai: process.env.OPENAI_API_KEY ? {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002'
      } : undefined,
      huggingface: process.env.HUGGINGFACE_API_KEY ? {
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium'
      } : undefined
    };
    
    this.llmService = llmService || new LLMService(llmConfig, logger);
  }

  public async extractIntent(text: string): Promise<IntentClassification> {
    try {
      // Define possible intents for pharmacy wholesale
      const intents = [
        'product_search',
        'catalog_query', 
        'stock_check',
        'price_inquiry',
        'place_order',
        'add_to_cart',
        'modify_order',
        'order_status',
        'prescription_upload',
        'prescription_verification',
        'compliance_check',
        'delivery_inquiry',
        'tracking_request',
        'delivery_update',
        'payment_inquiry',
        'payment_method',
        'payment_status',
        'general_inquiry',
        'help_request',
        'complaint',
        'greeting',
        'goodbye'
      ];

      // Use LLM for intent classification if available
      if (!this.llmService.isMock()) {
        try {
          const systemPrompt = `You are an intent classification system for a pharmacy wholesale WhatsApp bot. 
          Classify the user's message into one of these intents: ${intents.join(', ')}.
          
          Return only the intent name and confidence score (0-1) in this format:
          Intent: [intent_name]
          Confidence: [score]`;

          const response = await this.llmService.generateText(text, systemPrompt);
          
          // Parse the response
          const lines = response.split('\n');
          let intent = 'general_inquiry';
          let confidence = 0.5;
          
          for (const line of lines) {
            if (line.toLowerCase().includes('intent:')) {
              const extractedIntent = line.split(':')[1]?.trim();
              if (intents.includes(extractedIntent)) {
                intent = extractedIntent;
              }
            }
            if (line.toLowerCase().includes('confidence:')) {
              confidence = parseFloat(line.split(':')[1]?.trim()) || 0.5;
            }
          }
          
          return {
            intent,
            confidence,
            entities: { originalText: text }
          };
        } catch (llmError) {
          this.logger.warn('LLM intent extraction failed, falling back to rule-based', { llmError });
        }
      }

      // Fallback to rule-based intent extraction
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('order') || lowerText.includes('buy') || lowerText.includes('purchase')) {
        return {
          intent: 'place_order',
          confidence: 0.8,
          entities: { action: 'order' }
        };
      }
      
      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
        return {
          intent: 'price_inquiry',
          confidence: 0.7,
          entities: { action: 'pricing' }
        };
      }
      
      if (lowerText.includes('delivery') || lowerText.includes('shipping') || lowerText.includes('when')) {
        return {
          intent: 'delivery_inquiry',
          confidence: 0.6,
          entities: { action: 'delivery' }
        };
      }
      
      if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        return {
          intent: 'greeting',
          confidence: 0.8,
          entities: {}
        };
      }
      
      return {
        intent: 'general_inquiry',
        confidence: 0.5,
        entities: {}
      };
    } catch (error) {
      this.logger.error('Intent extraction failed', { error, text });
      return {
        intent: 'unknown',
        confidence: 0.0,
        entities: {}
      };
    }
  }
}
