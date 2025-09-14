#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

class AuthTableCreator {
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

  async createUsersTable(): Promise<void> {
    console.log('👤 Creating users table...');
    
    try {
      // Try to create a user to test if the table exists and has the right structure
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
        console.log('⚠️  Users table issue:', error.message);
        
        // Try with different field names
        const testUser2 = {
          email: 'test2@example.com',
          password_hash: '$2a$10$test.hash.for.testing.purposes.only',
          full_name: 'Test User 2',
          role: 'pharmacy',
          phone_number: '+1234567890'
        };

        const { data: data2, error: error2 } = await this.client
          .from('users')
          .insert(testUser2)
          .select()
          .single();

        if (error2) {
          console.log('⚠️  Users table structure issue:', error2.message);
          console.log('📋 The users table may need to be created manually in Supabase dashboard');
        } else {
          console.log('✅ Users table works with different field names');
          console.log('📋 User structure:', Object.keys(data2));
          
          // Clean up
          await this.client.from('users').delete().eq('id', data2.id);
        }
      } else {
        console.log('✅ Users table created and tested successfully!');
        console.log('📋 User structure:', Object.keys(data));
        
        // Clean up
        await this.client.from('users').delete().eq('id', data.id);
      }
    } catch (error: any) {
      console.log('❌ Error testing users table:', error.message);
    }
  }

  async testAuthenticationFlow(): Promise<void> {
    console.log('\n🔐 Testing authentication flow...');
    
    try {
      // Test user registration
      const newUser = {
        email: 'auth-test@example.com',
        password_hash: '$2a$10$test.hash.for.testing.purposes.only',
        name: 'Auth Test User',
        role: 'pharmacy',
        phone: '+1234567890',
        is_verified: false,
        two_factor_enabled: false,
        login_attempts: 0
      };

      const { data: userData, error: createError } = await this.client
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.log('❌ User creation failed:', createError.message);
        return;
      }

      console.log('✅ User creation successful!');

      // Test user retrieval
      const { data: retrievedUser, error: readError } = await this.client
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (readError) {
        console.log('❌ User retrieval failed:', readError.message);
      } else {
        console.log('✅ User retrieval successful!');
        console.log('📋 Retrieved user:', {
          id: retrievedUser.id,
          email: retrievedUser.email,
          name: retrievedUser.name,
          role: retrievedUser.role
        });
      }

      // Test user update
      const { error: updateError } = await this.client
        .from('users')
        .update({ is_verified: true })
        .eq('id', userData.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ User update failed:', updateError.message);
      } else {
        console.log('✅ User update successful!');
      }

      // Clean up
      await this.client.from('users').delete().eq('id', userData.id);
      console.log('✅ Test user cleaned up');

    } catch (error: any) {
      console.log('❌ Authentication flow test failed:', error.message);
    }
  }

  async run(): Promise<void> {
    console.log('🚀 DARA-Medics Authentication Table Creator\n');
    
    await this.createUsersTable();
    await this.testAuthenticationFlow();
    
    console.log('\n🎉 Authentication table testing completed!');
    console.log('\nNext steps:');
    console.log('1. If tables need to be created, use the Supabase dashboard');
    console.log('2. Test the backend authentication: npm run dev');
    console.log('3. Test the frontend: cd ../medsupply-wa-frontend && npm start');
  }
}

// Run the creator
if (require.main === module) {
  const creator = new AuthTableCreator();
  creator.run().catch(console.error);
}
