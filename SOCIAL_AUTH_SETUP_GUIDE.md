# Social Authentication Setup Guide

This guide explains how to set up social authentication (OAuth) for the Dara Medics platform.

## Overview

The social authentication system supports three major OAuth providers:
- **Google OAuth 2.0**
- **Microsoft OAuth 2.0** 
- **Apple Sign-In**

## Backend Implementation

### Files Added/Modified

1. **`src/services/auth/social-auth.service.ts`** - Core social authentication service
2. **`src/api/routes/social-auth.routes.ts`** - Social authentication API routes
3. **`src/index.ts`** - Updated to include social auth routes
4. **`env.example`** - Added OAuth environment variables

### Dependencies Installed

```bash
npm install passport passport-google-oauth20 passport-microsoft passport-apple @types/passport @types/passport-google-oauth20 @types/passport-microsoft @types/passport-apple
```

## Frontend Implementation

### Files Added/Modified

1. **`src/services/api.ts`** - Added social authentication API methods
2. **`src/hooks/useAuth.tsx`** - Enhanced with social login methods
3. **`src/pages/auth/Login.tsx`** - Updated with working social buttons
4. **`src/pages/auth/AuthCallback.tsx`** - New callback page for OAuth redirects
5. **`src/App.tsx`** - Added auth callback route

## Environment Variables

Add these variables to your `.env` file:

```bash
# Social Authentication (OAuth) Configuration
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Apple OAuth
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# OAuth Redirect URLs (automatically configured)
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret to environment variables

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Set application type to "Web"
5. Add redirect URI:
   - `http://localhost:3000/api/auth/microsoft/callback` (development)
   - `https://yourdomain.com/api/auth/microsoft/callback` (production)
6. Go to "Certificates & secrets" → "New client secret"
7. Copy Application (client) ID and Client secret to environment variables

### Apple Sign-In Setup

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID with "Sign In with Apple" capability
4. Create a Service ID for web authentication
5. Generate a private key for "Sign In with Apple"
6. Configure domains and redirect URLs
7. Copy the required values to environment variables

## API Endpoints

### Social Authentication Routes

- `GET /api/auth/providers` - Get available OAuth providers
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth
- `GET /api/auth/microsoft/callback` - Microsoft OAuth callback
- `GET /api/auth/apple` - Initiate Apple Sign-In
- `POST /api/auth/apple/callback` - Apple Sign-In callback
- `GET /api/auth/test` - Test social auth configuration

## Frontend Usage

### Login Component

The login page automatically detects available OAuth providers and shows the appropriate social login buttons.

```tsx
// Social login buttons are automatically configured
<SocialLoginButtons
  onGoogleLogin={() => handleSocialLogin('google')}
  onMicrosoftLogin={() => handleSocialLogin('microsoft')}
  onAppleLogin={() => handleSocialLogin('apple')}
  disabled={isLoading}
  loading={isLoading}
/>
```

### Auth Hook

Use the enhanced auth hook for social authentication:

```tsx
const { socialLogin, handleSocialCallback, getSocialProviders } = useAuth();

// Initiate social login
await socialLogin('google');

// Handle OAuth callback (automatic)
// The callback page handles the redirect automatically
```

## Authentication Flow

1. **User clicks social login button** → Frontend calls `socialLogin(provider)`
2. **Frontend redirects to OAuth provider** → User authenticates with provider
3. **Provider redirects back to backend** → `/api/auth/{provider}/callback`
4. **Backend processes OAuth response** → Creates/updates user account
5. **Backend redirects to frontend** → `/auth/callback?token=...&provider=...`
6. **Frontend handles callback** → Sets authentication token and redirects to dashboard

## Database Schema

The social authentication system uses the existing `users` table with these additional fields:

```sql
-- Add these columns to your users table
ALTER TABLE users ADD COLUMN social_provider VARCHAR(20);
ALTER TABLE users ADD COLUMN social_id VARCHAR(255);
ALTER TABLE users ADD COLUMN profile_picture TEXT;
```

## Security Considerations

1. **Environment Variables**: Never commit OAuth secrets to version control
2. **HTTPS**: Always use HTTPS in production for OAuth callbacks
3. **State Parameter**: Consider implementing state parameter for CSRF protection
4. **Token Validation**: JWT tokens are validated on each request
5. **User Data**: Social providers may not provide all required user information

## Testing

### Backend Testing

```bash
# Test social auth configuration
curl http://localhost:3000/api/auth/test

# Get available providers
curl http://localhost:3000/api/auth/providers
```

### Frontend Testing

1. Start the development server
2. Navigate to `/login`
3. Click on social login buttons (if providers are configured)
4. Complete OAuth flow
5. Verify redirect to dashboard

## Troubleshooting

### Common Issues

1. **"Social authentication is not available"**
   - Check if OAuth environment variables are set
   - Verify OAuth provider configuration

2. **"Invalid redirect URI"**
   - Ensure redirect URIs match exactly in OAuth provider settings
   - Check API_BASE_URL environment variable

3. **"Authentication failed"**
   - Check OAuth provider logs
   - Verify client ID and secret are correct
   - Ensure OAuth app is properly configured

4. **Database errors**
   - Ensure users table has required columns
   - Check database connection

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG_MODE=true
LOG_LEVEL=debug
```

## Production Deployment

1. **Set up OAuth apps** for production domains
2. **Update environment variables** with production values
3. **Configure HTTPS** for OAuth callbacks
4. **Test OAuth flow** in production environment
5. **Monitor logs** for authentication issues

## Support

For issues with social authentication:

1. Check the logs for detailed error messages
2. Verify OAuth provider configuration
3. Test with a single provider first
4. Ensure all environment variables are set correctly

The social authentication system is now fully implemented and ready for use!
