import { ComponentType, lazy } from 'react';
import { config } from '../config/environment';

// Loading component factory for suspense fallback
export const createLoadingSpinner = () => {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 16px;
    color: #666;
  `;
  container.textContent = 'Loading...';
  return container;
};

// Error boundary factory for lazy loaded components
export const createErrorBoundaryFallback = (error: Error) => {
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 2rem;
    text-align: center;
    color: #dc2626;
  `;
  container.textContent = 'Failed to load component. Please refresh the page.';
  return container;
};

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunction: () => Promise<{ default: ComponentType<T> }>
) {
  const LazyComponent = lazy(importFunction);
  return LazyComponent;
}

// Preload function for components
export function preloadComponent(importFunction: () => Promise<any>): void {
  if (config.enableDebug) {
    console.log('Preloading component...');
  }
  
  importFunction().catch(error => {
    console.error('Failed to preload component:', error);
  });
}

// Route-based lazy loading
export const lazyRoutes = {
  // Auth pages
  Login: withLazyLoading(() => import('../pages/auth/Login')),
  Register: withLazyLoading(() => import('../pages/auth/Register')),
  ForgotPassword: withLazyLoading(() => import('../pages/auth/ForgotPassword')),
  ResetPassword: withLazyLoading(() => import('../pages/auth/ResetPassword')),
  VerifyAccount: withLazyLoading(() => import('../pages/auth/VerifyAccount')),

  // Dashboard pages
  Dashboard: withLazyLoading(() => import('../pages/dashboard/Dashboard')),
  CatalogManagement: withLazyLoading(() => import('../pages/catalog/CatalogManagement')),
  OrderManagement: withLazyLoading(() => import('../pages/orders/OrderManagement')),
  CustomerManagement: withLazyLoading(() => import('../pages/customers/CustomerManagement')),
  PaymentManagement: withLazyLoading(() => import('../pages/payments/PaymentManagement')),

  // Admin pages
  AgentMonitoring: withLazyLoading(() => import('../pages/agents/AgentMonitoring')),
  Analytics: withLazyLoading(() => import('../pages/analytics/Analytics')),
  ComplianceDashboard: withLazyLoading(() => import('../pages/compliance/ComplianceDashboard')),
  AuditLogs: withLazyLoading(() => import('../pages/audit/AuditLogs')),

  // Support pages
  SupportAgentDashboard: withLazyLoading(() => import('../pages/support/SupportAgentDashboard')),
  HelpSupport: withLazyLoading(() => import('../pages/help/HelpSupport')),

  // Other pages
  WhatsAppPreview: withLazyLoading(() => import('../pages/whatsapp/WhatsAppPreview')),
  UserProfile: withLazyLoading(() => import('../pages/profile/UserProfile')),
  Settings: withLazyLoading(() => import('../pages/settings/Settings')),
  TermsOfService: withLazyLoading(() => import('../pages/legal/TermsOfService')),
  PrivacyPolicy: withLazyLoading(() => import('../pages/legal/PrivacyPolicy')),
};

// Preload critical routes
export function preloadCriticalRoutes(): void {
  if (typeof window === 'undefined') return;

  // Preload dashboard and main pages after initial load
  setTimeout(() => {
    preloadComponent(() => import('../pages/dashboard/Dashboard'));
    preloadComponent(() => import('../pages/orders/OrderManagement'));
    preloadComponent(() => import('../pages/catalog/CatalogManagement'));
  }, 2000);

  // Preload secondary pages after a longer delay
  setTimeout(() => {
    preloadComponent(() => import('../pages/analytics/Analytics'));
    preloadComponent(() => import('../pages/agents/AgentMonitoring'));
    preloadComponent(() => import('../pages/customers/CustomerManagement'));
  }, 5000);
}

// Image lazy loading utility
export function createLazyImageLoader(src: string, placeholder?: string) {
  return new Promise<{ imageSrc: string; isLoaded: boolean; isError: boolean }>((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        imageSrc: src,
        isLoaded: true,
        isError: false
      });
    };
    
    img.onerror = () => {
      resolve({
        imageSrc: placeholder || '',
        isLoaded: false,
        isError: true
      });
    };
    
    img.src = src;
  });
}

// Intersection Observer utility for lazy loading
export function createIntersectionObserver(
  element: Element,
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      callback(entry.isIntersecting);
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    }
  );

  observer.observe(element);

  return () => {
    observer.unobserve(element);
  };
}

// Data lazy loading utility
export async function loadDataWithRetry<T>(
  fetchFunction: () => Promise<T>,
  maxRetries: number = 3
): Promise<{ data: T | null; loading: boolean; error: Error | null }> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const data = await fetchFunction();
      return { data, loading: false, error: null };
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        return { 
          data: null, 
          loading: false, 
          error: error instanceof Error ? error : new Error('Unknown error') 
        };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  
  return { data: null, loading: false, error: new Error('Max retries exceeded') };
}

// Virtual scrolling utility for large lists
export function calculateVirtualScroll(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY
  };
}

// Performance monitoring for lazy loading
export function measureLazyLoadPerformance(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    if (config.enableDebug) {
      console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
    
    // Send to analytics if enabled
    if (config.enableAnalytics && typeof window !== 'undefined') {
      // Send to your analytics service
      console.log('Analytics: Component load time', { componentName, loadTime });
    }
  };
}

export default {
  withLazyLoading,
  preloadComponent,
  lazyRoutes,
  preloadCriticalRoutes,
  createLazyImageLoader,
  createIntersectionObserver,
  loadDataWithRetry,
  calculateVirtualScroll,
  measureLazyLoadPerformance
};
