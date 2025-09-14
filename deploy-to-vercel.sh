#!/bin/bash

# Dara Medics Vercel Deployment Script
echo "🚀 Starting Dara Medics deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

echo "📦 Deploying Backend..."
cd medsupply-wa-backend
vercel --prod
BACKEND_URL=$(vercel ls | grep "dara-medics-backend" | head -1 | awk '{print $2}')
echo "✅ Backend deployed at: $BACKEND_URL"

echo "📦 Deploying Frontend..."
cd ../medsupply-wa-frontend
vercel --prod
FRONTEND_URL=$(vercel ls | grep "dara-medics-frontend" | head -1 | awk '{print $2}')
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo "🔧 Updating environment variables..."
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"

echo "📝 Next steps:"
echo "1. Update OAuth provider redirect URIs:"
echo "   - Google: $BACKEND_URL/api/auth/google/callback"
echo "   - Microsoft: $BACKEND_URL/api/auth/microsoft/callback"
echo "   - Apple: $BACKEND_URL/api/auth/apple/callback"
echo ""
echo "2. Update environment variables in Vercel dashboard:"
echo "   - API_BASE_URL: $BACKEND_URL"
echo "   - FRONTEND_URL: $FRONTEND_URL"
echo "   - CORS_ORIGIN: $FRONTEND_URL"
echo ""
echo "3. Redeploy both projects after updating environment variables"

echo "🎉 Deployment complete!"
