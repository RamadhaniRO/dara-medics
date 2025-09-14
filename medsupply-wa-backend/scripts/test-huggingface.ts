#!/usr/bin/env ts-node

import { HuggingFaceService } from '../src/core/llm/huggingface.service';
import { RAGService } from '../src/rag/rag.service';

async function testHuggingFace() {
  console.log('\n🧪 Testing Hugging Face Integration\n');

  try {
    // Test Hugging Face Service
    console.log('1. Testing Hugging Face Service...');
    const hfService = new HuggingFaceService(null, null as any);
    await hfService.initialize();

    // Test text generation
    console.log('2. Testing text generation...');
    const textResponse = await hfService.generateText('Hello, how are you?');
    console.log('✅ Text generation:', textResponse.substring(0, 100) + '...');

    // Test embeddings
    console.log('3. Testing embeddings...');
    const embeddingResponse = await hfService.generateEmbeddings('This is a test sentence');
    console.log('✅ Embeddings generated:', embeddingResponse.length, 'dimensions');

    // Test RAG Service
    console.log('4. Testing RAG Service...');
    const ragService = new RAGService();
    await ragService.initialize();

    // Test health check
    const health = await ragService.getServiceHealth();
    console.log('✅ RAG Health:', health);

    console.log('\n🎉 All tests passed! Hugging Face integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testHuggingFace();
}
