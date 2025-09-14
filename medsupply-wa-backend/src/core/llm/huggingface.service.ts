import { HfInference } from '@huggingface/inference';
import { LoggerService } from '../logger/logger.service';

export interface HuggingFaceConfig {
  apiKey: string;
  model: string;
}

export class HuggingFaceService {
  private client: HfInference | null = null;
  private logger: LoggerService;
  private model: string;
  private isMockMode: boolean = false;

  constructor(config: HuggingFaceConfig | null, logger: LoggerService) {
    this.logger = logger;
    
    if (config && config.apiKey && config.model) {
      this.client = new HfInference(config.apiKey);
      this.model = config.model;
    } else {
      this.logger.warn('HuggingFace configuration not provided, running in mock mode');
      this.isMockMode = true;
      this.model = 'mock-model';
    }
  }

  public async generateText(prompt: string): Promise<string> {
    if (this.isMockMode) {
      this.logger.info('Mock text generation', { prompt: prompt.substring(0, 100) });
      return `Mock response to: ${prompt.substring(0, 50)}...`;
    }

    try {
      const response = await this.client!.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        },
      });
      
      this.logger.info('Text generation successful', { prompt: prompt.substring(0, 100) });
      return response.generated_text;
    } catch (error) {
      this.logger.error('Text generation failed', { error, prompt: prompt.substring(0, 100) });
      throw error;
    }
  }

  public async classifyText(text: string, _labels: string[]): Promise<{ label: string; score: number }[]> {
    if (this.isMockMode) {
      this.logger.info('Mock text classification', { text: text.substring(0, 100) });
      return [{ label: 'mock-label', score: 0.95 }];
    }

    try {
      const response = await this.client!.textClassification({
        model: this.model,
        inputs: text,
      });
      
      this.logger.info('Text classification successful', { text: text.substring(0, 100) });
      return response;
    } catch (error) {
      this.logger.error('Text classification failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    try {
      await this.testConnection();
      this.logger.info('HuggingFace service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize HuggingFace service:', error);
      throw error;
    }
  }

  public async generateEmbeddings(text: string): Promise<number[]> {
    if (this.isMockMode) {
      this.logger.info('Mock embeddings generation', { textLength: text.length });
      return Array.from({ length: 768 }, () => Math.random());
    }

    try {
      const response = await this.client!.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
      });
      
      this.logger.info('Embeddings generated successfully', { textLength: text.length });
      return response as number[];
    } catch (error) {
      this.logger.error('Embeddings generation failed', { error, text: text.substring(0, 100) });
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.info('Mock HuggingFace connection test successful');
      return true;
    }

    try {
      await this.generateText('Test connection');
      return true;
    } catch (error) {
      this.logger.error('HuggingFace connection test failed', { error });
      return false;
    }
  }
}
