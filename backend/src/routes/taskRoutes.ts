import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getArchivedTasks,
  restoreTask,
  permanentDeleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';
import { taskCreateValidation, taskUpdateValidation } from '../validators/taskValidator';
import { validateRequest } from '../middleware/validateRequest';

/**
 * @swagger
 * tags:
 *   name: Task
 *   description: Task management routes
 */

const router = Router();

// Task routes ke liye security (sirf authorized employees hi tasks dekh/bana sakte hain)
router.use(authenticate);


/**
 * @swagger
 * /api/task/:
 *   get:
 *     summary: Endpoint for /
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/archived', getArchivedTasks);
router.get('/', getTasks); 
/**
 * @swagger
 * /api/task/{id}:
 *   get:
 *     summary: Endpoint for /:id
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Database se tasks ki list lana (with filters)
router.get('/:id', getTaskById); 
/**
 * @swagger
 * /api/task/:
 *   post:
 *     summary: Endpoint for /
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Kisi ek specific task ki poori details nikalna
// Naya task banate waqt pehle validation rules check hote hain (taskCreateValidation), phir banta hai
router.post('/', taskCreateValidation, validateRequest, createTask);

/**
 * @swagger
 * /api/task/{id}:
 *   put:
 *     summary: Endpoint for /:id
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Task update karte waqt rules check hote hain
router.put('/:id', taskUpdateValidation, validateRequest, updateTask);

/**
 * @swagger
 * /api/task/{id}:
 *   delete:
 *     summary: Endpoint for /:id
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', deleteTask); // Task ko system se delete karna
router.delete('/:id/permanent', permanentDeleteTask); // Permanently delete task
router.put('/:id/restore', restoreTask); // Restore task

export default router;
