import { Router } from 'express';
import {
  getEmployees,
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  togglePinAnnouncement,
  deleteAnnouncement,
  sendBroadcast,
  getAnalytics,
  createGroup,
} from '../controllers/communicationController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Communication
 *   description: Communication management routes
 */

const router = Router();

// Saare communication routes secure hain (Bina login ke error aayega)
router.use(authenticate);


/**
 * @swagger
 * /api/communication/employees:
 *   get:
 *     summary: Endpoint for /employees
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Employees (Message ya task assign karne ke liye sabhi employees ki list dena)
router.get('/employees', getEmployees);


/**
 * @swagger
 * /api/communication/conversations:
 *   get:
 *     summary: Endpoint for /conversations
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Conversations (1-on-1 ya group chats manage karna)
router.get('/conversations', getConversations); 
/**
 * @swagger
 * /api/communication/conversations/{id}:
 *   get:
 *     summary: Endpoint for /conversations/:id
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Saari chats lana
router.get('/conversations/:id', getConversationById); 
/**
 * @swagger
 * /api/communication/conversations:
 *   post:
 *     summary: Endpoint for /conversations
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Ek specific chat open karna
router.post('/conversations', createConversation); 
/**
 * @swagger
 * /api/communication/conversations/{id}:
 *   put:
 *     summary: Endpoint for /conversations/:id
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Nayi chat start karna
router.put('/conversations/:id', updateConversation); 
/**
 * @swagger
 * /api/communication/conversations/{id}:
 *   delete:
 *     summary: Endpoint for /conversations/:id
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Chat details update karna
router.delete('/conversations/:id', deleteConversation); // Chat delete karna


/**
 * @swagger
 * /api/communication/conversations/{conversationId}/messages:
 *   get:
 *     summary: Endpoint for /conversations/:conversationId/messages
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Messages (Chat ke andar ki baatein)
router.get('/conversations/:conversationId/messages', getMessages); 
/**
 * @swagger
 * /api/communication/conversations/{conversationId}/messages:
 *   post:
 *     summary: Endpoint for /conversations/:conversationId/messages
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Chat ke purane messages nikalna
router.post('/conversations/:conversationId/messages', sendMessage); // Naya message send karna


/**
 * @swagger
 * /api/communication/announcements:
 *   get:
 *     summary: Endpoint for /announcements
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Announcements (Company ke notice board)
router.get('/announcements', getAnnouncements); 
/**
 * @swagger
 * /api/communication/announcements:
 *   post:
 *     summary: Endpoint for /announcements
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Padhne ke liye
router.post('/announcements', createAnnouncement); 
/**
 * @swagger
 * /api/communication/announcements/{id}:
 *   put:
 *     summary: Endpoint for /announcements/:id
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Naya notice banane ke liye (admin)
router.put('/announcements/:id', updateAnnouncement); // Notice edit karna
router.patch('/announcements/:id/pin', togglePinAnnouncement); 
/**
 * @swagger
 * /api/communication/announcements/{id}:
 *   delete:
 *     summary: Endpoint for /announcements/:id
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Notice ko top par pin/unpin karna
router.delete('/announcements/:id', deleteAnnouncement); // Notice hatana


/**
 * @swagger
 * /api/communication/broadcast:
 *   post:
 *     summary: Endpoint for /broadcast
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Broadcast
router.post('/broadcast', sendBroadcast);


/**
 * @swagger
 * /api/communication/analytics:
 *   get:
 *     summary: Endpoint for /analytics
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Analytics
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /api/communication/groups:
 *   post:
 *     summary: Endpoint for /groups
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Group endpoints
router.post('/groups', createGroup);

export default router;