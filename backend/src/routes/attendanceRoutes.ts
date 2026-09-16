import express from 'express';
import { 
  getAttendance, 
  checkIn, 
  checkOut, 
  markBreakStart, 
  markBreakEnd, 
  updateAttendance, 
  getAnalytics 
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management routes
 */

const router = express.Router();


/**
 * @swagger
 * /api/attendance/analytics:
 *   get:
 *     summary: Endpoint for /analytics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/analytics', authenticate, getAnalytics);


/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Endpoint for /check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/check-in', authenticate, checkIn);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Endpoint for /check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/check-out', authenticate, checkOut);

/**
 * @swagger
 * /api/attendance/break-start:
 *   post:
 *     summary: Endpoint for /break-start
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/break-start', authenticate, markBreakStart);

/**
 * @swagger
 * /api/attendance/break-end:
 *   post:
 *     summary: Endpoint for /break-end
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/break-end', authenticate, markBreakEnd);

router.route('/')
  .get(authenticate, getAttendance);

router.route('/:id')
  .put(authenticate, updateAttendance);

export default router;
