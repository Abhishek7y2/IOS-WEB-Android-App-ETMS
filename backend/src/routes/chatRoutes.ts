import { Router } from 'express';
import { handleChatMessage, getChatHistory, getArchivedChats, getConversation, createLibrary, getLibraries, addChatToLibrary, createProject, getProjects, addChatToProject, deleteChat, renameChat, pinChat, archiveChat, renameProject, deleteProject, pinProject, archiveProject, getGreeting } from '../controllers/chatController';
import { syncAnnouncements, syncUserLeaves, syncUserAttendance } from '../services/chatbot/fastTrackSyncService';
import User from '../models/User';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat management routes
 */

const router = Router();

// In saare chat routes ko access karne ke liye user ka login hona (token hona) zaroori hai
router.use(authenticate);


/**
 * @swagger
 * /api/chat/:
 *   post:
 *     summary: Endpoint for /
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Naya chat message bhejna ya bot se baat karna
router.post('/', handleChatMessage);

/**
 * @swagger
 * /api/chat/greeting:
 *   get:
 *     summary: Endpoint for /greeting
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Greeting lana (Zero-latency AI greeting)
router.get('/greeting', getGreeting);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Endpoint for /history
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Purani chats (history) nikalna
router.get('/history', getChatHistory);

/**
 * @swagger
 * /api/chat/archived:
 *   get:
 *     summary: Endpoint for /archived
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Archive ki gayi chats nikalna
router.get('/archived', getArchivedChats);

/**
 * @swagger
 * /api/chat/history/{conversationId}:
 *   get:
 *     summary: Endpoint for /history/:conversationId
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Kisi ek specific conversation/chat ki details lana
router.get('/history/:conversationId', getConversation);

/**
 * @swagger
 * /api/chat/history/{chatId}:
 *   delete:
 *     summary: Endpoint for /history/:chatId
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/history/:chatId', deleteChat);

/**
 * @swagger
 * /api/chat/history/{chatId}/rename:
 *   put:
 *     summary: Endpoint for /history/:chatId/rename
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/history/:chatId/rename', renameChat);

/**
 * @swagger
 * /api/chat/history/{chatId}/pin:
 *   put:
 *     summary: Endpoint for /history/:chatId/pin
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/history/:chatId/pin', pinChat);

/**
 * @swagger
 * /api/chat/history/{chatId}/archive:
 *   put:
 *     summary: Endpoint for /history/:chatId/archive
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/history/:chatId/archive', archiveChat);


/**
 * @swagger
 * /api/chat/library:
 *   post:
 *     summary: Endpoint for /library
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Library routes (Chat ko folder me save karne ke liye)
router.post('/library', createLibrary); 
/**
 * @swagger
 * /api/chat/library:
 *   get:
 *     summary: Endpoint for /library
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Nayi library/folder banana
router.get('/library', getLibraries); 
/**
 * @swagger
 * /api/chat/library/{libraryId}/chat:
 *   post:
 *     summary: Endpoint for /library/:libraryId/chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Saari libraries lana
router.post('/library/:libraryId/chat', addChatToLibrary); // Chat ko kisi library me add karna


/**
 * @swagger
 * /api/chat/project:
 *   post:
 *     summary: Endpoint for /project
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Project routes (Project ke hisab se chats manage karna)
router.post('/project', createProject); 
/**
 * @swagger
 * /api/chat/project:
 *   get:
 *     summary: Endpoint for /project
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Naya project banana
router.get('/project', getProjects); 
/**
 * @swagger
 * /api/chat/project/{projectId}/chat:
 *   post:
 *     summary: Endpoint for /project/:projectId/chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Projects ki list lana
router.post('/project/:projectId/chat', addChatToProject); 
/**
 * @swagger
 * /api/chat/project/{projectId}:
 *   delete:
 *     summary: Endpoint for /project/:projectId
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Chat ko project se link karna
router.delete('/project/:projectId', deleteProject); 
/**
 * @swagger
 * /api/chat/project/{projectId}/rename:
 *   put:
 *     summary: Endpoint for /project/:projectId/rename
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Project delete karna
router.put('/project/:projectId/rename', renameProject);

/**
 * @swagger
 * /api/chat/project/{projectId}/pin:
 *   put:
 *     summary: Endpoint for /project/:projectId/pin
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/project/:projectId/pin', pinProject);

/**
 * @swagger
 * /api/chat/project/{projectId}/archive:
 *   put:
 *     summary: Endpoint for /project/:projectId/archive
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/project/:projectId/archive', archiveProject);

export default router;
