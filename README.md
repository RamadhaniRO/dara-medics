# MedSupply-WA

A comprehensive WhatsApp-powered pharmacy wholesale management system with AI-driven customer interactions.

## Project Overview

MedSupply-WA is a full-stack application that enables pharmacies to manage wholesale operations through WhatsApp integration, powered by AI agents for customer service and order processing.

## Project Structure

```
dara_medics/
├── medsupply-wa-frontend/     # React TypeScript frontend
├── medsupply-wa-backend/       # Node.js TypeScript backend
├── .env                        # Environment variables
└── README.md                   # This file
```

## Components

### Frontend (`medsupply-wa-frontend/`)
- **Technology**: React 18 + TypeScript
- **Styling**: Styled Components
- **State Management**: React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **UI Components**: Custom design system

**Features:**
- User authentication and authorization
- Dashboard with real-time metrics
- Order management interface
- Customer management
- Agent monitoring
- Analytics and reporting
- Settings and configuration

### Backend (`medsupply-wa-backend/`)
- **Technology**: Node.js + TypeScript + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcryptjs
- **AI/ML**: Hugging Face Inference API
- **Real-time**: Socket.IO
- **WhatsApp**: Business API integration

**Features:**
- RESTful API endpoints
- WhatsApp webhook handling
- AI agent orchestration
- RAG (Retrieval-Augmented Generation)
- Order processing
- Payment management
- Real-time notifications

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Hugging Face API token
- WhatsApp Business API access

### Frontend Setup
```bash
cd medsupply-wa-frontend
npm install
npm start
```

### Backend Setup
```bash
cd medsupply-wa-backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Frontend Configuration
REACT_APP_API_URL=http://localhost:3000

# Backend Configuration
PORT=3000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_token

# WhatsApp
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# CORS
CORS_ORIGIN=http://localhost:3001
```

## Development

### Running Both Applications

1. **Start Backend** (Terminal 1):
   ```bash
   cd medsupply-wa-backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd medsupply-wa-frontend
   npm start
   ```

### API Endpoints

The backend provides the following main API endpoints:

- **Authentication**: `/api/auth/*`
- **Orders**: `/api/v1/orders/*`
- **Payments**: `/api/v1/payments/*`
- **Admin**: `/api/v1/admin/*`
- **WhatsApp Webhook**: `/webhook/whatsapp`
- **Health Check**: `/health`

### Frontend Routes

The frontend includes the following main routes:

- **Authentication**: `/login`, `/register`
- **Dashboard**: `/dashboard`
- **Orders**: `/orders`
- **Catalog**: `/catalog`
- **Customers**: `/customers`
- **Analytics**: `/analytics`
- **Settings**: `/settings`

## Testing

### Frontend Tests
```bash
cd medsupply-wa-frontend
npm test
```

### Backend Tests
```bash
cd medsupply-wa-backend
npm test
```

## Deployment

### Frontend Deployment
```bash
cd medsupply-wa-frontend
npm run build
```

### Backend Deployment
```bash
cd medsupply-wa-backend
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the individual component READMEs
- Contact the development team

## Documentation

- [Frontend Documentation](./medsupply-wa-frontend/README.md)
- [Backend Documentation](./medsupply-wa-backend/README.md)
- [Supabase Setup](./medsupply-wa-backend/SUPABASE_SETUP.md)
- [Hugging Face Setup](./medsupply-wa-backend/HUGGINGFACE_SETUP.md)
