import express from 'express';
import { 
  getHolidays, 
  createHoliday, 
  getHolidayById, 
  updateHoliday, 
  deleteHoliday, 
  getHolidayStats 
} from '../controllers/holidayController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Holiday
 *   description: Holiday management routes
 */

const router = express.Router();


/**
 * @swagger
 * /api/holiday/stats:
 *   get:
 *     summary: Endpoint for /stats
 *     tags: [Holiday]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats', authenticate, getHolidayStats);
router.route('/')
  .get(authenticate, getHolidays)
  .post(authenticate, createHoliday);
  
router.route('/:id')
  .get(authenticate, getHolidayById)
  .put(authenticate, updateHoliday)
  .delete(authenticate, deleteHoliday);

export default router;
