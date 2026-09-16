'use strict';

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { taskService } from '../services/taskService';

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const tasks = await taskService.getTasks(req.user);
    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: { tasks },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve tasks.',
      errors: [],
    });
  }
}

export async function getTaskById(req: AuthRequest, res: Response) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: { task },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve task.',
      errors: [],
    });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const task = await taskService.createTask(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create task.',
      errors: [],
    });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update task.',
      errors: [],
    });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    await taskService.deleteTask(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: {},
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete task.',
      errors: [],
    });
  }
}

export async function getArchivedTasks(req: AuthRequest, res: Response) {
  try {
    const tasks = await taskService.getArchivedTasks(req.user);
    return res.status(200).json({
      success: true,
      message: 'Archived tasks retrieved successfully.',
      data: { tasks },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve archived tasks.',
      errors: [],
    });
  }
}

export async function restoreTask(req: AuthRequest, res: Response) {
  try {
    const task = await taskService.restoreTask(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task restored successfully.',
      data: { task },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to restore task.',
      errors: [],
    });
  }
}

export async function permanentDeleteTask(req: AuthRequest, res: Response) {
  try {
    await taskService.permanentDeleteTask(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task permanently deleted',
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete task permanently.',
    });
  }
}
