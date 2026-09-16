export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  designation?: string;
  isBlocked?: boolean;
  mobileNumber?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ActivityAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  attachments?: TaskAttachment[];
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
  attachments?: TaskAttachment[];
}

export interface ActivityLog {
  id: string;
  taskTitle: string;
  employeeName: string;
  action: ActivityAction;
  createdAt: string;
  details?: string;
}
