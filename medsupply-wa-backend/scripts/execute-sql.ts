#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load environment variables
config();

class SQLExecutor {
  private client: any;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.log('❌ Missing Supabase configuration in .env file');
      console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
      process.exit(1);
    }

    this.client = createClient(url, serviceKey);
  }

  async executeSQLFile(filePath: string): Promise<void> {
    console.log(`📄 Reading SQL file: ${filePath}\n`);
    
    try {
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Split by semicolon and clean up statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => 
          stmt.length > 0 && 
          !stmt.startsWith('--') && 
          !stmt.startsWith('/*') &&
          stmt !== ''
        );

      console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        if (statement.length === 0) continue;

        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          // Use the REST API to execute SQL
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || ''
          };

          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ sql: statement })
          });

          if (response.ok) {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          } else {
            const errorText = await response.text();
            console.log(`⚠️  Statement ${i + 1} warning: ${response.status} - ${errorText}`);
            errorCount++;
          }
        } catch (error: any) {
          console.log(`❌ Statement ${i + 1} error: ${error.message}`);
          errorCount++;
        }
      }

      console.log(`\n📊 Execution Summary:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`⚠️  Warnings: ${errorCount}`);
      console.log(`📄 Total statements: ${statements.length}`);

    } catch (error: any) {
      console.log('❌ Error reading or executing SQL file:', error.message);
    }
  }

  async testConnection(): Promise<boolean> {
    console.log('🔗 Testing Supabase connection...');
    
    try {
      const { error } = await this.client.from('health_check').select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
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

  async run(): Promise<void> {
    console.log('🚀 DARA-Medics SQL Executor\n');
    
    const connected = await this.testConnection();
    
    if (connected) {
      await this.executeSQLFile('scripts/create-tables.sql');
      
      console.log('\n🎉 SQL execution completed!');
      console.log('\nNext steps:');
      console.log('1. Test the authentication flow: npm run supabase:test');
      console.log('2. Start the backend server: npm run dev');
      console.log('3. Start the frontend: cd ../medsupply-wa-frontend && npm start');
    } else {
      console.log('\n❌ Please check your Supabase configuration and try again.');
    }
  }
}

// Run the executor
if (require.main === module) {
  const executor = new SQLExecutor();
  executor.run().catch(console.error);
}
