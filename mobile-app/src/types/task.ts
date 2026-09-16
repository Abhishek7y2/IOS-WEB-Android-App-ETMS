export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  avatarUrl?: string;
  mobileNumber?: string;
  isBlocked?: boolean;
}

export interface SubtaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  attachments?: any[];
  subtasks?: SubtaskItem[];
  tags?: string[];
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  attachments?: any[];
  subtasks?: SubtaskItem[];
  tags?: string[];
}

