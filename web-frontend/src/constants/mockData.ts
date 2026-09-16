import { Employee, Task } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    role: 'Frontend Developer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'emp-2',
    name: 'Bob Smith',
    email: 'bob.smith@company.com',
    role: 'Backend Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'emp-3',
    name: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    role: 'UI/UX Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'emp-4',
    name: 'Diana Prince',
    email: 'diana.prince@company.com',
    role: 'Project Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design Dashboard Wireframes',
    description: 'Create low-fidelity wireframes for the new employee task manager dashboard focusing on ease of navigation.',
    status: 'completed',
    priority: 'high',
    assignedTo: 'emp-3',
    dueDate: '2026-06-20',
    createdAt: '2026-06-15',
  },
  {
    id: 'task-2',
    title: 'Setup Project Boilerplate',
    description: 'Initialize a Next.js TypeScript app with Tailwind CSS and outline the folder structure.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'emp-1',
    dueDate: '2026-06-18',
    createdAt: '2026-06-17',
  },
  {
    id: 'task-3',
    title: 'Implement Auth Middleware',
    description: 'Secure API routes and pages using custom JWT token validation middleware.',
    status: 'todo',
    priority: 'medium',
    assignedTo: 'emp-2',
    dueDate: '2026-06-25',
    createdAt: '2026-06-17',
  },
  {
    id: 'task-4',
    title: 'Prepare Project Documentation',
    description: 'Document architecture, design decisions, APIs, and user guides in the project wiki.',
    status: 'todo',
    priority: 'low',
    assignedTo: 'emp-4',
    dueDate: '2026-06-30',
    createdAt: '2026-06-17',
  },
];

