#!/usr/bin/env ts-node

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load current environment
config();

console.log('🔄 Updating environment configuration for DARA-Medics...\n');

const envPath = path.join(process.cwd(), '.env');
// const envExamplePath = path.join(process.cwd(), 'env.example');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Please run npm run supabase:init first.');
  process.exit(1);
}

// Read current .env
const currentEnv = fs.readFileSync(envPath, 'utf8');

// Update project references
const updatedEnv = currentEnv
  .replace(/MedSupply-WA/g, 'DARA-Medics')
  .replace(/medsupply-wa/g, 'dara-medics')
  .replace(/MedSupply/g, 'DARA-Medics');

// Write updated .env
fs.writeFileSync(envPath, updatedEnv);

console.log('✅ Environment configuration updated successfully!');
console.log('\nUpdated references:');
console.log('- MedSupply-WA → DARA-Medics');
console.log('- medsupply-wa → dara-medics');
console.log('- MedSupply → DARA-Medics');

console.log('\n🚀 You can now run: npm run supabase:setup');
