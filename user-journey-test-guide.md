# Complete User Journey Test Guide

## 🎯 **Authentication Flow Verification**

### **Step 1: Test User Registration**
1. **Go to:** `https://dara-medics-frontend.vercel.app/register`
2. **Fill out the form:**
   - Pharmacy Name: "Test Pharmacy"
   - Email: "test@example.com"
   - Password: "TestPassword123!"
   - Confirm Password: "TestPassword123!"
3. **Click:** "Create Account"
4. **Expected Result:** 
   - Success message: "Account created successfully! Please check your email to verify your account before logging in."
   - Redirect to login page after 3 seconds

### **Step 2: Test Email Verification**
1. **Check email** for verification link
2. **Click verification link** or manually go to: `https://dara-medics-frontend.vercel.app/auth/verify`
3. **Expected Result:**
   - Email verification page loads
   - Success message: "Email verified successfully! Redirecting to login page in 3 seconds..."

### **Step 3: Test User Login**
1. **Go to:** `https://dara-medics-frontend.vercel.app/login`
2. **Fill out the form:**
   - Email: "test@example.com"
   - Password: "TestPassword123!"
3. **Click:** "Sign In"
4. **Expected Result:**
   - Success message: "Login successful! Welcome back to DARA Medics."
   - Redirect to dashboard after 1.5 seconds

### **Step 4: Test Social Login (Google)**
1. **Go to:** `https://dara-medics-frontend.vercel.app/login`
2. **Click:** Google icon (blue G)
3. **Expected Result:**
   - Redirect to Google OAuth
   - After authentication, redirect to `/auth/callback`
   - Then redirect to dashboard

### **Step 5: Test Dashboard Access**
1. **After successful login, you should see:**
   - Dashboard with metrics cards
   - Navigation sidebar
   - User profile in header
   - Recent orders section
   - Analytics charts

### **Step 6: Test Protected Routes**
1. **Try accessing:** `https://dara-medics-frontend.vercel.app/dashboard`
2. **Without login:** Should redirect to `/login`
3. **With login:** Should show dashboard

### **Step 7: Test Logout**
1. **Click user profile** in header
2. **Click:** "Sign Out"
3. **Expected Result:**
   - Redirect to login page
   - Session cleared

## 🔧 **Backend API Tests**

### **Test Backend Health**
```bash
curl https://dara-medics-backend.vercel.app/health
```
**Expected:** `{"status":"ok","supabase_connected":true}`

### **Test Registration API**
```bash
curl -X POST https://dara-medics-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User 2",
    "pharmacy_name": "Test Pharmacy 2"
  }'
```

### **Test Login API**
```bash
curl -X POST https://dara-medics-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## ✅ **Success Criteria**

### **Frontend Tests:**
- ✅ Registration form works
- ✅ Email verification works
- ✅ Login form works
- ✅ Social login buttons show correct icons (Google blue, Microsoft cyan, Apple black)
- ✅ Social login redirects work
- ✅ Dashboard loads with skeleton loading
- ✅ Protected routes redirect unauthenticated users
- ✅ Logout works
- ✅ Navigation between pages works

### **Backend Tests:**
- ✅ Health endpoint responds
- ✅ Registration endpoint works
- ✅ Login endpoint works
- ✅ Supabase integration works
- ✅ CORS is configured correctly

### **Integration Tests:**
- ✅ Frontend can communicate with backend
- ✅ Supabase authentication works end-to-end
- ✅ Email verification flow works
- ✅ Social authentication works
- ✅ Session management works

## 🚨 **Common Issues & Solutions**

### **Issue: Frontend stuck on loading screen**
**Solution:** Add frontend environment variables to Vercel:
```
REACT_APP_API_URL=https://dara-medics-backend.vercel.app
REACT_APP_SUPABASE_URL=https://mdwicqcwzkmlwajxutjy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Issue: Backend returns 500 error**
**Solution:** Add backend environment variables to Vercel:
```
SUPABASE_URL=https://mdwicqcwzkmlwajxutjy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=dara_medics_super_secure_jwt_secret_key_2024...
SESSION_SECRET=dara_medics_session_secret_key_2024...
```

### **Issue: Social login icons all look the same**
**Solution:** Fixed! Icons now show correctly:
- Google: Blue G icon
- Microsoft: Cyan M icon  
- Apple: Black Apple icon

## 🎉 **Expected Final State**

After completing all tests, you should have:
- ✅ Fully functional authentication system
- ✅ Working frontend-backend integration
- ✅ Supabase authentication with email verification
- ✅ Social login with proper icons
- ✅ Protected routes and session management
- ✅ Complete user journey from registration to dashboard
