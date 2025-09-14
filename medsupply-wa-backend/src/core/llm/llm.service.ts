import { LoggerService } from '../logger/logger.service';
import { HuggingFaceService, HuggingFaceConfig } from './huggingface.service';
import { OpenAIService, OpenAIConfig } from './openai.service';

export interface LLMConfig {
  provider: 'openai' | 'huggingface';
  openai?: OpenAIConfig;
  huggingface?: HuggingFaceConfig;
}

export class LLMService {
  private logger: LoggerService;
  private huggingfaceService: HuggingFaceService | null = null;
  private openaiService: OpenAIService | null = null;
  private provider: 'openai' | 'huggingface';
  private isMockMode: boolean = false;

  constructor(config: LLMConfig | null, logger: LoggerService) {
    this.logger = logger;
    
    if (config && config.provider) {
      this.provider = config.provider;
      
      if (config.provider === 'openai' && config.openai) {
        this.openaiService = new OpenAIService(config.openai, logger);
      } else if (config.provider === 'huggingface' && config.huggingface) {
        this.huggingfaceService = new HuggingFaceService(config.huggingface, logger);
      } else {
        this.logger.warn('LLM configuration incomplete, running in mock mode');
        this.isMockMode = true;
      }
    } else {
      this.logger.warn('LLM configuration not provided, running in mock mode');
      this.isMockMode = true;
      this.provider = 'huggingface';
    }
  }

  public async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isMockMode) {
      this.logger.info('Mock LLM text generation', { prompt: prompt.substring(0, 100) });
      return `Mock LLM response to: ${prompt.substring(0, 50)}...`;
    }

    try {
      if (this.provider === 'openai' && this.openaiService) {
        return await this.openaiService.generateText(prompt, systemPrompt);
      } else if (this.provider === 'huggingface' && this.huggingfaceService) {
        return await this.huggingfaceService.generateText(prompt);
      } else {
        throw new Error('No LLM service available');
      }
    } catch (error) {
      this.logger.error('LLM text generation failed', { error, prompt: prompt.substring(0, 100) });
      throw error;
    }
  }

  public async classifyText(text: string, labels: string[]): Promise<{ label: string; score: number }[]> {
    if (this.isMockMode) {
      this.logger.info('Mock LLM text classification', { text: text.substring(0, 100) });
      return [{ label: 'mock-label', score: 0.95 }];
    }

    try {
      if (this.provider === 'openai' && this.openaiService) {
        return await this.openaiService.classifyText(text, labels);
      } else if (this.provider === 'huggingface' && this.huggingfaceService) {
        return await this.huggingfaceService.classifyText(text, labels);
      } else {
        throw new Error('No LLM service available');
      }
    } catch (error) {
      this.logger.error('LLM text classification failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async generateEmbeddings(text: string): Promise<number[]> {
    if (this.isMockMode) {
      this.logger.info('Mock LLM embeddings generation', { textLength: text.length });
      return Array.from({ length: 768 }, () => Math.random());
    }

    try {
      if (this.provider === 'openai' && this.openaiService) {
        return await this.openaiService.generateEmbeddings(text);
      } else if (this.provider === 'huggingface' && this.huggingfaceService) {
        return await this.huggingfaceService.generateEmbeddings(text);
      } else {
        throw new Error('No LLM service available');
      }
    } catch (error) {
      this.logger.error('LLM embeddings generation failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    try {
      if (this.provider === 'openai' && this.openaiService) {
        await this.openaiService.initialize();
      } else if (this.provider === 'huggingface' && this.huggingfaceService) {
        await this.huggingfaceService.initialize();
      }
      
      this.logger.info('LLM service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize LLM service:', error);
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.info('Mock LLM connection test successful');
      return true;
    }

    try {
      if (this.provider === 'openai' && this.openaiService) {
        return await this.openaiService.testConnection();
      } else if (this.provider === 'huggingface' && this.huggingfaceService) {
        return await this.huggingfaceService.testConnection();
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error('LLM connection test failed', { error });
      return false;
    }
  }

  public getProvider(): string {
    return this.provider;
  }

  public isMock(): boolean {
    return this.isMockMode;
  }
}
