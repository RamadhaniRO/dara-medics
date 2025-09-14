# Vercel Deployment Guide for Dara Medics

This guide will help you deploy your Dara Medics project to Vercel with both frontend and backend.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: Prepare your production environment variables

## Deployment Steps

### Step 1: Deploy the Backend

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Backend Repository**
   - Connect your GitHub account
   - Select the `dara-medics` repository
   - Choose the `medsupply-wa-backend` folder as the root directory

3. **Configure Backend Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `medsupply-wa-backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `vercel-env-example.txt`
   - Update URLs to use your Vercel domains:
     - `API_BASE_URL`: `https://your-backend-project.vercel.app`
     - `FRONTEND_URL`: `https://your-frontend-project.vercel.app`
     - `CORS_ORIGIN`: `https://your-frontend-project.vercel.app`

5. **Deploy Backend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL (e.g., `https://dara-medics-backend.vercel.app`)

### Step 2: Deploy the Frontend

1. **Create New Project for Frontend**
   - Click "New Project" again
   - Select the same repository
   - Choose the `medsupply-wa-frontend` folder as root directory

2. **Configure Frontend Settings**
   - **Framework Preset**: Create React App
   - **Root Directory**: `medsupply-wa-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Set Frontend Environment Variables**
   - Add environment variables:
     - `REACT_APP_API_URL`: `https://your-backend-project.vercel.app`
   - Update any other frontend-specific variables

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL (e.g., `https://dara-medics-frontend.vercel.app`)

### Step 3: Update OAuth Provider Settings

After deployment, update your OAuth provider redirect URIs:

#### Google OAuth
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Update authorized redirect URIs:
  - `https://your-backend-project.vercel.app/api/auth/google/callback`

#### Microsoft OAuth
- Go to [Azure Portal](https://portal.azure.com/)
- Update redirect URIs:
  - `https://your-backend-project.vercel.app/api/auth/microsoft/callback`

#### Apple Sign-In
- Go to [Apple Developer Console](https://developer.apple.com/)
- Update redirect URIs:
  - `https://your-backend-project.vercel.app/api/auth/apple/callback`

### Step 4: Update Environment Variables

1. **Backend Environment Variables**
   - Update `API_BASE_URL` to your backend Vercel URL
   - Update `FRONTEND_URL` to your frontend Vercel URL
   - Update `CORS_ORIGIN` to your frontend Vercel URL
   - Update OAuth redirect URLs in provider settings

2. **Frontend Environment Variables**
   - Update `REACT_APP_API_URL` to your backend Vercel URL

3. **Redeploy Both Projects**
   - Trigger new deployments to apply environment variable changes

## Domain Configuration (Optional)

### Custom Domain Setup

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `dara-medics.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update all URLs to use your custom domain
   - Update OAuth provider redirect URIs
   - Redeploy both projects

## Monitoring and Maintenance

### Health Checks

- **Backend Health**: `https://your-backend-project.vercel.app/health`
- **Frontend**: `https://your-frontend-project.vercel.app`

### Logs and Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics in project settings
   - Monitor performance and errors

2. **Error Tracking**
   - Set up Sentry for error tracking
   - Configure `SENTRY_DSN` environment variable

3. **Performance Monitoring**
   - Set up New Relic or similar service
   - Configure `NEW_RELIC_LICENSE_KEY` environment variable

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure URLs are correct and accessible
   - Check for typos in variable names

3. **CORS Issues**
   - Verify `CORS_ORIGIN` matches your frontend URL
   - Check that `FRONTEND_URL` is set correctly

4. **OAuth Issues**
   - Verify redirect URIs in OAuth provider settings
   - Check that OAuth credentials are correct
   - Ensure HTTPS is used for all URLs

### Debugging

1. **Check Logs**
   - Use Vercel dashboard to view function logs
   - Check browser console for frontend errors

2. **Test Endpoints**
   - Test API endpoints directly
   - Verify database connections
   - Check OAuth provider configurations

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **HTTPS**
   - Vercel provides HTTPS by default
   - Ensure all OAuth redirects use HTTPS

3. **CORS**
   - Configure CORS properly for production
   - Only allow necessary origins

## Performance Optimization

1. **Frontend Optimization**
   - Enable Vercel's automatic optimizations
   - Use code splitting and lazy loading
   - Optimize images and assets

2. **Backend Optimization**
   - Use Vercel's edge functions for better performance
   - Implement caching strategies
   - Optimize database queries

## Backup and Recovery

1. **Database Backups**
   - Set up automated Supabase backups
   - Configure backup retention policies

2. **Code Backups**
   - Your code is already backed up in GitHub
   - Consider additional backup strategies

## Support

For deployment issues:

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support**: Available through dashboard
3. **Community**: Vercel Discord and GitHub discussions

Your Dara Medics application is now ready for production deployment on Vercel!
