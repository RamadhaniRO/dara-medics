# MedSupply-WA: WhatsApp SaaS for Pharmacy Wholesale

**Smart WhatsApp ordering system powered by LLM agents for pharmaceutical wholesale operations.**

## 🚀 Executive Summary

MedSupply-WA transforms pharmacy ordering by providing a fully-automated WhatsApp experience backed by intelligent LLM agents. Pharmacies can order medicines, check inventory, make payments, and track deliveries - all through familiar WhatsApp conversations, with human backup for complex cases.

## ✨ Key Features

- **🤖 LLM Agent-Driven**: Intelligent agents handle orders, inventory checks, and customer service
- **📱 WhatsApp Integration**: Familiar interface via WhatsApp Business API
- **💊 Smart Catalog**: RAG-powered product search with synonyms and dose parsing
- **💳 Mobile Money Payments**: Mpesa, Airtel Money, Tigo Pesa integration
- **📋 Automated Compliance**: Prescription verification and regulatory adherence
- **📊 Real-time Analytics**: Order tracking and business intelligence

## 🏗️ Architecture

```
[WhatsApp Business API] ↔ [Messaging Gateway] ↔ [Orchestrator]
                                    ↓
                            [LLM Agents Layer]
                                    ↓
                    [RAG System] + [Order Service] + [Payments]
                                    ↓
                            [Warehouse/Logistics]
```

### Core Components

1. **WhatsApp Service**: Handles webhook processing and message sending
2. **Agent Orchestrator**: Routes messages to appropriate specialized agents
3. **RAG Service**: Vector database for semantic product search
4. **Order Service**: Manages order lifecycle and inventory
5. **Payment Service**: Handles mobile money integrations
6. **Compliance Agent**: Manages prescription verification and regulatory checks

## 🛠️ Tech Stack

- **Backend**: Node.js/Express with TypeScript
- **LLM**: Open-source models (Llama, Mistral) via Ollama
- **Vector DB**: Weaviate for RAG system
- **Database**: PostgreSQL for transactional data
- **WhatsApp**: Meta Cloud API integration
- **Payments**: Mobile money APIs (Mpesa, Airtel, Tigo)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+
- Ollama (for local LLM) or OpenAI API key
- Weaviate instance
- WhatsApp Business API credentials

### 1. Clone and Setup

```bash
git clone <repository>
cd dara_medics
npm install
```

### 2. Environment Configuration

```bash
cp env.example .env
# Configure your environment variables
```

Key environment variables:
- `WHATSAPP_ACCESS_TOKEN`: Your WhatsApp Business API token
- `DATABASE_URL`: PostgreSQL connection string
- `WEAVIATE_URL`: Weaviate instance URL
- `OLLAMA_BASE_URL`: Ollama service URL (if using local LLM)

### 3. Database Setup

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Services

```bash
npm run dev          # Development mode
npm run start        # Production mode
```

## 📁 Project Structure

```
├── src/
│   ├── agents/              # LLM agent implementations
│   │   ├── orchestrator/    # Main agent coordinator
│   │   ├── catalog/         # Product search agent
│   │   ├── order/           # Order processing agent
│   │   ├── compliance/      # Regulatory compliance agent
│   │   └── fulfillment/     # Delivery tracking agent
│   ├── api/                 # REST API endpoints
│   ├── core/                # Core services (DB, Redis, Logger)
│   ├── entities/            # Database entities/models
│   ├── messaging/           # WhatsApp integration
│   ├── rag/                 # RAG system and vector DB
│   ├── services/            # Business services
│   └── utils/               # Utilities and helpers
├── config/                  # Configuration files
├── scripts/                 # Database and setup scripts
└── tests/                   # Test suite
```

## 🤖 LLM Agent System

### Agent Types

1. **Intent Extractor**: Classifies user messages and extracts entities
2. **Catalog Agent**: Handles product searches and inventory queries
3. **Order Agent**: Manages order creation, modification, and status
4. **Compliance Agent**: Verifies prescriptions and regulatory requirements
5. **Fulfillment Agent**: Tracks deliveries and manages logistics

### Agent Capabilities

- **Natural Language Understanding**: Processes conversational queries
- **Context Awareness**: Maintains conversation state and history
- **RAG Integration**: Grounds responses in verified product data
- **Human Escalation**: Automatically escalates complex cases
- **Audit Trail**: Logs all decisions and actions

## 💊 Product Catalog & RAG

### Vector Database Schema

- **Product Embeddings**: Generated from name, description, ingredients, etc.
- **Semantic Search**: Finds products by similarity, not just exact matches
- **Filtering**: Category, dosage form, prescription requirements, etc.
- **Synonyms**: Handles brand names, generic names, and common terms

### Search Features

- **Fuzzy Matching**: Handles typos and variations
- **Dose Parsing**: Understands strength and quantity specifications
- **Alternative Suggestions**: Recommends equivalent products
- **Stock Integration**: Real-time availability information

## 📱 WhatsApp Integration

### Message Types Supported

- **Text Messages**: Natural language queries
- **Images**: Prescription uploads
- **Documents**: Medical certificates, etc.
- **Interactive Messages**: Quick reply buttons and lists
- **Templates**: Structured notifications

### Conversation Flow

1. **Greeting**: Welcome message with available services
2. **Intent Detection**: Classify user request
3. **Agent Processing**: Route to specialized agent
4. **Response Generation**: Generate appropriate response
5. **Follow-up**: Handle additional questions or actions

## 💳 Payment Integration

### Supported Methods

- **M-Pesa**: Kenya's leading mobile money service
- **Airtel Money**: Pan-African mobile money
- **Tigo Pesa**: Tanzanian mobile money service
- **Card Payments**: Credit/debit card support
- **Cash on Delivery**: Traditional payment method

### Payment Flow

1. **Order Confirmation**: Calculate total with taxes and delivery
2. **Payment Link**: Generate secure payment link
3. **Callback Processing**: Handle payment confirmations
4. **Order Fulfillment**: Trigger delivery process

## 🔒 Security & Compliance

### Data Protection

- **Encryption**: All data encrypted at rest and in transit
- **PII Handling**: Secure processing of personal information
- **Audit Logging**: Complete trail of all system actions
- **Access Control**: Role-based permissions and authentication

### Regulatory Compliance

- **Prescription Verification**: Automated and manual review processes
- **Drug Classification**: Controlled substance handling
- **Age Verification**: Compliance with age restrictions
- **Quantity Limits**: Prevents abuse and diversion

## 📊 Monitoring & Analytics

### Key Metrics

- **Response Time**: < 3s for queries, < 10s for orders
- **Accuracy**: ≥99% for product identification
- **Availability**: 99.5% uptime target
- **Human Escalation**: < 5% of conversations

### Monitoring Tools

- **Application Logs**: Structured logging with Winston
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Comprehensive error logging and alerting
- **Business Analytics**: Order volumes, popular products, etc.

## 🧪 Testing

### Test Types

```bash
npm run test           # Run all tests
npm run test:agents    # Test LLM agents
npm run test:api       # Test API endpoints
npm run test:e2e       # End-to-end tests
npm run test:whatsapp  # WhatsApp integration tests
```

### Test Coverage

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **API Tests**: Endpoint functionality testing
- **Agent Tests**: LLM agent behavior testing
- **E2E Tests**: Complete user journey testing

## 🚀 Deployment

### Production Setup

1. **Environment**: Configure production environment variables
2. **Database**: Set up production PostgreSQL with proper backups
3. **Vector DB**: Deploy Weaviate with appropriate resources
4. **LLM Service**: Configure production LLM endpoint
5. **WhatsApp**: Verify webhook URLs and credentials
6. **Monitoring**: Set up logging and alerting

### Scaling Considerations

- **Horizontal Scaling**: Multiple application instances
- **Database Scaling**: Read replicas and connection pooling
- **Vector DB**: Distributed Weaviate cluster
- **Caching**: Redis for session and query caching
- **Load Balancing**: Distribute WhatsApp webhook load

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_id

# LLM
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434

# Vector Database
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your_key

# Payments
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
```

## 📚 API Documentation

### Core Endpoints

- `POST /webhook/whatsapp` - WhatsApp webhook handler
- `GET /health` - System health check
- `GET /api/v1/orders` - Order management
- `GET /api/v1/products` - Product catalog
- `POST /api/v1/payments` - Payment processing

### Webhook Payloads

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "123456789",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "+1234567890",
          "phone_number_id": "987654321"
        },
        "messages": [{
          "from": "1234567890",
          "id": "msg_123",
          "timestamp": "1234567890",
          "type": "text",
          "text": {
            "body": "Hello, I need Amoxicillin 500mg"
          }
        }]
      }
    }]
  }]
}
```

## 🛣️ Roadmap

### Phase 1 (MVP) - ✅ Complete
- [x] WhatsApp integration
- [x] Basic LLM agents
- [x] Product catalog
- [x] Order management
- [x] Payment integration

### Phase 2 (Q2 2024)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced prescription verification
- [ ] Inventory forecasting
- [ ] Supplier integration

### Phase 3 (Q3 2024)
- [ ] Mobile app for staff
- [ ] Advanced reporting
- [ ] Machine learning optimization
- [ ] API marketplace
- [ ] White-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the established code style
- Add proper error handling and logging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the GitHub repository
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team directly

### Common Issues

1. **WhatsApp Webhook**: Ensure correct verification token and webhook URL
2. **Database Connection**: Check PostgreSQL credentials and network access
3. **LLM Service**: Verify Ollama is running or OpenAI API key is valid
4. **Vector DB**: Ensure Weaviate is accessible and schema is created

## 🙏 Acknowledgments

- **WhatsApp Business API** for messaging platform
- **Ollama** for local LLM capabilities
- **Weaviate** for vector database technology
- **TypeORM** for database management
- **Express.js** for web framework

---

**Built with ❤️ for the pharmaceutical industry**

*MedSupply-WA - Transforming pharmacy wholesale through intelligent automation*
