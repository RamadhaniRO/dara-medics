import OpenAI from 'openai';
import { LoggerService } from '../logger/logger.service';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  embeddingModel: string;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private logger: LoggerService;
  private model: string;
  private embeddingModel: string;
  private isMockMode: boolean = false;

  constructor(config: OpenAIConfig | null, logger: LoggerService) {
    this.logger = logger;
    
    if (config && config.apiKey && config.model) {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
      this.model = config.model;
      this.embeddingModel = config.embeddingModel || 'text-embedding-ada-002';
    } else {
      this.logger.warn('OpenAI configuration not provided, running in mock mode');
      this.isMockMode = true;
      this.model = 'gpt-3.5-turbo';
      this.embeddingModel = 'text-embedding-ada-002';
    }
  }

  public async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isMockMode) {
      this.logger.info('Mock OpenAI text generation', { prompt: prompt.substring(0, 100) });
      return `Mock OpenAI response to: ${prompt.substring(0, 50)}...`;
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      });
      
      const generatedText = response.choices[0]?.message?.content || '';
      this.logger.info('OpenAI text generation successful', { prompt: prompt.substring(0, 100) });
      return generatedText;
    } catch (error) {
      this.logger.error('OpenAI text generation failed', { error, prompt: prompt.substring(0, 100) });
      throw error;
    }
  }

  public async classifyText(text: string, labels: string[]): Promise<{ label: string; score: number }[]> {
    if (this.isMockMode) {
      this.logger.info('Mock OpenAI text classification', { text: text.substring(0, 100) });
      return [{ label: 'mock-label', score: 0.95 }];
    }

    try {
      const prompt = `Classify the following text into one of these categories: ${labels.join(', ')}. 
      Text: "${text}"
      
      Respond with only the category name and a confidence score (0-1) in this format:
      Category: [category]
      Confidence: [score]`;

      const response = await this.generateText(prompt);
      
      // Parse the response
      const lines = response.split('\n');
      let label = 'unknown';
      let score = 0.5;
      
      for (const line of lines) {
        if (line.toLowerCase().includes('category:')) {
          label = line.split(':')[1]?.trim() || 'unknown';
        }
        if (line.toLowerCase().includes('confidence:')) {
          score = parseFloat(line.split(':')[1]?.trim()) || 0.5;
        }
      }
      
      this.logger.info('OpenAI text classification successful', { text: text.substring(0, 100) });
      return [{ label, score }];
    } catch (error) {
      this.logger.error('OpenAI text classification failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async generateEmbeddings(text: string): Promise<number[]> {
    if (this.isMockMode) {
      this.logger.info('Mock OpenAI embeddings generation', { textLength: text.length });
      return Array.from({ length: 1536 }, () => Math.random());
    }

    try {
      const response = await this.client!.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      const embeddings = response.data[0]?.embedding || [];
      this.logger.info('OpenAI embeddings generation successful', { textLength: text.length });
      return embeddings;
    } catch (error) {
      this.logger.error('OpenAI embeddings generation failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    try {
      await this.testConnection();
      this.logger.info('OpenAI service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.info('Mock OpenAI connection test successful');
      return true;
    }

    try {
      await this.generateText('Test connection');
      return true;
    } catch (error) {
      this.logger.error('OpenAI connection test failed', { error });
      return false;
    }
  }
}
