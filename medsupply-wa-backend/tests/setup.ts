// Test setup file for Jest
import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.WHATSAPP_API_URL = 'https://test-api.whatsapp.com';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-id';
process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token';
process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.exit to prevent tests from exiting
process.exit = jest.fn() as any;

// Setup global test utilities
global.testUtils = {
  createMockOrder: () => ({
    id: 'order-test-123',
    order_number: 'MS-TEST-001',
    status: 'pending',
    total_amount: 100.00,
    itemCount: 1,
    created_at: new Date(),
    canTransitionTo: jest.fn(() => true),
    calculateTotals: jest.fn(),
    getEstimatedDeliveryTime: jest.fn(() => new Date(Date.now() + 24 * 60 * 60 * 1000))
  }),
  
  createMockProduct: () => ({
    id: 'product-test-123',
    name: 'Test Product',
    brand: 'Test Brand',
    wholesale_price: 50.00,
    retail_price: 75.00,
    status: 'active'
  }),
  
  createMockPharmacy: () => ({
    id: 'pharmacy-test-123',
    name: 'Test Pharmacy',
    phone_number: '+254700000000',
    email: 'test@pharmacy.com',
    status: 'active'
  })
};

// Type declaration for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockOrder: () => any;
        createMockProduct: () => any;
        createMockPharmacy: () => any;
      };
    }
  }
}
