// import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: any = {
  openapi: '3.0.0',
  info: {
    title: 'MedSupply-WA API',
    version: '1.0.0',
    description: 'WhatsApp-powered pharmacy wholesale management system with AI-driven customer interactions',
    contact: {
      name: 'DARA-Medics Team',
      email: 'support@dara-medics.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.dara-medics.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          code: {
            type: 'string',
            example: 'ERROR_CODE'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          path: {
            type: 'string',
            example: '/api/v1/orders'
          },
          method: {
            type: 'string',
            example: 'POST'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation successful'
          },
          data: {
            type: 'object'
          }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'order-123'
          },
          order_number: {
            type: 'string',
            example: 'MS-1234567890'
          },
          pharmacy_id: {
            type: 'string',
            example: 'pharmacy-123'
          },
          customer_id: {
            type: 'string',
            example: 'customer-123'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            example: 'pending'
          },
          order_type: {
            type: 'string',
            enum: ['wholesale', 'retail', 'prescription'],
            example: 'wholesale'
          },
          total_amount: {
            type: 'number',
            example: 150.00
          },
          payment_status: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded'],
            example: 'pending'
          },
          delivery_method: {
            type: 'string',
            enum: ['pickup', 'delivery', 'shipping'],
            example: 'delivery'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'item-123'
          },
          order_id: {
            type: 'string',
            example: 'order-123'
          },
          product_id: {
            type: 'string',
            example: 'product-123'
          },
          quantity: {
            type: 'number',
            example: 5
          },
          unit_price: {
            type: 'number',
            example: 30.00
          },
          total_price: {
            type: 'number',
            example: 150.00
          },
          requires_prescription: {
            type: 'boolean',
            example: false
          },
          prescription_verified: {
            type: 'boolean',
            example: false
          }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'payment-123'
          },
          order_id: {
            type: 'string',
            example: 'order-123'
          },
          amount: {
            type: 'number',
            example: 150.00
          },
          method: {
            type: 'string',
            enum: ['mpesa', 'airtel_money', 'tigo_pesa', 'cash', 'bank_transfer'],
            example: 'mpesa'
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            example: 'pending'
          },
          transaction_id: {
            type: 'string',
            example: 'TXN-1234567890'
          },
          phone_number: {
            type: 'string',
            example: '+1234567890'
          },
          customer_name: {
            type: 'string',
            example: 'John Doe'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'product-123'
          },
          name: {
            type: 'string',
            example: 'Paracetamol 500mg'
          },
          description: {
            type: 'string',
            example: 'Pain relief medication'
          },
          category: {
            type: 'string',
            example: 'Pain Relief'
          },
          sku: {
            type: 'string',
            example: 'PAR-500-001'
          },
          unit_price: {
            type: 'number',
            example: 30.00
          },
          wholesale_price: {
            type: 'number',
            example: 25.00
          },
          stock_quantity: {
            type: 'number',
            example: 100
          },
          requires_prescription: {
            type: 'boolean',
            example: false
          },
          manufacturer: {
            type: 'string',
            example: 'PharmaCorp'
          },
          active: {
            type: 'boolean',
            example: true
          }
        }
      },
      Conversation: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'conv-123'
          },
          customer_id: {
            type: 'string',
            example: 'customer-123'
          },
          pharmacy_id: {
            type: 'string',
            example: 'pharmacy-123'
          },
          phone_number: {
            type: 'string',
            example: '+1234567890'
          },
          status: {
            type: 'string',
            enum: ['active', 'closed', 'escalated'],
            example: 'active'
          },
          last_message_at: {
            type: 'string',
            format: 'date-time'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Message: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'msg-123'
          },
          conversation_id: {
            type: 'string',
            example: 'conv-123'
          },
          message_id: {
            type: 'string',
            example: 'whatsapp-msg-123'
          },
          direction: {
            type: 'string',
            enum: ['inbound', 'outbound'],
            example: 'inbound'
          },
          type: {
            type: 'string',
            enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'contact', 'sticker', 'button', 'interactive'],
            example: 'text'
          },
          content: {
            type: 'string',
            example: 'Hello, I need to order some medication'
          },
          processed: {
            type: 'boolean',
            example: true
          },
          agent_processed: {
            type: 'boolean',
            example: true
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      SystemHealth: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            example: 'healthy'
          },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                enum: ['up', 'down'],
                example: 'up'
              },
              llm: {
                type: 'string',
                enum: ['up', 'down'],
                example: 'up'
              },
              whatsapp: {
                type: 'string',
                enum: ['up', 'down'],
                example: 'up'
              },
              rag: {
                type: 'string',
                enum: ['up', 'down'],
                example: 'up'
              }
            }
          },
          metrics: {
            type: 'object',
            properties: {
              uptime: {
                type: 'number',
                example: 86400000
              },
              memoryUsage: {
                type: 'number',
                example: 0.75
              },
              cpuUsage: {
                type: 'number',
                example: 0.25
              },
              activeConnections: {
                type: 'number',
                example: 10
              },
              errorRate: {
                type: 'number',
                example: 0.02
              }
            }
          },
          lastChecked: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'System health and monitoring endpoints'
    },
    {
      name: 'Orders',
      description: 'Order management endpoints'
    },
    {
      name: 'Payments',
      description: 'Payment processing endpoints'
    },
    {
      name: 'Products',
      description: 'Product catalog endpoints'
    },
    {
      name: 'Conversations',
      description: 'WhatsApp conversation management'
    },
    {
      name: 'Messages',
      description: 'Message handling endpoints'
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints'
    },
    {
      name: 'WhatsApp',
      description: 'WhatsApp webhook and integration'
    }
  ]
};

export default swaggerDefinition;
