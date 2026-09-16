import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Document from '../models/Document';
import { processDocument, askQuestion } from '../services/rag/ragService';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded.',
        errors: [],
      });
    }

    const newDoc = await Document.create({
      userId: req.user?._id,
      fileName: file.originalname,
      status: 'processing'
    });

    // Fire and forget processing so the API responds immediately
    processDocument(file.buffer, newDoc._id.toString()).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and processing started.',
      data: { document: newDoc }
    });
  } catch (error: any) {
    console.error('uploadDocument Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while uploading document.',
      errors: [error.message],
    });
  }
};

export const askDocumentQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, question } = req.body;
    
    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        message: 'documentId and question are required.',
        errors: [],
      });
    }

    const answer = await askQuestion(question, documentId);

    return res.status(200).json({
      success: true,
      message: 'Answer generated successfully.',
      data: { answer }
    });
  } catch (error: any) {
    console.error('askDocumentQuestion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while answering question.',
      errors: [error.message],
    });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await Document.find({ userId: req.user?._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully.',
      data: { documents }
    });
  } catch (error: any) {
    console.error('getDocuments Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving documents.',
      errors: [error.message],
    });
  }
};
