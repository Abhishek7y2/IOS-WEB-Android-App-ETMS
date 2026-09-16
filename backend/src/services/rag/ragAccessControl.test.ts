import mongoose from 'mongoose';
import { searchUserDocuments } from './ragService';
import Document from '../../models/Document';

// Mock Document.find
jest.mock('../../models/Document', () => ({
  __esModule: true,
  default: {
    find: jest.fn()
  },
  find: jest.fn()
}));

// Mock embedding and vectorSearch since they are not the focus of this DB query test
jest.mock('./embeddingService', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
}));
jest.mock('./vectorStore', () => ({
  vectorSearch: jest.fn().mockResolvedValue([])
}));

describe('RAG Access Control (searchUserDocuments)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restrict a normal user to ONLY their own documents', async () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockRole = 'user';
    
    (Document.find as jest.Mock).mockResolvedValueOnce([]); // Return empty to skip the rest of the function

    await searchUserDocuments('What is the policy?', mockUserId, mockRole);

    expect(Document.find).toHaveBeenCalledWith({
      status: 'completed',
      userId: mockUserId // Ensure it strictly queries by their own ID
    });
  });

  it('should allow an admin to access ALL completed documents in the workspace', async () => {
    const mockAdminId = new mongoose.Types.ObjectId().toString();
    const mockRole = 'admin';
    
    (Document.find as jest.Mock).mockResolvedValueOnce([]); // Return empty to skip the rest of the function

    await searchUserDocuments('What is the policy?', mockAdminId, mockRole);

    expect(Document.find).toHaveBeenCalledWith({
      status: 'completed'
      // No userId filter is passed for admins, proving they can see everything
    });
  });
});
