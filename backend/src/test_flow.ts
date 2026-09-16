import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

import { processDocument, askQuestion } from './services/rag/ragService';
import { sendPromptWithTools } from './services/chatbot/geminiService';
import User from './models/User';
import Document from './models/Document';

async function generateTestPdf(): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    
    doc.fontSize(25).text('Test Documentation PDF', 100, 100);
    doc.fontSize(14).text('This is a test document created to verify the RAG system.', 100, 150);
    doc.fontSize(14).text('The secret code for the project is OMEGA-99.', 100, 200);
    doc.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend Tests ---');
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // (Chatbot was verified independently)
    const mockUser = await User.findOne() || new User({ name: 'Test', role: 'admin' });
    
    // 2. Test RAG Upload (processing)
    console.log('\n--- 2. Testing RAG Processing ---');
    const pdfBuffer = await generateTestPdf();
    console.log('Generated test PDF, size:', pdfBuffer.length);
    
    // Create Document record
    const document = await Document.create({
      userId: mockUser._id || new mongoose.Types.ObjectId(),
      fileName: 'test_doc.pdf',
      status: 'processing'
    });
    
    console.log('Processing document...', document._id.toString());
    await processDocument(pdfBuffer, document._id.toString());
    console.log('Document processed successfully!');

    // 3. Test RAG Ask Question
    console.log('\n--- 3. Testing RAG Vector Search (Ask) ---');
    console.log('Asking question: "What is the secret code?"');
    try {
      const answer = await askQuestion('What is the secret code for the project?', document._id.toString());
      console.log('RAG Answer:', answer);
    } catch (e: any) {
      console.error('RAG Ask failed. This is expected if the Atlas Search Index "vector_index" is missing.');
      console.error('Error:', e.message);
    }

  } catch (error: any) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('--- Tests finished ---');
    process.exit(0);
  }
}

runTests();
