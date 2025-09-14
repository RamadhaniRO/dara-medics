import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
// ThemeProvider removed - components are now self-contained

// Import pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyAccount from './pages/auth/VerifyAccount';
import ChangePassword from './pages/auth/ChangePassword';
import SetNewPassword from './pages/auth/SetNewPassword';
import Dashboard from './pages/dashboard/Dashboard';
import CatalogManagement from './pages/catalog/CatalogManagement';
import OrderManagement from './pages/orders/OrderManagement';
import CustomerManagement from './pages/customers/CustomerManagement';
import AgentMonitoring from './pages/agents/AgentMonitoring';
import Analytics from './pages/analytics/Analytics';
import Settings from './pages/settings/Settings';
import HelpSupport from './pages/help/HelpSupport';
import PaymentManagement from './pages/payments/PaymentManagement';
import ComplianceDashboard from './pages/compliance/ComplianceDashboard';
import AuditLogs from './pages/audit/AuditLogs';
import SupportAgentDashboard from './pages/support/SupportAgentDashboard';
import WhatsAppPreview from './pages/whatsapp/WhatsAppPreview';
import UserProfile from './pages/profile/UserProfile';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import ComponentDemo from './pages/demo/ComponentDemo';

// Import components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth';
// Global styles are now handled by individual components
import { setupGlobalErrorHandling } from './services/errorHandler';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Setup global error handling
  React.useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-account" element={<VerifyAccount />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/set-new-password" element={<SetNewPassword />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/demo" element={<ComponentDemo />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="catalog" element={<CatalogManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="agents" element={<AgentMonitoring />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="compliance" element={<ComplianceDashboard />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="support" element={<SupportAgentDashboard />} />
              <Route path="whatsapp-preview" element={<WhatsAppPreview />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpSupport />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
