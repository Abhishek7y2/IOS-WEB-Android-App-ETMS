import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

const statusValues = ['todo', 'in_progress', 'completed', 'overdue', 'cancelled'];
const priorityValues = ['low', 'medium', 'high', 'critical'];

// Naya task banate waqt title, description aur date jaise zaroori fields ko check karne ke rules
export const taskCreateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_REQUIRED)
    .isLength({ min: 5, max: 150 })
    .withMessage('Task title must be between 5 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_REQUIRED)
    .isLength({ min: 20, max: 1000 })
    .withMessage('Task description must be between 20 and 1000 characters'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(VALIDATION_MESSAGES.TASK.STATUS_INVALID(statusValues)),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(VALIDATION_MESSAGES.TASK.PRIORITY_INVALID(priorityValues)),
  body('dueDate')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_INVALID),
  body('assignedTo')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_INVALID),
];

// Kisi existing task ko update (edit) karte waqt sirf bheji gayi fields ko check karne ke rules
export const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_EMPTY)
    .isLength({ min: 5, max: 150 })
    .withMessage('Task title must be between 5 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_EMPTY)
    .isLength({ min: 20, max: 1000 })
    .withMessage('Task description must be between 20 and 1000 characters'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(VALIDATION_MESSAGES.TASK.STATUS_INVALID(statusValues)),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(VALIDATION_MESSAGES.TASK.PRIORITY_INVALID(priorityValues)),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_INVALID),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_INVALID),
];
