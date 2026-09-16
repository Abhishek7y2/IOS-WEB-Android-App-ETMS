import express from 'express';
import { 
  applyLeave, 
  getLeaves, 
  getLeaveById, 
  updateLeaveStatus, 
  deleteLeave, 
  getLeaveBalance, 
  getLeaveStats 
} from '../controllers/leaveController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Leave
 *   description: Leave management routes
 */

const router = express.Router();


/**
 * @swagger
 * /api/leave/stats:
 *   get:
 *     summary: Endpoint for /stats
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats', authenticate, getLeaveStats);

/**
 * @swagger
 * /api/leave/balance:
 *   get:
 *     summary: Endpoint for /balance
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/balance', authenticate, getLeaveBalance);

router.route('/')
  .get(authenticate, getLeaves)
  .post(authenticate, applyLeave);
  
router.route('/:id')
  .get(authenticate, getLeaveById)
  .put(authenticate, updateLeaveStatus)
  .delete(authenticate, deleteLeave);

export default router;
