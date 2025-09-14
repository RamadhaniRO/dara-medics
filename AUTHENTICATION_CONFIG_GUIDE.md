# Authentication Configuration Guide

This guide explains how to configure authentication for different environments (local, staging, production) in the DARA-Medics application.

## Overview

The authentication system is designed to work seamlessly across different environments with minimal configuration changes. It uses Supabase Auth for user management and provides flexible configuration options.

## Environment-Specific Configuration

### 1. Local Development

**Backend Configuration** (`medsupply-wa-backend/.env`):
```env
NODE_ENV=development
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
ENABLE_EMAIL_CONFIRMATION=false
SKIP_EMAIL_VERIFICATION=true
DEBUG_MODE=true
```

**Frontend Configuration** (`medsupply-wa-frontend/.env`):
```env
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENABLE_EMAIL_VERIFICATION=false
REACT_APP_SKIP_EMAIL_VERIFICATION=true
REACT_APP_DEBUG_MODE=true
```

**Features Enabled:**
- ✅ Email verification disabled (for easy testing)
- ✅ Debug logging enabled
- ✅ CORS allows localhost
- ✅ Development-friendly settings

### 2. Staging Environment

**Backend Configuration** (`medsupply-wa-backend/.env.staging`):
```env
NODE_ENV=staging
BASE_URL=https://staging-api.your-domain.com
FRONTEND_URL=https://staging.your-domain.com
ENABLE_EMAIL_CONFIRMATION=true
SKIP_EMAIL_VERIFICATION=false
DEBUG_MODE=false
ENABLE_RATE_LIMIT=true
ENABLE_HTTPS=true
```

**Frontend Configuration** (`medsupply-wa-frontend/.env.staging`):
```env
REACT_APP_ENV=staging
REACT_APP_API_URL=https://staging-api.your-domain.com
REACT_APP_ENABLE_EMAIL_VERIFICATION=true
REACT_APP_SKIP_EMAIL_VERIFICATION=false
REACT_APP_DEBUG_MODE=true
REACT_APP_SHOW_ENV_BANNER=true
```

**Features Enabled:**
- ✅ Email verification enabled
- ✅ Production-like security settings
- ✅ Environment banner visible
- ✅ Debug logging for testing

### 3. Production Environment

**Backend Configuration** (`medsupply-wa-backend/.env.production`):
```env
NODE_ENV=production
BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
ENABLE_EMAIL_CONFIRMATION=true
SKIP_EMAIL_VERIFICATION=false
DEBUG_MODE=false
ENABLE_RATE_LIMIT=true
ENABLE_HTTPS=true
```

**Frontend Configuration** (`medsupply-wa-frontend/.env.production`):
```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENABLE_EMAIL_VERIFICATION=true
REACT_APP_SKIP_EMAIL_VERIFICATION=false
REACT_APP_DEBUG_MODE=false
REACT_APP_SHOW_ENV_BANNER=false
REACT_APP_ENABLE_ANALYTICS=true
```

**Features Enabled:**
- ✅ Email verification enabled
- ✅ Full security settings
- ✅ Analytics enabled
- ✅ Error reporting enabled
- ✅ Performance optimizations

## Key Configuration Variables

### Backend Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `NODE_ENV` | development | staging | production | Environment identifier |
| `BASE_URL` | http://localhost:3000 | https://staging-api.domain.com | https://api.domain.com | Backend base URL |
| `FRONTEND_URL` | http://localhost:3001 | https://staging.domain.com | https://domain.com | Frontend base URL |
| `ENABLE_EMAIL_CONFIRMATION` | false | true | true | Enable email verification |
| `SKIP_EMAIL_VERIFICATION` | true | false | false | Skip email verification |
| `DEBUG_MODE` | true | false | false | Enable debug logging |
| `ENABLE_RATE_LIMIT` | false | true | true | Enable rate limiting |
| `ENABLE_HTTPS` | false | true | true | Enable HTTPS |

### Frontend Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `REACT_APP_ENV` | development | staging | production | Environment identifier |
| `REACT_APP_API_URL` | http://localhost:3000 | https://staging-api.domain.com | https://api.domain.com | API base URL |
| `REACT_APP_ENABLE_EMAIL_VERIFICATION` | false | true | true | Enable email verification |
| `REACT_APP_SKIP_EMAIL_VERIFICATION` | true | false | false | Skip email verification |
| `REACT_APP_DEBUG_MODE` | true | true | false | Enable debug mode |
| `REACT_APP_SHOW_ENV_BANNER` | false | true | false | Show environment banner |
| `REACT_APP_ENABLE_ANALYTICS` | false | false | true | Enable analytics |

## Supabase Configuration

### Email Verification Settings

The system automatically configures email verification based on the environment:

- **Development**: Email verification disabled (`emailRedirectTo: undefined`)
- **Staging/Production**: Email verification enabled (`emailRedirectTo: frontendUrl/auth/verify`)

### Supabase Project Setup

1. **Development**: Use your development Supabase project
2. **Staging**: Create a separate staging Supabase project
3. **Production**: Create a separate production Supabase project

## Deployment Steps

### 1. Local Development Setup

```bash
# Backend
cd medsupply-wa-backend
cp env.example .env
# Edit .env with your local settings
npm run dev

# Frontend
cd medsupply-wa-frontend
# Create .env.local with local settings
npm start
```

### 2. Staging Deployment

```bash
# Backend
cd medsupply-wa-backend
cp env.staging.example .env
# Edit .env with staging settings
npm run build
npm start

# Frontend
cd medsupply-wa-frontend
cp env.staging.example .env
# Edit .env with staging settings
npm run build
# Deploy build folder to staging server
```

### 3. Production Deployment

```bash
# Backend
cd medsupply-wa-backend
cp env.production.example .env
# Edit .env with production settings
npm run build
npm start

# Frontend
cd medsupply-wa-frontend
cp env.production.example .env
# Edit .env with production settings
npm run build
# Deploy build folder to production server
```

## Security Considerations

### Development
- Email verification disabled for easy testing
- Debug logging enabled
- CORS allows localhost
- Rate limiting disabled

### Staging
- Email verification enabled
- Production-like security settings
- Environment banner visible
- Debug logging for testing

### Production
- Full security enabled
- Email verification required
- Rate limiting enabled
- HTTPS required
- Analytics and error reporting enabled

## Troubleshooting

### Common Issues

1. **Email verification not working in development**
   - Check `SKIP_EMAIL_VERIFICATION=true` in backend
   - Check `REACT_APP_SKIP_EMAIL_VERIFICATION=true` in frontend

2. **CORS errors**
   - Verify `CORS_ORIGIN` matches your frontend URL
   - Check `FRONTEND_URL` is correct

3. **Authentication fails**
   - Verify Supabase credentials are correct
   - Check JWT secret is set
   - Ensure API URLs are correct

### Environment Validation

The system automatically validates configuration and shows warnings for missing or incorrect settings. Check the console logs for configuration warnings.

## Migration Between Environments

To migrate from one environment to another:

1. Copy the appropriate `.env` example file
2. Update URLs and credentials
3. Update Supabase project settings
4. Test authentication flow
5. Deploy with new configuration

This configuration system ensures that authentication works correctly across all environments with minimal manual configuration changes.
