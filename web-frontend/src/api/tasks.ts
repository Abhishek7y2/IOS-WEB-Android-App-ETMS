'use client';

import axiosInstance from '../services/axios';
import { Employee, Task, TaskPriority, TaskStatus, TaskAttachment } from '../types';
import { mockEmployees, mockTasks } from '../constants/mockData';

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
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
  attachments?: TaskAttachment[];
}

interface ApiTaskResponse {
  success: boolean;
  message: string;
  data: {
    task: ApiTask;
  };
}

interface ApiTasksResponse {
  success: boolean;
  message: string;
  data: {
    tasks: ApiTask[];
  };
}

export type TaskCreatePayload = Omit<Task, 'id' | 'createdAt'>;
export type TaskUpdatePayload = Partial<TaskCreatePayload>;

function isMockAuthEnabled(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem('use_mock_auth') === 'true';
}

const STORAGE_KEYS = {
  tasks: 'mock_tasks_data',
  employees: 'mock_employees_data',
};

function getMockTasks(): Task[] {
  if (typeof window === 'undefined') return mockTasks;
  const raw = window.localStorage.getItem(STORAGE_KEYS.tasks);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
    return mockTasks;
  }
  try {
    const parsed = JSON.parse(raw) as Task[];
    if (Array.isArray(parsed) && parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
      return mockTasks;
    }
    return parsed;
  } catch {
    return mockTasks;
  }
}

function saveMockTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function getMockEmployees(): Employee[] {
  if (typeof window === 'undefined') return mockEmployees;
  const raw = window.localStorage.getItem(STORAGE_KEYS.employees);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(mockEmployees));
    return mockEmployees;
  }
  try {
    const parsed = JSON.parse(raw) as Employee[];
    if (Array.isArray(parsed) && parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(mockEmployees));
      return mockEmployees;
    }
    return parsed;
  } catch {
    return mockEmployees;
  }
}

function saveMockEmployees(employees: Employee[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
}

function normalizeTask(apiTask: ApiTask): Task {
  // assignedTo can be null when the referenced user was deleted from the DB
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
    dueDate: new Date(apiTask.dueDate).toISOString().split('T')[0],
    createdAt: new Date(apiTask.createdAt).toISOString().split('T')[0],
    attachments: apiTask.attachments || [],
  };
}

function extractEmployee(apiTask: ApiTask): Employee | undefined {
  // Guard: assignedTo can be null (deleted user) or a plain string ID (not populated)
  if (apiTask.assignedTo == null || typeof apiTask.assignedTo === 'string') {
    return undefined;
  }

  return {
    id: apiTask.assignedTo._id,
    name: apiTask.assignedTo.name,
    email: apiTask.assignedTo.email,
    role: apiTask.assignedTo.role ?? 'member',
  };
}

function buildEmployees(apiTasks: ApiTask[]): Employee[] {
  const employeesMap = new Map<string, Employee>();

  apiTasks.forEach((task) => {
    const employee = extractEmployee(task);
    if (employee && !employeesMap.has(employee.id)) {
      employeesMap.set(employee.id, employee);
    }
  });

  return Array.from(employeesMap.values());
}

export async function getTasks(): Promise<{ tasks: Task[]; employees: Employee[] }> {
  if (isMockAuthEnabled()) {
    return {
      tasks: getMockTasks(),
      employees: getMockEmployees(),
    };
  }

  try {
    const tasksResponse = await axiosInstance.get<ApiTasksResponse>('/tasks');
    const apiTasks = tasksResponse.data?.data?.tasks || [];

    let apiUsers: any[] = [];
    try {
      const usersResponse = await axiosInstance.get<{ success: boolean; data: { users: any[] } }>('/auth/users');
      apiUsers = usersResponse.data?.data?.users || [];
    } catch {
      // Fallback to building employee list from task assignees if /auth/users is restricted
      apiUsers = [];
    }

    let employees: Employee[] = [];
    if (apiUsers.length > 0) {
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
    } else {
      employees = buildEmployees(apiTasks);
    }

    // If employees list is still empty, populate default workspace members
    if (employees.length === 0) {
      employees = getMockEmployees();
    }

    return {
      tasks: apiTasks.map(normalizeTask),
      employees,
    };
  } catch (error) {
    console.error('getTasks API Error, using fallback workspace data:', error);
    return {
      tasks: getMockTasks(),
      employees: getMockEmployees(),
    };
  }
}

export async function createTask(payload: TaskCreatePayload): Promise<{ task: Task; employee?: Employee }> {
  if (isMockAuthEnabled()) {
    const tasks = getMockTasks();
    const employees = getMockEmployees();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      assignedTo: payload.assignedTo,
      dueDate: payload.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      attachments: payload.attachments || [],
    };
    saveMockTasks([...tasks, newTask]);
    const employee = employees.find(e => e.id === payload.assignedTo);
    return { task: newTask, employee };
  }

  const response = await axiosInstance.post<ApiTaskResponse>('/tasks', payload);
  const apiTask = response.data.data.task;

  return {
    task: normalizeTask(apiTask),
    employee: extractEmployee(apiTask),
  };
}

export async function updateTask(
  taskId: string,
  payload: TaskUpdatePayload
): Promise<{ task: Task; employee?: Employee }> {
  if (isMockAuthEnabled()) {
    const tasks = getMockTasks();
    const employees = getMockEmployees();
    let updatedTask: Task | null = null;
    const nextTasks = tasks.map(task => {
      if (task.id === taskId) {
        updatedTask = {
          ...task,
          ...payload,
        };
        return updatedTask;
      }
      return task;
    });
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    saveMockTasks(nextTasks);
    const assignedTo = payload.assignedTo ?? (updatedTask as Task).assignedTo;
    const employee = employees.find(e => e.id === assignedTo);
    return { task: updatedTask, employee };
  }

  const response = await axiosInstance.put<ApiTaskResponse>(`/tasks/${taskId}`, payload);
  const apiTask = response.data.data.task;

  return {
    task: normalizeTask(apiTask),
    employee: extractEmployee(apiTask),
  };
}

export async function deleteTask(taskId: string): Promise<void> {
  if (isMockAuthEnabled()) {
    const tasks = getMockTasks();
    saveMockTasks(tasks.filter(task => task.id !== taskId));
    return;
  }

  await axiosInstance.delete(`/tasks/${taskId}`);
}

export async function getArchivedTasks(): Promise<Task[]> {
  if (isMockAuthEnabled()) return []; // Mock not supported for archive yet
  const response = await axiosInstance.get<ApiTasksResponse>('/tasks/archived');
  return response.data.data.tasks.map(normalizeTask);
}

export async function restoreTask(taskId: string): Promise<void> {
  if (isMockAuthEnabled()) return;
  await axiosInstance.put(`/tasks/${taskId}/restore`);
}

export async function getArchivedUsers(): Promise<Employee[]> {
  if (isMockAuthEnabled()) return [];
  const response = await axiosInstance.get<{ success: boolean; data: { users: any[] } }>('/auth/users/archived');
  return response.data.data.users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role ?? 'user',
    designation: user.designation || 'Employee',
    avatarUrl: user.profilePicture,
  }));
}

export async function restoreUser(userId: string): Promise<void> {
  if (isMockAuthEnabled()) return;
  await axiosInstance.put(`/auth/users/${userId}/restore`);
}

export async function permanentDeleteTask(taskId: string): Promise<void> {
  if (isMockAuthEnabled()) return;
  await axiosInstance.delete(`/tasks/${taskId}/permanent`);
}

export async function permanentDeleteUser(userId: string): Promise<void> {
  if (isMockAuthEnabled()) return;
  await axiosInstance.delete(`/auth/users/${userId}/permanent`);
}
