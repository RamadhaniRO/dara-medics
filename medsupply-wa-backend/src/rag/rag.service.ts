import { LoggerService } from '../core/logger/logger.service';
import { LLMService } from '../core/llm/llm.service';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  generic_name?: string;
  description?: string;
  active_ingredients?: string;
  strength?: string;
  dosage_form?: string;
  pack_size?: string;
  category?: string;
  indications?: string;
  manufacturer?: string;
  country_of_origin?: string;
  therapeutic_class?: string;
  atc_code?: string;
  prescription_required?: boolean;
  wholesale_price?: number;
  status?: string;
}

export interface SearchResult {
  id: string;
  content: string;
  text?: string;
  metadata: any;
  score: number;
  source: string;
  type: 'product' | 'documentation' | 'regulation' | 'faq';
}

export interface RAGConfiguration {
  embeddingModel: string;
  maxResults: number;
  similarityThreshold: number;
  enableHybridSearch: boolean;
}

export class RAGService {
  private logger: LoggerService;
  private llmService: LLMService;
  private config: RAGConfiguration;
  private isInitialized: boolean = false;
  private productIndex: Map<string, { content: string; metadata: any; embedding: number[] }> = new Map();

  constructor() {
    this.logger = new LoggerService();
    this.config = this.loadConfiguration();
    
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
    
    this.llmService = new LLMService(llmConfig, this.logger);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing RAG service...');

      // Initialize LLM service
      await this.llmService.initialize();

      this.isInitialized = true;
      this.logger.info('RAG service initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize RAG service:', error);
      throw error;
    }
  }

  public async search(
    query: string, 
    limit: number = 5, 
    filters?: any,
    searchType: 'semantic' | 'hybrid' | 'keyword' = 'semantic'
  ): Promise<SearchResult[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('RAG service not initialized');
      }

      this.logger.info('Performing RAG search', { 
        query: query.substring(0, 100) + '...',
        limit,
        searchType,
        filters 
      });

      // Generate query embedding
      const queryEmbedding = await this.llmService.generateEmbeddings(query);

      // Search through indexed products
      const results = await this.searchProducts(queryEmbedding, query, limit, filters);

      this.logger.info('RAG search completed', { 
        queryCount: results.length,
        topScore: results[0]?.score 
      });

      return results;

    } catch (error) {
      this.logger.error('Error performing RAG search:', error);
      throw error;
    }
  }

  private async searchProducts(
    queryEmbedding: number[],
    _query: string,
    limit: number,
    filters?: any
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const [id, product] of this.productIndex) {
      // Apply filters if provided
      if (filters && !this.matchesFilters(product.metadata, filters)) {
        continue;
      }

      // Calculate similarity score
      const similarity = this.calculateCosineSimilarity(queryEmbedding, product.embedding);
      
      if (similarity >= this.config.similarityThreshold) {
        results.push({
          id,
          content: product.content,
          metadata: product.metadata,
          score: similarity,
          source: 'product_catalog',
          type: 'product'
        });
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private matchesFilters(metadata: any, filters: any): boolean {
    if (filters.category && metadata.category !== filters.category) {
      return false;
    }

    if (filters.inStock !== undefined && metadata.in_stock !== filters.inStock) {
      return false;
    }

    if (filters.requiresPrescription !== undefined && metadata.prescription_required !== filters.requiresPrescription) {
      return false;
    }

    if (filters.priceRange) {
      const price = metadata.wholesale_price;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }
    }

    return true;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.llmService.generateEmbeddings(text);
    return response;
  }

  public async addProduct(product: Product): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('RAG service not initialized');
      }

      this.logger.info('Adding product to RAG index', { 
        productId: product.id,
        productName: product.name 
      });

      // Generate product content for embedding
      const productContent = this.generateProductContent(product);
      
      // Generate embedding
      const embedding = await this.generateEmbedding(productContent);

      // Add to in-memory index
      this.productIndex.set(product.id, {
        content: productContent,
        metadata: {
          name: product.name,
          brand: product.brand,
          generic_name: product.generic_name,
          category: product.category,
          dosage_form: product.dosage_form,
          strength: product.strength,
          pack_size: product.pack_size,
          prescription_required: product.prescription_required,
          wholesale_price: product.wholesale_price,
          in_stock: product.status === 'active',
          source: 'product_catalog',
          type: 'product'
        },
        embedding
      });

      this.logger.info('Product added to RAG index successfully', { 
        productId: product.id 
      });

    } catch (error) {
      this.logger.error('Error adding product to RAG index:', error);
      throw error;
    }
  }

  public async updateProduct(product: Product): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('RAG service not initialized');
      }

      this.logger.info('Updating product in RAG index', { 
        productId: product.id 
      });

      // Remove existing product
      this.productIndex.delete(product.id);

      // Add updated product
      await this.addProduct(product);

      this.logger.info('Product updated in RAG index successfully', { 
        productId: product.id 
      });

    } catch (error) {
      this.logger.error('Error updating product in RAG index:', error);
      throw error;
    }
  }

  public async removeProduct(productId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('RAG service not initialized');
      }

      this.logger.info('Removing product from RAG index', { productId });

      this.productIndex.delete(productId);

      this.logger.info('Product removed from RAG index successfully', { productId });

    } catch (error) {
      this.logger.error('Error removing product from RAG index:', error);
      throw error;
    }
  }

  public async addDocument(
    content: string,
    metadata: any,
    documentType: string = 'documentation'
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('RAG service not initialized');
      }

      this.logger.info('Adding document to RAG index', { 
        type: documentType,
        contentLength: content.length 
      });

      // Generate embedding
      const embedding = await this.generateEmbedding(content);

      // Add to in-memory index with unique ID
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.productIndex.set(documentId, {
        content,
        metadata: {
          ...metadata,
          source: 'documentation',
          type: documentType,
          added_at: new Date().toISOString()
        },
        embedding
      });

      this.logger.info('Document added to RAG index successfully', { type: documentType });

    } catch (error) {
      this.logger.error('Error adding document to RAG index:', error);
      throw error;
    }
  }

  private generateProductContent(product: Product): string {
    const parts = [
      product.name,
      product.brand,
      product.generic_name,
      product.description,
      product.active_ingredients,
      product.strength,
      product.dosage_form,
      product.pack_size,
      product.category,
      product.indications,
      product.manufacturer,
      product.country_of_origin,
      product.therapeutic_class,
      product.atc_code
    ].filter(Boolean);

    return parts.join(' ').toLowerCase();
  }

  private loadConfiguration(): RAGConfiguration {
    return {
      embeddingModel: process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
      maxResults: parseInt(process.env.RAG_MAX_RESULTS || '10', 10),
      similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.7'),
      enableHybridSearch: process.env.RAG_ENABLE_HYBRID === 'true'
    };
  }

  public async getServiceHealth(): Promise<{
    isHealthy: boolean;
    embeddingsWorking: boolean;
    indexedProducts: number;
    lastError: string | undefined;
  }> {
    try {
      const embeddingsWorking = await this.llmService.generateEmbeddings('test').then(() => true).catch(() => false);
      const indexedProducts = this.productIndex.size;

      return {
        isHealthy: embeddingsWorking,
        embeddingsWorking,
        indexedProducts,
        lastError: embeddingsWorking ? undefined : 'Embeddings service not working'
      };
    } catch (error) {
      return {
        isHealthy: false,
        embeddingsWorking: false,
        indexedProducts: 0,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async close(): Promise<void> {
    try {
      this.logger.info('Closing RAG service...');
      
      // Clear the index
      this.productIndex.clear();
      
      this.isInitialized = false;
      this.logger.info('RAG service closed');
    } catch (error) {
      this.logger.error('Error closing RAG service:', error);
      throw error;
    }
  }
}
