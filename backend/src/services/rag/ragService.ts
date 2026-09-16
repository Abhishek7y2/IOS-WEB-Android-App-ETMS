import { extractTextFromPdf } from './pdfExtractor';
import { chunkText } from './chunkingService';
import { generateEmbedding, generateEmbeddingsBatch } from './embeddingService';
import { storeChunkEmbedding, storeChunkEmbeddingsBatch, vectorSearch } from './vectorStore';
import { sendPromptWithTools } from '../chatbot/geminiService';
import Document from '../../models/Document';
import DocumentChunk from '../../models/DocumentChunk';

export const processDocument = async (fileBuffer: Buffer, documentId: string) => {
  try {
    const doc = await Document.findById(documentId).populate('userId');
    if (!doc) throw new Error('Document not found');

    const fileName = doc.fileName;
    const uploaderId = doc.userId._id;
    const uploaderRole = doc.userId.role || 'user'; // Fallback if missing

    // 1. Extract text from PDF
    const text = await extractTextFromPdf(fileBuffer);
    
    // 2. Chunk text
    const chunks = chunkText(text);

    // 2.5 Delete any existing chunks for this document (for re-uploads/re-indexing)
    await DocumentChunk.deleteMany({ documentId });

    // 3. Generate embeddings and store in Vector DB in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const chunkBatch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await generateEmbeddingsBatch(chunkBatch);
      
      const chunkData = chunkBatch.map((chunkText, index) => ({
        documentId,
        text: chunkText,
        embedding: embeddings[index],
        chunkIndex: i + index,
        fileName,
        uploaderId,
        uploaderRole,
        pageNumber: null
      }));

      await storeChunkEmbeddingsBatch(chunkData);
    }

    // 4. Update status to completed
    await Document.findByIdAndUpdate(documentId, { status: 'completed' });
    return true;
  } catch (error) {
    console.error('Error processing document for RAG:', error);
    await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    throw error;
  }
};

export const askQuestion = async (question: string, documentId: string) => {
  // 0. Check document status for parsing/corruption failures
  const doc = await Document.findById(documentId);
  if (!doc) {
    return "This document no longer exists in the system.";
  }
  if (doc.status === 'failed') {
    return "This document failed to process (it may be corrupt or unreadable). I cannot answer questions about it.";
  }
  if (doc.status === 'processing') {
    return "This document is still being processed. Please try again in a few moments.";
  }

  // 1. Embed user question with failure handling
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(question);
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return "The AI embedding service is currently unavailable or timed out. Please try your question again later.";
  }

  const topK = parseInt(process.env.RAG_TOP_K || '5', 10);
  const minScore = parseFloat(process.env.RAG_MIN_SCORE || '0.7');

  // 2. Search for relevant chunks
  let topChunks = await vectorSearch(queryEmbedding, documentId, topK);
  
  // 3. Filter by similarity cutoff
  topChunks = topChunks.filter(chunk => chunk.score >= minScore);
  
  if (!topChunks || topChunks.length === 0) {
    return "I couldn't find any highly relevant information in the document to answer your question.";
  }

  // 4. Build context from top chunks with citations
  const context = topChunks.map((chunk: any) => {
    const pageInfo = chunk.pageNumber ? `(Page ${chunk.pageNumber})` : '';
    return `[Source: ${chunk.fileName} ${pageInfo}]\n${chunk.text}`;
  }).join('\n\n---\n\n');

  // 5. Construct prompt and call LLM (Gemini)
  const systemPrompt = `You are an intelligent document assistant. Below is context extracted from the user's uploaded document. 
Answer the user's question based strictly on the context provided. Do not use outside knowledge. 
If the answer is not in the context, clearly state that you don't know based on the document.
Crucially, you MUST cite your sources in your Markdown response using the [Source: ...] blocks provided in the context (e.g., "According to [Source: HR_Policy.pdf (Page 2)]...").

Context:
${context}`;
  
  const response = await sendPromptWithTools(systemPrompt, [], question, []);
  
  // Handling the possibility of functionCalls or raw text from geminiService
  let finalAnswer = '';
  try {
    finalAnswer = response.text();
  } catch (e) {
    finalAnswer = "Unable to extract a textual answer from the model.";
  }

  return finalAnswer;
};

export const searchUserDocuments = async (question: string, userId: string, role: string) => {
  // 1. Fetch documents based on Role-Based Access Control (RBAC)
  let query: any = { status: 'completed' };
  
  if (role !== 'admin' && role !== 'superadmin') {
    // Normal users can ONLY see their own documents
    query.userId = userId;
  }
  // Admins can see ALL completed documents across the workspace

  const documents = await Document.find(query);
  if (!documents || documents.length === 0) {
    return role === 'admin' 
      ? "There are no processed documents available in the workspace." 
      : "You have not uploaded any documents yet, or none have finished processing.";
  }
  const documentIds = documents.map(d => d._id.toString());

  // 2. Embed user question with failure handling
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(question);
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return "The AI embedding service is currently unavailable or timed out. Please try your question again later.";
  }
  
  const topK = parseInt(process.env.RAG_TOP_K || '5', 10);
  const minScore = parseFloat(process.env.RAG_MIN_SCORE || '0.7');

  // 3. Search for relevant chunks across all user documents
  let topChunks = await vectorSearch(queryEmbedding, documentIds, topK);
  
  // 4. Filter by similarity cutoff
  topChunks = topChunks.filter(chunk => chunk.score >= minScore);
  
  if (!topChunks || topChunks.length === 0) {
    return "I couldn't find any highly relevant information in your uploaded documents to answer this question.";
  }

  // 5. Build context with citations
  const context = topChunks.map((chunk: any) => {
    const pageInfo = chunk.pageNumber ? `(Page ${chunk.pageNumber})` : '';
    return `[Source: ${chunk.fileName} ${pageInfo}]\n${chunk.text}`;
  }).join('\n\n---\n\n');

  // 6. Construct prompt and call LLM
  const systemPrompt = `You are an intelligent document assistant. Below is context extracted from the user's uploaded documents. 
Answer the user's question based strictly on the context provided. Do not use outside knowledge. 
If the answer is not in the context, clearly state that you don't know based on the documents.
Crucially, you MUST cite your sources in your Markdown response using the [Source: ...] blocks provided in the context (e.g., "According to [Source: HR_Policy.pdf (Page 2)]...").

Context:
${context}`;
  
  const response = await sendPromptWithTools(systemPrompt, [], question, []);
  
  let finalAnswer = '';
  try {
    finalAnswer = response.text();
  } catch (e) {
    finalAnswer = "Unable to extract a textual answer from the model.";
  }

  return finalAnswer;
};
