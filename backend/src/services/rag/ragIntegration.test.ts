import mongoose from 'mongoose';
import { processDocument, askQuestion } from './ragService';
import { extractTextFromPdf } from './pdfExtractor';
import { generateEmbeddingsBatch, generateEmbedding } from './embeddingService';
import { storeChunkEmbeddingsBatch, vectorSearch } from './vectorStore';
import { sendPromptWithTools } from '../chatbot/geminiService';
import Document from '../../models/Document';
import DocumentChunk from '../../models/DocumentChunk';

// Mock dependencies (factory functions must not reference unhoisted outer variables)
jest.mock('./pdfExtractor', () => ({
  __esModule: true,
  extractTextFromPdf: jest.fn()
}));

jest.mock('./embeddingService', () => ({
  __esModule: true,
  generateEmbeddingsBatch: jest.fn(),
  generateEmbedding: jest.fn()
}));

jest.mock('./vectorStore', () => ({
  __esModule: true,
  storeChunkEmbeddingsBatch: jest.fn(),
  vectorSearch: jest.fn()
}));

jest.mock('../chatbot/geminiService', () => ({
  __esModule: true,
  sendPromptWithTools: jest.fn()
}));

jest.mock('../../models/DocumentChunk', () => ({
  __esModule: true,
  default: { deleteMany: jest.fn() },
  deleteMany: jest.fn()
}));

jest.mock('../../models/Document', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  },
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const mockDocument = {
  _id: new mongoose.Types.ObjectId().toString(),
  fileName: 'test.pdf',
  userId: {
    _id: new mongoose.Types.ObjectId().toString(),
    role: 'user'
  },
  status: 'processing'
};

describe('RAG Pipeline Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockDocProcessing = { ...mockDocument, status: 'processing' };
    const mockDocCompleted = { ...mockDocument, status: 'completed' };

    (Document.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockDocProcessing),
      then: (resolve: any) => Promise.resolve(mockDocCompleted).then(resolve)
    }));

    (Document.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDocument);

    process.env.CHUNK_SIZE = '100';
    process.env.CHUNK_OVERLAP = '20';
    process.env.RAG_TOP_K = '3';
    process.env.RAG_MIN_SCORE = '0.7';
  });

  afterEach(() => {
    delete process.env.CHUNK_SIZE;
    delete process.env.CHUNK_OVERLAP;
    delete process.env.RAG_TOP_K;
    delete process.env.RAG_MIN_SCORE;
  });

  it('should successfully upload, chunk, embed, and query a document', async () => {
    // --- 1. UPLOAD & PROCESS ---
    const mockFileBuffer = Buffer.from('mock pdf content');
    const mockExtractedText = 'This is a long document. It has several sentences. Let us pretend this is enough to chunk.';
    
    (extractTextFromPdf as jest.Mock).mockResolvedValue(mockExtractedText);
    
    // Mock the batch embeddings return
    (generateEmbeddingsBatch as jest.Mock).mockResolvedValue([
      [0.1, 0.2], // Embedding for chunk 1
      [0.3, 0.4]  // Embedding for chunk 2
    ]);

    await processDocument(mockFileBuffer, mockDocument._id.toString());

    // Verify chunking & deletion
    expect(DocumentChunk.deleteMany).toHaveBeenCalledWith({ documentId: mockDocument._id.toString() });
    expect(extractTextFromPdf).toHaveBeenCalledWith(mockFileBuffer);
    expect(generateEmbeddingsBatch).toHaveBeenCalled();
    expect(storeChunkEmbeddingsBatch).toHaveBeenCalled();
    
    // Check what was stored
    const storedChunks = (storeChunkEmbeddingsBatch as jest.Mock).mock.calls[0][0];
    expect(storedChunks.length).toBeGreaterThan(0);
    expect(storedChunks[0].fileName).toBe('test.pdf');
    expect(storedChunks[0].uploaderRole).toBe('user');
    
    // Verify document marked as completed
    expect(Document.findByIdAndUpdate).toHaveBeenCalledWith(mockDocument._id.toString(), { status: 'completed' });

    // --- 2. QUERY / RETRIEVE ---
    const mockQuestion = 'What is in the document?';
    
    // Mock user question embed
    (generateEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2]);
    
    // Mock vector search results (ensure score >= minScore)
    (vectorSearch as jest.Mock).mockResolvedValue([
      { text: 'This is a long document.', fileName: 'test.pdf', pageNumber: null, score: 0.8 },
      { text: 'It has several sentences.', fileName: 'test.pdf', pageNumber: null, score: 0.75 }
    ]);

    // Mock Gemini response
    (sendPromptWithTools as jest.Mock).mockResolvedValue({
      text: () => 'Based on test.pdf, it is a long document.'
    });

    const answer = await askQuestion(mockQuestion, mockDocument._id.toString());

    // Verify vector search called with query embedding and topK
    expect(vectorSearch).toHaveBeenCalledWith([0.1, 0.2], mockDocument._id.toString(), 3);
    
    // Verify gemini was called
    expect(sendPromptWithTools).toHaveBeenCalled();
    const systemPrompt = (sendPromptWithTools as jest.Mock).mock.calls[0][0];
    
    // Verify citation structure in prompt
    expect(systemPrompt).toContain('[Source: test.pdf ]');
    
    // Verify final output
    expect(answer).toBe('Based on test.pdf, it is a long document.');
  });
});
