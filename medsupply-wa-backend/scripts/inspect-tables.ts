#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

class TableInspector {
  private client: any;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.log('❌ Missing Supabase configuration in .env file');
      process.exit(1);
    }

    this.client = createClient(url, serviceKey);
  }

  async inspectUsersTable(): Promise<void> {
    console.log('🔍 Inspecting users table structure...\n');
    
    try {
      // Try to get a sample user to see the structure
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        console.log('❌ Error accessing users table:', error.message);
        return;
      }

      if (data && data.length > 0) {
        console.log('📋 Users table structure:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('📋 Users table is empty, trying to create a test user...');
        
        // Try different user structures to see what works
        const testUsers = [
          {
            email: 'test1@example.com',
            password_hash: '$2a$10$test.hash.for.testing.purposes.only',
            name: 'Test User 1',
            role: 'pharmacy'
          },
          {
            email: 'test2@example.com',
            password_hash: '$2a$10$test.hash.for.testing.purposes.only',
            full_name: 'Test User 2',
            role: 'pharmacy'
          },
          {
            email: 'test3@example.com',
            password_hash: '$2a$10$test.hash.for.testing.purposes.only',
            name: 'Test User 3',
            role: 'pharmacy',
            phone_number: '+1234567890'
          }
        ];

        for (const testUser of testUsers) {
          const { data: insertData, error: insertError } = await this.client
            .from('users')
            .insert(testUser)
            .select()
            .single();

          if (insertError) {
            console.log(`❌ Failed to insert user with structure:`, Object.keys(testUser));
            console.log(`   Error: ${insertError.message}`);
          } else {
            console.log(`✅ Successfully inserted user with structure:`, Object.keys(testUser));
            console.log('📋 User data:', JSON.stringify(insertData, null, 2));
            
            // Clean up
            await this.client.from('users').delete().eq('id', insertData.id);
            break;
          }
        }
      }
    } catch (error: any) {
      console.log('❌ Error inspecting users table:', error.message);
    }
  }

  async inspectAllTables(): Promise<void> {
    console.log('🔍 Inspecting all table structures...\n');
    
    const tables = ['users', 'pharmacies', 'products', 'orders', 'order_items', 'payments', 'conversations', 'messages', 'health_check'];
    
    for (const table of tables) {
      try {
        const { data, error } = await this.client
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log(`✅ ${table}: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`📋 ${table}: Empty table`);
        }
      } catch (error: any) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
  }

  async run(): Promise<void> {
    console.log('🚀 DARA-Medics Supabase Table Inspector\n');
    
    await this.inspectUsersTable();
    console.log('\n');
    await this.inspectAllTables();
    
    console.log('\n🎉 Table inspection completed!');
  }
}

// Run the inspector
if (require.main === module) {
  const inspector = new TableInspector();
  inspector.run().catch(console.error);
}
