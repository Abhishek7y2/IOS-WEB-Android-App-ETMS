'use strict';

import Task from '../models/Task';
import TaskAuditLog from '../models/TaskAuditLog';
import User from '../models/User';
import { publishEvent } from '../realtime/event.publisher';

export interface CreateTaskDTO {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  dueDate: string;
  assignedTo: string;
  attachments?: any[];
}

export class TaskService {
  async getTasks(user: any) {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    let query: any = isAdmin
      ? { isArchived: { $ne: true } }
      : { assignedTo: user?._id, isArchived: { $ne: true } };

    let tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role designation')
      .populate('assignedBy', 'name email role designation');

    // If a non-admin member has 0 tasks assigned directly to them, show all workspace tasks
    if (!isAdmin && tasks.length === 0) {
      tasks = await Task.find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .populate('assignedTo', 'name email role designation')
        .populate('assignedBy', 'name email role designation');
    }

    // Safely map unpopulated or deleted assignedTo fields instead of dropping tasks
    return tasks.map((t: any) => {
      const taskObj = t.toObject ? t.toObject() : t;
      if (!taskObj.assignedTo) {
        taskObj.assignedTo = {
          _id: user?._id || 'unassigned',
          name: user?.name || 'Team Member',
          email: user?.email || 'team@company.com',
          role: 'member',
          designation: 'Employee',
        };
      }
      return taskObj;
    });
  }

  async getTaskById(id: string, user: any) {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const query = isAdmin
      ? { _id: id, isArchived: { $ne: true } }
      : { _id: id, assignedTo: user?._id, isArchived: { $ne: true } };

    const task = await Task.findOne(query)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      throw { status: 404, message: 'Task not found.' };
    }
    return task;
  }

  async createTask(dto: CreateTaskDTO, user: any) {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      throw { status: 403, message: 'Forbidden. Only administrators can assign tasks.' };
    }

    let { title, description, status, priority, dueDate, assignedTo, attachments } = dto;

    if (!title || !title.trim()) {
      throw { status: 400, message: 'Task title is required.' };
    }

    title = title.replace(/\s{2,}/g, ' ').trim();
    if (title.length < 5) throw { status: 400, message: 'Task title must contain at least 5 characters.' };
    if (title.length > 120) throw { status: 400, message: 'Task title cannot exceed 120 characters.' };

    if (/<[a-z][\s\S]*>/i.test(title) || /<[a-z][\s\S]*>/i.test(description)) {
      throw { status: 400, message: 'HTML or JavaScript code is not allowed.' };
    }

    if (!description || !description.trim() || description.trim().length < 20) {
      throw { status: 400, message: 'Task description must contain at least 20 characters.' };
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee || !assignee.isVerified) {
      throw { status: 400, message: 'Cannot assign task. Employee is either invalid or unverified.' };
    }

    const loggedInRole = user?.role;
    const loggedInId = user?._id?.toString();
    const targetId = assignee._id.toString();
    const targetRole = assignee.role;

    if ((loggedInRole === 'superadmin' || loggedInRole === 'admin') && loggedInId === targetId) {
      throw { status: 403, message: 'You are not allowed to assign tasks to this user' };
    }

    if (loggedInRole === 'admin' && (targetRole === 'admin' || targetRole === 'superadmin')) {
      throw { status: 403, message: 'You are not allowed to assign tasks to this user' };
    }

    const [duplicateTask, activeTasksCount, activeCriticalCount, overdueCount] = await Promise.all([
      Task.findOne({ title, assignedTo, status: { $in: ['todo', 'in_progress'] } }),
      Task.countDocuments({ assignedTo, status: { $in: ['todo', 'in_progress'] } }),
      Task.countDocuments({ assignedTo, priority: 'critical', status: { $in: ['todo', 'in_progress'] } }),
      Task.countDocuments({ assignedTo, status: 'overdue' }),
    ]);

    if (duplicateTask) {
      throw { status: 400, message: 'An active task with the same title already exists for this employee.' };
    }

    if (activeTasksCount >= 10) {
      throw { status: 400, message: 'This employee has reached the maximum active task limit.' };
    }

    if (priority === 'critical' && activeCriticalCount >= 3) {
      throw { status: 400, message: 'Employee cannot have more than 3 active critical tasks.' };
    }

    if (overdueCount >= 5) {
      throw { status: 400, message: 'Cannot assign task. Employee has 5 or more overdue tasks.' };
    }

    const task = await Task.create({
      title,
      description: description.trim().replace(/\s{2,}/g, ' '),
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      assignedTo,
      assignedBy: user?._id,
      attachments: attachments || [],
    });

    await TaskAuditLog.create({
      taskId: task._id,
      actionType: 'CREATE',
      changedBy: user?._id,
      previousValue: null,
      newValue: { title, priority, dueDate },
    });

    const targetRooms = [
      `user:${assignedTo}`,
      `user:${user?._id}`,
      'role:admin',
      'role:superadmin'
    ];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('task.created', { taskId: task._id, task }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return task;
  }

  async updateTask(id: string, updates: any, user: any) {
    if (updates.assignedTo) {
      const assignee = await User.findById(updates.assignedTo);
      if (assignee) {
        const loggedInRole = user?.role;
        const loggedInId = user?._id?.toString();
        const targetId = assignee._id.toString();
        const targetRole = assignee.role;

        if ((loggedInRole === 'superadmin' || loggedInRole === 'admin') && loggedInId === targetId) {
          throw { status: 403, message: 'You are not allowed to assign tasks to this user' };
        }

        if (loggedInRole === 'admin' && (targetRole === 'admin' || targetRole === 'superadmin')) {
          throw { status: 403, message: 'You are not allowed to assign tasks to this user' };
        }
      }
    }

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const query = isAdmin
      ? { _id: id, isArchived: { $ne: true } }
      : { _id: id, assignedTo: user?._id, isArchived: { $ne: true } };

    const task = await Task.findOneAndUpdate(query, updates, { new: true })
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      throw { status: 404, message: 'Task not found or not authorized.' };
    }

    const assignedToId = task.assignedTo?._id || task.assignedTo;
    const assignedById = task.assignedBy?._id || task.assignedBy;
    const targetRooms = [
      `user:${assignedToId}`,
      `user:${assignedById}`,
      'role:admin',
      'role:superadmin'
    ];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('task.updated', { taskId: task._id, task }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return task;
  }

  async deleteTask(id: string, user: any) {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const query = isAdmin ? { _id: id } : { _id: id, assignedTo: user?._id };

    const task = await Task.findOneAndUpdate(query, { isArchived: true }, { new: true });

    if (!task) {
      throw { status: 404, message: 'Task not found or not authorized.' };
    }

    const assignedToId = task.assignedTo?._id || task.assignedTo;
    const targetRooms = [
      `user:${assignedToId}`,
      `user:${user?._id}`,
      'role:admin',
      'role:superadmin'
    ];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('task.deleted', { taskId: task._id }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return task;
  }

  async getArchivedTasks(user: any) {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      throw { status: 403, message: 'Forbidden' };
    }

    const tasks = await Task.find({ isArchived: true })
      .populate('assignedTo', 'name email role designation')
      .populate('assignedBy', 'name email role designation');

    return tasks.filter((t) => t.assignedTo !== null);
  }

  async restoreTask(id: string, user: any) {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      throw { status: 403, message: 'Forbidden' };
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, isArchived: true },
      { isArchived: false },
      { new: true }
    );

    if (!task) {
      throw { status: 404, message: 'Task not found in archive.' };
    }

    return task;
  }

  async permanentDeleteTask(id: string, user: any) {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      throw { status: 403, message: 'Forbidden' };
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw { status: 404, message: 'Task not found' };
    }

    return task;
  }
}

export const taskService = new TaskService();
