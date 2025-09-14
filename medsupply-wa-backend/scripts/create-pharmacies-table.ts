#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

class PharmaciesTableCreator {
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

  async createPharmaciesTable(): Promise<void> {
    console.log('🏥 Creating pharmacies table...');
    
    try {
      // Try to create a test pharmacy to see if the table exists
      const testPharmacy = {
        name: 'Test Pharmacy',
        license_number: 'TEST123',
        contact_person: 'Test Owner',
        phone: '+1234567890',
        email: 'test@pharmacy.com',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        country: 'Tanzania',
        postal_code: '12345',
        delivery_radius: 10,
        delivery_fee: 0,
        min_order_amount: 0,
        active: true,
        verified: false
      };

      const { data, error } = await this.client
        .from('pharmacies')
        .insert(testPharmacy)
        .select()
        .single();

      if (error) {
        console.log('⚠️  Pharmacies table issue:', error.message);
        
        // If table doesn't exist, we need to create it
        if (error.code === 'PGRST116' || error.message.includes('relation "pharmacies" does not exist')) {
          console.log('📋 Creating pharmacies table...');
          
          // Create the table using SQL
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS pharmacies (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              license_number VARCHAR(100),
              contact_person VARCHAR(255) NOT NULL,
              phone VARCHAR(20) NOT NULL,
              email VARCHAR(255) NOT NULL UNIQUE,
              address TEXT,
              city VARCHAR(100),
              state VARCHAR(100),
              country VARCHAR(100) DEFAULT 'Tanzania',
              postal_code VARCHAR(20),
              latitude DECIMAL(10, 8),
              longitude DECIMAL(11, 8),
              business_hours JSONB,
              delivery_radius INTEGER DEFAULT 10,
              delivery_fee DECIMAL(10, 2) DEFAULT 0,
              min_order_amount DECIMAL(10, 2) DEFAULT 0,
              active BOOLEAN DEFAULT true,
              verified BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              metadata JSONB
            );
          `;

          const { error: createError } = await this.client.rpc('exec_sql', {
            sql: createTableSQL
          });

          if (createError) {
            console.log('❌ Failed to create pharmacies table:', createError.message);
            return;
          }

          console.log('✅ Pharmacies table created successfully');
          
          // Try inserting the test pharmacy again
          const { data: retryData, error: retryError } = await this.client
            .from('pharmacies')
            .insert(testPharmacy)
            .select()
            .single();

          if (retryError) {
            console.log('❌ Failed to insert test pharmacy:', retryError.message);
            return;
          }

          console.log('✅ Test pharmacy inserted successfully:', retryData.id);
          
          // Clean up test data
          await this.client
            .from('pharmacies')
            .delete()
            .eq('id', retryData.id);
            
          console.log('🧹 Test data cleaned up');
        }
      } else {
        console.log('✅ Pharmacies table already exists and is working');
        console.log('📋 Test pharmacy inserted:', data.id);
        
        // Clean up test data
        await this.client
          .from('pharmacies')
          .delete()
          .eq('id', data.id);
          
        console.log('🧹 Test data cleaned up');
      }
    } catch (error) {
      console.log('❌ Error creating pharmacies table:', error);
    }
  }

  async testPharmacyOperations(): Promise<void> {
    console.log('🧪 Testing pharmacy operations...');
    
    try {
      // Test creating a pharmacy
      const testPharmacy = {
        name: 'Test Pharmacy Operations',
        license_number: 'TEST456',
        contact_person: 'Test Owner',
        phone: '+1234567890',
        email: 'testops@pharmacy.com',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        country: 'Tanzania',
        postal_code: '12345',
        delivery_radius: 10,
        delivery_fee: 0,
        min_order_amount: 0,
        active: true,
        verified: false
      };

      const { data: createData, error: createError } = await this.client
        .from('pharmacies')
        .insert(testPharmacy)
        .select()
        .single();

      if (createError) {
        console.log('❌ Failed to create test pharmacy:', createError.message);
        return;
      }

      console.log('✅ Pharmacy created:', createData.id);

      // Test retrieving the pharmacy
      const { data: retrieveData, error: retrieveError } = await this.client
        .from('pharmacies')
        .select('*')
        .eq('id', createData.id)
        .single();

      if (retrieveError) {
        console.log('❌ Failed to retrieve pharmacy:', retrieveError.message);
        return;
      }

      console.log('✅ Pharmacy retrieved:', retrieveData.name);

      // Test updating the pharmacy
      const { data: updateData, error: updateError } = await this.client
        .from('pharmacies')
        .update({ 
          name: 'Updated Test Pharmacy',
          updated_at: new Date().toISOString()
        })
        .eq('id', createData.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Failed to update pharmacy:', updateError.message);
        return;
      }

      console.log('✅ Pharmacy updated:', updateData.name);

      // Clean up
      await this.client
        .from('pharmacies')
        .delete()
        .eq('id', createData.id);

      console.log('🧹 Test pharmacy cleaned up');
      console.log('✅ All pharmacy operations working correctly');

    } catch (error) {
      console.log('❌ Error testing pharmacy operations:', error);
    }
  }
}

// Main execution
async function main() {
  const creator = new PharmaciesTableCreator();
  
  console.log('🚀 Starting pharmacies table setup...');
  await creator.createPharmaciesTable();
  await creator.testPharmacyOperations();
  console.log('🎉 Pharmacies table setup complete!');
}

main().catch(console.error);
