import axiosInstance from './axios';
import { Employee, Task, TaskInput, TaskPriority, TaskStatus } from '../types/task';

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  designation?: string;
  profilePicture?: string;
  mobileNumber?: string;
  isBlocked?: boolean;
}

interface ApiTask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  assignedTo: ApiUser | string | null;
  attachments?: any[];
}

function normalizeTask(apiTask: ApiTask): Task {
  const assignedToId =
    apiTask.assignedTo == null
      ? ''
      : typeof apiTask.assignedTo === 'string'
      ? apiTask.assignedTo
      : apiTask.assignedTo._id ?? '';

  return {
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status,
    priority: apiTask.priority,
    assignedTo: assignedToId,
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate).toISOString().split('T')[0] : '',
    createdAt: apiTask.createdAt ? new Date(apiTask.createdAt).toISOString().split('T')[0] : '',
    attachments: apiTask.attachments || [],
  };
}

import { mockEmployees, mockTasks } from '../constants/mockData';

export async function getTasksApi(): Promise<{ tasks: Task[]; employees: Employee[] }> {
  try {
    const tasksResponse = await axiosInstance.get<{ success: boolean; data: { tasks: ApiTask[] } }>('/tasks');
    const apiTasks = tasksResponse.data?.data?.tasks;

    if (!Array.isArray(apiTasks) || apiTasks.length === 0) {
      return {
        tasks: mockTasks,
        employees: mockEmployees,
      };
    }

    let employees: Employee[] = [];
    try {
      const usersResponse = await axiosInstance.get<{ success: boolean; data: { users: ApiUser[] } }>('/auth/users');
      const apiUsers = usersResponse.data.data.users;
      employees = apiUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role ?? 'user',
        designation: user.designation || 'Employee',
        avatarUrl: user.profilePicture,
        mobileNumber: user.mobileNumber,
        isBlocked: user.isBlocked || false,
      }));
    } catch {
      // If auth users fails due to permissions, generate employees from tasks assignedTo
      const empMap = new Map<string, Employee>();
      apiTasks.forEach((t) => {
        if (typeof t.assignedTo === 'object' && t.assignedTo !== null) {
          empMap.set(t.assignedTo._id, {
            id: t.assignedTo._id,
            name: t.assignedTo.name,
            email: t.assignedTo.email,
            role: t.assignedTo.role || 'user',
          });
        }
      });
      employees = Array.from(empMap.values());
    }

    return {
      tasks: apiTasks.map(normalizeTask),
      employees: employees.length > 0 ? employees : mockEmployees,
    };
  } catch (error) {
    console.warn('[TasksApi] Server fetch failed, using fallback mock data:', error);
    return {
      tasks: mockTasks,
      employees: mockEmployees,
    };
  }
}

export async function createTaskApi(payload: TaskInput): Promise<{ task: Task }> {
  const response = await axiosInstance.post<{ success: boolean; data: { task: ApiTask } }>('/tasks', payload);
  return {
    task: normalizeTask(response.data.data.task),
  };
}

export async function updateTaskApi(taskId: string, payload: Partial<TaskInput>): Promise<{ task: Task }> {
  const response = await axiosInstance.put<{ success: boolean; data: { task: ApiTask } }>(`/tasks/${taskId}`, payload);
  return {
    task: normalizeTask(response.data.data.task),
  };
}

export async function deleteTaskApi(taskId: string): Promise<void> {
  await axiosInstance.delete(`/tasks/${taskId}`);
}
