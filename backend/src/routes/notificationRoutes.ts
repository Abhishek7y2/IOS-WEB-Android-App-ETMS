import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification management routes
 */

const router = express.Router();

// Notifications check karne ke liye user ka login hona zaroori hai
router.use(authenticate); 


/**
 * @swagger
 * /api/notification/:
 *   get:
 *     summary: Endpoint for /
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getNotifications); 
/**
 * @swagger
 * /api/notification/read-all:
 *   put:
 *     summary: Endpoint for /read-all
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// User ki saari nayi aur purani notifications lana
router.put('/read-all', markAllAsRead); 
/**
 * @swagger
 * /api/notification/{id}/read:
 *   put:
 *     summary: Endpoint for /:id/read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Ek click me sabhi notifications ko "read" (padh liya) mark karna
router.put('/:id/read', markAsRead); // Kisi ek specific notification par click karke usko read karna

export default router;
