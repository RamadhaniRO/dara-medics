export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export class CatalogAgent {
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
  }

  public async searchProducts(query: string): Promise<CatalogItem[]> {
    try {
      // Mock product search
      const mockProducts: CatalogItem[] = [
        {
          id: '1',
          name: 'Paracetamol 500mg',
          description: 'Pain relief tablets',
          price: 5.99,
          category: 'Pain Relief',
          inStock: true
        },
        {
          id: '2',
          name: 'Amoxicillin 250mg',
          description: 'Antibiotic capsules',
          price: 12.50,
          category: 'Antibiotics',
          inStock: true
        }
      ];

      return mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      this.logger.error('Product search failed', { error, query });
      return [];
    }
  }

  public async processQuery(content: string, _context: any, _intent: any): Promise<any> {
    try {
      // Extract product search from content
      const products = await this.searchProducts(content);
      
      if (products.length > 0) {
        return {
          success: true,
          response: `I found ${products.length} products matching your query. Here are the top results:\n\n${products.map(p => `• ${p.name} - $${p.price} (${p.category})`).join('\n')}`,
          requiresHumanReview: false
        };
      } else {
        return {
          success: true,
          response: 'I couldn\'t find any products matching your query. Could you please provide more details or try a different search term?',
          requiresHumanReview: false
        };
      }
    } catch (error) {
      this.logger.error('Process query failed', { error, content });
      return {
        success: false,
        response: 'I encountered an error while searching for products. Please try again.',
        requiresHumanReview: true
      };
    }
  }
}
