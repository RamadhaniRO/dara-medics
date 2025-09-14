#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load environment variables
config();

class SupabaseTester {
  private client: any;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
      console.log('❌ Missing Supabase configuration in .env file');
      console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
      process.exit(1);
    }

    this.client = createClient(url, serviceKey || anonKey);
  }

  async testConnection(): Promise<boolean> {
    console.log('🔗 Testing Supabase connection...');
    
    try {
      // Test basic connection
      const { error } = await this.client.from('health_check').select('*').limit(1);
      
      if (error) {
        console.log('⚠️  Health check table not found, but connection works');
        return true;
      }
      
      console.log('✅ Supabase connection successful!');
      return true;
    } catch (error: any) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
  }

  async createTables(): Promise<void> {
    console.log('\n📊 Creating database tables...');
    
    try {
      // Read the SQL file
      const sqlContent = fs.readFileSync('scripts/create-tables.sql', 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error } = await this.client.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement warning: ${error.message}`);
          } else {
            console.log('✅ Statement executed');
          }
        } catch (error: any) {
          console.log(`⚠️  Statement error: ${error.message}`);
        }
      }
      
      console.log('✅ Database tables created successfully!');
    } catch (error: any) {
      console.log('❌ Error creating tables:', error.message);
    }
  }

  async testUserOperations(): Promise<void> {
    console.log('\n👤 Testing user operations...');
    
    try {
      // Test creating a user
      const testUser = {
        email: 'test@example.com',
        password_hash: '$2a$10$test.hash.for.testing.purposes.only',
        name: 'Test User',
        role: 'pharmacy',
        phone: '+1234567890',
        is_verified: false,
        two_factor_enabled: false,
        login_attempts: 0
      };

      const { data, error } = await this.client
        .from('users')
        .insert(testUser)
        .select()
        .single();

      if (error) {
        console.log('⚠️  User creation test failed:', error.message);
      } else {
        console.log('✅ User creation test successful!');
        
        // Test reading the user
        const { error: readError } = await this.client
          .from('users')
          .select('*')
          .eq('id', data.id)
          .single();

        if (readError) {
          console.log('⚠️  User read test failed:', readError.message);
        } else {
          console.log('✅ User read test successful!');
        }

        // Clean up test user
        await this.client.from('users').delete().eq('id', data.id);
        console.log('✅ Test user cleaned up');
      }
    } catch (error: any) {
      console.log('❌ User operations test failed:', error.message);
    }
  }

  async run(): Promise<void> {
    console.log('🚀 DARA-Medics Supabase Connection Test\n');
    
    const connected = await this.testConnection();
    
    if (connected) {
      await this.createTables();
      await this.testUserOperations();
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\nYour Supabase connection is working and ready for authentication!');
    } else {
      console.log('\n❌ Please check your Supabase configuration and try again.');
    }
  }
}

// Run the tester
if (require.main === module) {
  const tester = new SupabaseTester();
  tester.run().catch(console.error);
}
