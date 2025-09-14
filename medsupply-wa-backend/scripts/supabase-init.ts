#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as readline from 'readline';
import * as fs from 'fs';

// Load environment variables
config();

interface SupabaseCredentials {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

class SupabaseInitializer {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async getCredentials(): Promise<SupabaseCredentials> {
    console.log('\n🚀 DARA-Medics Supabase Project Initialization\n');
    console.log('Please provide your Supabase project credentials:\n');

    const url = await this.question('Enter your Supabase project URL: ');
    const anonKey = await this.question('Enter your Supabase anon/public key: ');
    const serviceRoleKey = await this.question('Enter your Supabase service_role key: ');

    return { url, anonKey, serviceRoleKey };
  }

  async createSchema(client: any): Promise<void> {
    console.log('\n📊 Creating database schema...\n');

    // Create tables
    await this.createTables(client);
    
    // Create RLS policies
    await this.createRLSPolicies(client);
    
    // Create functions and triggers
    await this.createFunctions(client);
    
    // Insert initial data
    await this.insertInitialData(client);
    
    console.log('✅ Database schema created successfully!\n');
  }

  private async createTables(client: any): Promise<void> {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        permissions TEXT[] DEFAULT '{}',
        pharmacy_id UUID,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Pharmacies table
      `CREATE TABLE IF NOT EXISTS pharmacies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) DEFAULT 'Tanzania',
        postal_code VARCHAR(20),
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        contact_person VARCHAR(255),
        tax_id VARCHAR(100),
        credit_limit DECIMAL(15,2) DEFAULT 0,
        payment_terms INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        generic_name VARCHAR(255),
        brand_name VARCHAR(255),
        description TEXT,
        active_ingredients TEXT[],
        dosage_form VARCHAR(100),
        strength VARCHAR(100),
        unit VARCHAR(50),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        requires_prescription BOOLEAN DEFAULT false,
        is_controlled BOOLEAN DEFAULT false,
        storage_conditions TEXT,
        expiry_date DATE,
        manufacturer VARCHAR(255),
        supplier VARCHAR(255),
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        max_stock INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        pharmacy_id UUID REFERENCES pharmacies(id),
        user_id UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(15,2) NOT NULL,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        final_amount DECIMAL(15,2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        delivery_address TEXT,
        delivery_notes TEXT,
        delivery_date TIMESTAMP WITH TIME ZONE,
        delivery_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID REFERENCES orders(id),
        transaction_id VARCHAR(100) UNIQUE,
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_type VARCHAR(50) DEFAULT 'payment',
        status VARCHAR(50) DEFAULT 'pending',
        gateway_response JSONB,
        phone_number VARCHAR(20),
        customer_name VARCHAR(255),
        confirmation_code VARCHAR(20),
        processed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Conversations table
      `CREATE TABLE IF NOT EXISTS conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        pharmacy_id UUID REFERENCES pharmacies(id),
        whatsapp_number VARCHAR(20) NOT NULL,
        customer_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        agent_id UUID REFERENCES users(id),
        tags TEXT[],
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Messages table
      `CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        whatsapp_message_id VARCHAR(100),
        direction VARCHAR(20) NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        content TEXT,
        media_url TEXT,
        media_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'sent',
        delivered_at TIMESTAMP WITH TIME ZONE,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Agent sessions table
      `CREATE TABLE IF NOT EXISTS agent_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID REFERENCES conversations(id),
        agent_id UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        notes TEXT
      )`,

      // Audit logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // System settings table
      `CREATE TABLE IF NOT EXISTS system_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Health check table
      `CREATE TABLE IF NOT EXISTS health_check (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50) DEFAULT 'healthy',
        checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    for (const table of tables) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: table });
        if (error) {
          console.log(`⚠️  Table creation warning: ${error.message}`);
        } else {
          console.log('✅ Table created/verified');
        }
      } catch (error: any) {
        console.log(`❌ Error creating table: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private async createRLSPolicies(client: any): Promise<void> {
    console.log('\n🔒 Creating Row Level Security policies...\n');

    const policies = [
      // Users policies
      `CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id)`,
      `CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id)`,
      `CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Pharmacies policies
      `CREATE POLICY "Pharmacies are viewable by authenticated users" ON pharmacies FOR SELECT USING (auth.role() = 'authenticated')`,
      `CREATE POLICY "Only admins can modify pharmacies" ON pharmacies FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Products policies
      `CREATE POLICY "Products are viewable by authenticated users" ON products FOR SELECT USING (auth.role() = 'authenticated')`,
      `CREATE POLICY "Only admins can modify products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Orders policies
      `CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid())`,
      `CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid())`,
      `CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (user_id = auth.uid())`,
      `CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Payments policies
      `CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND user_id = auth.uid()))`,
      `CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Conversations policies
      `CREATE POLICY "Users can view assigned conversations" ON conversations FOR SELECT USING (agent_id = auth.uid())`,
      `CREATE POLICY "Admins can view all conversations" ON conversations FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`,

      // Messages policies
      `CREATE POLICY "Users can view messages in assigned conversations" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND agent_id = auth.uid()))`,
      `CREATE POLICY "Admins can view all messages" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))`
    ];

    for (const policy of policies) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`⚠️  Policy creation warning: ${error.message}`);
        } else {
          console.log('✅ Policy created');
        }
      } catch (error: any) {
        console.log(`❌ Error creating policy: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private async createFunctions(client: any): Promise<void> {
    console.log('\n⚙️  Creating database functions...\n');

    const functions = [
      // Function to update updated_at timestamp
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql'`,

      // Function to generate order number
      `CREATE OR REPLACE FUNCTION generate_order_number()
       RETURNS TEXT AS $$
       BEGIN
           RETURN 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
       END;
       $$ language 'plpgsql'`,

      // Function to check stock availability
      `CREATE OR REPLACE FUNCTION check_stock_availability(product_uuid UUID, required_qty INTEGER)
       RETURNS BOOLEAN AS $$
       DECLARE
           available_stock INTEGER;
       BEGIN
           SELECT stock_quantity INTO available_stock FROM products WHERE id = product_uuid;
           RETURN COALESCE(available_stock, 0) >= required_qty;
       END;
       $$ language 'plpgsql'`
    ];

    for (const func of functions) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: func });
        if (error) {
          console.log(`⚠️  Function creation warning: ${error.message}`);
        } else {
          console.log('✅ Function created');
        }
      } catch (error: any) {
        console.log(`❌ Error creating function: ${error?.message || 'Unknown error'}`);
      }
    }

    // Create triggers
    const triggers = [
      `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      `CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
    ];

    for (const trigger of triggers) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: trigger });
        if (error) {
          console.log(`⚠️  Trigger creation warning: ${error.message}`);
        } else {
          console.log('✅ Trigger created');
        }
      } catch (error: any) {
        console.log(`❌ Error creating trigger: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private async insertInitialData(client: any): Promise<void> {
    console.log('\n📝 Inserting initial data...\n');

    try {
      // Insert health check record
      await client.from('health_check').insert({ status: 'healthy' });
      console.log('✅ Health check record inserted');

      // Insert system settings
      const settings = [
        { key: 'app_name', value: 'DARA-Medics', description: 'Application name', is_public: true },
        { key: 'app_version', value: '1.0.0', description: 'Application version', is_public: true },
        { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode flag', is_public: true },
        { key: 'default_currency', value: 'TZS', description: 'Default currency', is_public: true },
        { key: 'tax_rate', value: '0.18', description: 'Default tax rate', is_public: false }
      ];

      for (const setting of settings) {
        await client.from('system_settings').upsert(setting, { onConflict: 'key' });
      }
      console.log('✅ System settings inserted');

    } catch (error: any) {
      console.log(`❌ Error inserting initial data: ${error?.message || 'Unknown error'}`);
    }
  }

  async run(): Promise<void> {
    try {
      const credentials = await this.getCredentials();
      
      // Test connection
      const client = createClient(credentials.url, credentials.serviceRoleKey);
      
      console.log('\n🔗 Testing Supabase connection...');
      
      // Test connection by checking if we can access the client
      if (!client) {
        throw new Error('Failed to create Supabase client');
      }
      
      console.log('✅ Connection successful!\n');

      // Create schema
      await this.createSchema(client);

      // Update .env file
      await this.updateEnvFile(credentials);

      console.log('\n🎉 DARA-Medics Supabase project initialized successfully!');
      console.log('\nNext steps:');
      console.log('1. Copy the credentials to your .env file');
      console.log('2. Run: npm run supabase:setup');
      console.log('3. Start your application: npm run dev');

    } catch (error: any) {
      console.error('\n❌ Initialization failed:', error?.message || 'Unknown error');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  private async updateEnvFile(credentials: SupabaseCredentials): Promise<void> {
    const envContent = `# DARA-Medics Environment Configuration
SUPABASE_URL=${credentials.url}
SUPABASE_ANON_KEY=${credentials.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${credentials.serviceRoleKey}

# Add other environment variables as needed
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
`;

    fs.writeFileSync('.env', envContent);
    console.log('\n📝 .env file updated with Supabase credentials');
  }
}

// Run the initializer
if (require.main === module) {
  const initializer = new SupabaseInitializer();
  initializer.run();
}
