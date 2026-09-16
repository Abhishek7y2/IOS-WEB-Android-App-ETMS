import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, askDocumentQuestion, getDocuments } from '../controllers/ragController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: RAG
 *   description: Document upload and retrieval-augmented generation
 */

const router = Router();

// Memory storage to keep the PDF in a buffer instead of saving to disk
const upload = multer({ storage: multer.memoryStorage() });

// All RAG routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/rag/upload:
 *   post:
 *     summary: Upload a PDF document for RAG processing
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Document uploaded and processing started
 */
router.post('/upload', upload.single('file'), uploadDocument);

/**
 * @swagger
 * /api/rag/ask:
 *   post:
 *     summary: Ask a question based on an uploaded document
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Answer generated successfully
 */
router.post('/ask', askDocumentQuestion);

/**
 * @swagger
 * /api/rag/documents:
 *   get:
 *     summary: Get all uploaded documents for the user
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 */
router.get('/documents', getDocuments);

export default router;
