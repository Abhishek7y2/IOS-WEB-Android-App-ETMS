import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Employee, Task, TaskInput, TaskStatus } from '../types/task';
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../services/tasksApi';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { socketService } from '../services/socketService';

interface TaskContextType {
  tasks: Task[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  statusFilter: string;
  searchQuery: string;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  refreshTasks: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskInput>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  filteredTasks: Task[];
  metrics: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchTasksData = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) return;
    if (!isSilent && tasks.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getTasksApi();
      setTasks(data.tasks);
      setEmployees(data.employees);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks from server');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tasks.length]);

  useEffect(() => {
    fetchTasksData(tasks.length > 0);

    if (isAuthenticated) {
      socketService.connect();

      const unsubCreated = socketService.subscribe('task.created', (envelope) => {
        const newTask = envelope.data?.task;
        if (newTask && (newTask.id || newTask._id)) {
          const formattedTask = {
            ...newTask,
            id: newTask.id || newTask._id,
          };
          setTasks((prev) => {
            if (prev.some((t) => t.id === formattedTask.id)) return prev;
            return [formattedTask, ...prev];
          });
        } else {
          fetchTasksData();
        }
      });

      const unsubUpdated = socketService.subscribe('task.updated', (envelope) => {
        const updatedTask = envelope.data?.task;
        const updatedId = envelope.data?.taskId || updatedTask?.id || updatedTask?._id;
        if (updatedTask && updatedId) {
          const formattedTask = {
            ...updatedTask,
            id: updatedTask.id || updatedTask._id,
          };
          setTasks((prev) => prev.map((t) => (t.id === updatedId ? { ...t, ...formattedTask } : t)));
        } else {
          fetchTasksData();
        }
      });

      const unsubDeleted = socketService.subscribe('task.deleted', (envelope) => {
        const deletedId = envelope.data?.taskId;
        if (deletedId) {
          setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        } else {
          fetchTasksData();
        }
      });

      return () => {
        unsubCreated();
        unsubUpdated();
        unsubDeleted();
      };
    }
  }, [fetchTasksData, isAuthenticated]);

  const addTask = useCallback(async (input: TaskInput) => {
    setLoading(true);
    try {
      const res = await createTaskApi(input);
      setTasks((prev) => [res.task, ...prev]);
      showSuccess(`Task "${res.task.title}" created successfully!`, 'Task Created');
    } catch (err: any) {
      const msg = err.message || 'Failed to create task';
      setError(msg);
      showError(msg, 'Task Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      const res = await updateTaskApi(taskId, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
      showSuccess(`Task status updated to ${status.replace('_', ' ')}`, 'Status Updated');
    } catch (err: any) {
      const msg = err.message || 'Failed to update task status';
      setError(msg);
      showError(msg, 'Update Error');
      throw err;
    }
  }, [showSuccess, showError]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<TaskInput>) => {
    try {
      const res = await updateTaskApi(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
      showSuccess('Task updated successfully!', 'Task Modified');
    } catch (err: any) {
      const msg = err.message || 'Failed to update task';
      setError(msg);
      showError(msg, 'Update Error');
      throw err;
    }
  }, [showSuccess, showError]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showInfo('Task deleted successfully!', 'Task Removed');
    } catch (err: any) {
      const msg = err.message || 'Failed to delete task';
      setError(msg);
      showError(msg, 'Delete Error');
      throw err;
    }
  }, [showInfo, showError]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
          ? t.status === 'todo'
          : t.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, searchQuery]);

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
    };
  }, [tasks]);

  const contextValue = useMemo(
    () => ({
      tasks,
      employees,
      loading,
      error,
      statusFilter,
      searchQuery,
      setStatusFilter,
      setSearchQuery,
      refreshTasks: fetchTasksData,
      addTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      filteredTasks,
      metrics,
    }),
    [
      tasks,
      employees,
      loading,
      error,
      statusFilter,
      searchQuery,
      fetchTasksData,
      addTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      filteredTasks,
      metrics,
    ]
  );

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
