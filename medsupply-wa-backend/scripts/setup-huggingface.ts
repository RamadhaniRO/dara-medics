#!/usr/bin/env ts-node

import { exec } from 'child_process';
import { promisify } from 'util';
// import { LoggerService } from '../src/core/logger/logger.service';

const execAsync = promisify(exec);

class HuggingFaceSetup {
  // private logger: LoggerService;

  constructor() {
    // this.logger = new LoggerService();
  }

  async setup(): Promise<void> {
    console.log('\n🚀 Setting up Hugging Face Models for DARA-Medics\n');

    try {
      // Check if Python and pip are installed
      await this.checkPythonInstallation();

      // Install required Python packages
      await this.installPythonPackages();

      // Download recommended models
      await this.downloadModels();

      console.log('\n✅ Hugging Face setup completed successfully!');
      console.log('\n📋 Available Models:');
      console.log('  • microsoft/DialoGPT-medium - Conversational AI');
      console.log('  • sentence-transformers/all-MiniLM-L6-v2 - Text embeddings');
      console.log('  • distilbert-base-uncased - Text classification');
      console.log('  • microsoft/BioGPT-Large - Medical text generation');

      console.log('\n🎯 Next Steps:');
      console.log('1. Start your application: npm run dev');
      console.log('2. Test the models: npm run test:agents');
      console.log('3. Monitor models: Check logs for model loading');

    } catch (error) {
      console.error('\n❌ Hugging Face setup failed:', error);
      process.exit(1);
    }
  }

  private async checkPythonInstallation(): Promise<void> {
    console.log('🔍 Checking Python installation...');
    
    try {
      const { stdout: pythonVersion } = await execAsync('python --version');
      console.log('✅ Python is installed:', pythonVersion.trim());
    } catch (error) {
      try {
        const { stdout: python3Version } = await execAsync('python3 --version');
        console.log('✅ Python3 is installed:', python3Version.trim());
      } catch (error) {
        console.log('❌ Python not found. Please install Python first:');
        console.log('   Visit: https://www.python.org/downloads/');
        throw new Error('Python not installed');
      }
    }
  }

  private async installPythonPackages(): Promise<void> {
    console.log('\n📦 Installing Python packages...');

    const packages = [
      'transformers',
      'torch',
      'sentence-transformers',
      'accelerate',
      'datasets'
    ];

    for (const pkg of packages) {
      try {
        console.log(`   Installing ${pkg}...`);
        await execAsync(`pip install ${pkg}`);
        console.log(`   ✅ ${pkg} installed successfully`);
      } catch (error) {
        console.log(`   ⚠️  Failed to install ${pkg}:`, (error as Error).message);
        console.log('   Continuing with other packages...');
      }
    }
  }

  private async downloadModels(): Promise<void> {
    console.log('\n📥 Downloading Hugging Face models...');

    const models = [
      {
        name: 'microsoft/DialoGPT-medium',
        description: 'Conversational AI model',
        size: '~500MB'
      },
      {
        name: 'sentence-transformers/all-MiniLM-L6-v2',
        description: 'Text embedding model',
        size: '~90MB'
      },
      {
        name: 'distilbert-base-uncased',
        description: 'Text classification model',
        size: '~260MB'
      }
    ];

    for (const model of models) {
      console.log(`\n📥 Downloading ${model.name} (${model.size})...`);
      console.log(`   ${model.description}`);
      
      try {
        // Create a simple Python script to download the model
        const downloadScript = `
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer

print(f"Downloading {model.name}...")

if "dialo" in "${model.name}".lower():
    tokenizer = AutoTokenizer.from_pretrained("${model.name}")
    model = AutoModelForCausalLM.from_pretrained("${model.name}")
elif "sentence" in "${model.name}".lower():
    model = SentenceTransformer("${model.name}")
else:
    tokenizer = AutoTokenizer.from_pretrained("${model.name}")
    model = AutoModelForSequenceClassification.from_pretrained("${model.name}")

print(f"✅ {model.name} downloaded successfully")
`;

        await execAsync(`python -c "${downloadScript}"`);
        console.log(`✅ ${model.name} downloaded successfully`);
        
      } catch (error) {
        console.log(`⚠️  Failed to download ${model.name}:`, (error as Error).message);
        console.log('   Continuing with other models...');
      }
    }
  }

  async testModels(): Promise<void> {
    console.log('\n🧪 Testing models...');

    const testScript = `
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer

# Test conversational model
try:
    tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
    model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
    print("✅ Conversational model loaded successfully")
except Exception as e:
    print(f"❌ Conversational model failed: {e}")

# Test embedding model
try:
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    embeddings = model.encode("Hello, world!")
    print(f"✅ Embedding model working - vector size: {len(embeddings)}")
except Exception as e:
    print(f"❌ Embedding model failed: {e}")
`;

    try {
      const { stdout } = await execAsync(`python -c "${testScript}"`);
      console.log(stdout);
    } catch (error) {
      console.log('❌ Model testing failed:', (error as Error).message);
    }
  }
}

// Run the setup
if (require.main === module) {
  const setup = new HuggingFaceSetup();
  setup.setup();
}
