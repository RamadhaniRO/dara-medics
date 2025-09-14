#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

class SupabaseSetup {
  private client: any;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration. Please run npm run supabase:init first.');
    }

    this.client = createClient(url, serviceRoleKey);
  }

  async setup(): Promise<void> {
    console.log('\n🚀 Setting up DARA-Medics Supabase project...\n');

    try {
      // Enable RLS on all tables
      await this.enableRLS();
      
      // Create indexes for performance
      await this.createIndexes();
      
      // Insert sample data
      await this.insertSampleData();
      
      // Configure storage buckets
      await this.setupStorage();
      
      console.log('\n✅ DARA-Medics Supabase project setup completed!\n');
      
    } catch (error: any) {
      console.error('\n❌ Setup failed:', error?.message || 'Unknown error');
      process.exit(1);
    }
  }

  private async enableRLS(): Promise<void> {
    console.log('🔒 Enabling Row Level Security...');
    
    const tables = [
      'users', 'pharmacies', 'products', 'orders', 'order_items',
      'payments', 'conversations', 'messages', 'agent_sessions',
      'audit_logs', 'system_settings'
    ];

    for (const table of tables) {
      try {
        await this.client.rpc('exec_sql', { 
          sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
        });
        console.log(`✅ RLS enabled on ${table}`);
      } catch (error: any) {
        console.log(`⚠️  RLS warning for ${table}: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private async createIndexes(): Promise<void> {
    console.log('\n📊 Creating database indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_pharmacies_license ON pharmacies(license_number)',
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)',
      'CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON orders(pharmacy_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp ON conversations(whatsapp_number)',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)'
    ];

    for (const index of indexes) {
      try {
        await this.client.rpc('exec_sql', { sql: index });
        console.log('✅ Index created');
      } catch (error: any) {
        console.log(`⚠️  Index creation warning: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private async insertSampleData(): Promise<void> {
    console.log('\n📝 Inserting sample data...');
    
    try {
      // Insert sample pharmacy
      const { data: pharmacy } = await this.client
        .from('pharmacies')
        .insert({
          name: 'City Pharmacy',
          license_number: 'PHAR-001-2024',
          address: '123 Main Street, Dar es Salaam',
          city: 'Dar es Salaam',
          state: 'Dar es Salaam',
          country: 'Tanzania',
          phone_number: '+255123456789',
          email: 'info@citypharmacy.co.tz',
          contact_person: 'Dr. John Doe',
          status: 'active'
        })
        .select()
        .single();

      console.log('✅ Sample pharmacy inserted');

      // Insert sample products
      const products = [
        {
          name: 'Paracetamol 500mg',
          generic_name: 'Paracetamol',
          brand_name: 'Panadol',
          description: 'Pain reliever and fever reducer',
          dosage_form: 'Tablet',
          strength: '500mg',
          unit: 'tablet',
          category: 'Analgesics',
          subcategory: 'Pain Relief',
          requires_prescription: false,
          price: 100.00,
          stock_quantity: 1000,
          sku: 'MED-001'
        },
        {
          name: 'Amoxicillin 500mg',
          generic_name: 'Amoxicillin',
          brand_name: 'Amoxil',
          description: 'Antibiotic for bacterial infections',
          dosage_form: 'Capsule',
          strength: '500mg',
          unit: 'capsule',
          category: 'Antibiotics',
          subcategory: 'Penicillins',
          requires_prescription: true,
          price: 250.00,
          stock_quantity: 500,
          sku: 'MED-002'
        }
      ];

      for (const product of products) {
        await this.client.from('products').insert(product);
      }
      console.log('✅ Sample products inserted');

      // Insert sample user
      await this.client
        .from('users')
        .insert({
          email: 'admin@dara-medics.com',
          phone_number: '+255123456789',
          full_name: 'Admin User',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
          pharmacy_id: pharmacy.id,
          is_active: true,
          email_verified: true
        })
        .select()
        .single();

      console.log('✅ Sample admin user inserted');

    } catch (error: any) {
      console.log(`⚠️  Sample data insertion warning: ${error?.message || 'Unknown error'}`);
    }
  }

  private async setupStorage(): Promise<void> {
    console.log('\n🗄️  Setting up storage buckets...');
    
    try {
      // Create storage buckets
      const buckets = [
        { name: 'product-images', public: true },
        { name: 'documents', public: false },
        { name: 'invoices', public: false },
        { name: 'media', public: false }
      ];

      for (const bucket of buckets) {
        try {
          await this.client.storage.createBucket(bucket.name, {
            public: bucket.public,
            allowedMimeTypes: bucket.public ? ['image/*'] : ['*/*'],
            fileSizeLimit: 52428800 // 50MB
          });
          console.log(`✅ Storage bucket '${bucket.name}' created`);
        } catch (error: any) {
          console.log(`⚠️  Storage bucket warning for '${bucket.name}': ${error?.message || 'Unknown error'}`);
        }
      }

    } catch (error: any) {
      console.log(`⚠️  Storage setup warning: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Run the setup
if (require.main === module) {
  const setup = new SupabaseSetup();
  setup.setup();
}
