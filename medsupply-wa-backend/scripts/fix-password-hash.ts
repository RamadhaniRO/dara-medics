#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

async function fixPasswordHashColumn() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log('❌ Missing Supabase configuration in .env file');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  try {
    console.log('🔧 Making password_hash column nullable...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;'
    });

    if (error) {
      console.log('❌ Error:', error);
    } else {
      console.log('✅ password_hash column is now nullable');
    }

    // Test by inserting a user without password_hash
    console.log('🧪 Testing with a user without password_hash...');
    
    const { error: testError } = await supabase
      .from('users')
      .insert({
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'pharmacy',
        pharmacy_id: null,
        phone: '',
        is_verified: false,
        password_hash: null // This should work now
      });

    if (testError) {
      console.log('❌ Test failed:', testError);
    } else {
      console.log('✅ Test successful - users can now be created without password_hash');
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      console.log('🧹 Test user cleaned up');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

fixPasswordHashColumn();
