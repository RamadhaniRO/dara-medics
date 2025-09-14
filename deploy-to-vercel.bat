@echo off
REM Dara Medics Vercel Deployment Script for Windows
echo 🚀 Starting Dara Medics deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel:
    vercel login
)

echo 📦 Deploying Backend...
cd medsupply-wa-backend
vercel --prod
echo ✅ Backend deployment initiated

echo 📦 Deploying Frontend...
cd ..\medsupply-wa-frontend
vercel --prod
echo ✅ Frontend deployment initiated

echo 📝 Next steps:
echo 1. Check Vercel dashboard for deployment URLs
echo 2. Update OAuth provider redirect URIs with backend URL
echo 3. Update environment variables in Vercel dashboard
echo 4. Redeploy both projects after updating environment variables

echo 🎉 Deployment process complete!
pause
