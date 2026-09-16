'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandler';
import { formatDate } from '../utils/format';
import { ActivityAction, ActivityLog, Employee, Task, TaskInput, TaskPriority, TaskStatus } from '../types';
import { mockEmployees, mockTasks } from '../constants/mockData';
import { useAuth } from './AuthContext';
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask
} from '../api/tasks';
import { updateUserProfile, removeUser, registerUser, blockUserAPI, unblockUserAPI } from '../api/auth';
import { socketClient } from '../services/socketClient';

interface TaskContextType {
  tasks: Task[];
  employees: Employee[];
  activities: ActivityLog[];
  addTask: (task: TaskInput) => void;
  updateTask: (taskId: string, updates: TaskInput) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  assignTask: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'> & { password?: string }) => void | Promise<void>;
  updateEmployeeDesignation: (employeeId: string, designation: string) => Promise<void>;
  updateEmployeeRole: (employeeId: string, role: string) => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
  blockEmployee: (employeeId: string) => Promise<void>;
  unblockEmployee: (employeeId: string) => Promise<void>;
}

const ACTIVITIES_KEY = 'employee_activity_log';
const EMPLOYEES_KEY = 'employee_members';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const getEmployeeName = (employees: Employee[], employeeId: string) =>
  employees.find((employee) => employee.id === employeeId)?.name ?? 'Unassigned';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

const buildChangeDetails = (task: Task, updates: TaskInput, employees: Employee[]) => {
  const changes: string[] = [];
  if (task.title !== updates.title) changes.push(`Changed title for "${task.title}" to "${updates.title}"`);
  if (task.description !== updates.description) changes.push(`Updated description for "${task.title}"`);
  if (task.status !== updates.status) changes.push(`Changed status for "${task.title}" to ${statusLabels[updates.status]}`);
  if (task.priority !== updates.priority) changes.push(`Changed priority for "${task.title}" to ${updates.priority}`);
  if (task.assignedTo !== updates.assignedTo) changes.push(`Assigned "${task.title}" to ${getEmployeeName(employees, updates.assignedTo)}`);
  if (task.dueDate !== updates.dueDate) changes.push(`Changed due date for "${task.title}" to ${formatDate(updates.dueDate)}`);
  return changes.length > 0 ? changes.join('. ') + '.' : `Updated task "${task.title}".`;
};

const buildActivity = (
  task: Task,
  action: ActivityAction,
  userName: string,
  details?: string,
): ActivityLog => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  taskTitle: task.title,
  employeeName: userName,
  action,
  details,
  createdAt: new Date().toISOString(),
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initializing, user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Load activities from localStorage on mount (safe for SSR/hydration)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
    if (storedActivities) {
      try {
        const parsed = JSON.parse(storedActivities) as ActivityLog[];
        if (parsed && parsed.length > 0) setActivities(parsed);
      } catch (err) {
        // ignore parse errors
      }
    }
  }, []);

  const isMock = typeof window !== 'undefined' && localStorage.getItem('use_mock_auth') === 'true';

  const { data, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks_and_employees'],
    queryFn: apiGetTasks,
    enabled: isAuthenticated || isMock,
  });

  useEffect(() => {
    if (data) {
      setTasks(data.tasks);
      setEmployees(data.employees);
    } else if (!isAuthenticated && !isMock) {
      setTasks([]);
      setEmployees([]);
    }
  }, [data, isAuthenticated, isMock]);

  const fetchTasks = async () => {
    await refetchTasks();
  };

  useEffect(() => {
    const handleTaskChange = () => {
      fetchTasks();
    };

    window.addEventListener('TASK_CREATED', handleTaskChange);
    window.addEventListener('TASK_UPDATED', handleTaskChange);

    if (isAuthenticated) {
      socketClient.connect();

      const unsubCreated = socketClient.subscribe('task.created', (envelope) => {
        console.log('[Web Realtime] task.created event received:', envelope);
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
          fetchTasks();
        }
      });

      const unsubUpdated = socketClient.subscribe('task.updated', (envelope) => {
        console.log('[Web Realtime] task.updated event received:', envelope);
        const updatedTask = envelope.data?.task;
        const updatedId = envelope.data?.taskId || updatedTask?.id || updatedTask?._id;
        if (updatedTask && updatedId) {
          const formattedTask = {
            ...updatedTask,
            id: updatedTask.id || updatedTask._id,
          };
          setTasks((prev) => prev.map((t) => (t.id === updatedId ? { ...t, ...formattedTask } : t)));
        } else {
          fetchTasks();
        }
      });

      const unsubDeleted = socketClient.subscribe('task.deleted', (envelope) => {
        console.log('[Web Realtime] task.deleted event received:', envelope);
        const deletedId = envelope.data?.taskId;
        if (deletedId) {
          setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        } else {
          fetchTasks();
        }
      });

      return () => {
        window.removeEventListener('TASK_CREATED', handleTaskChange);
        window.removeEventListener('TASK_UPDATED', handleTaskChange);
        unsubCreated();
        unsubUpdated();
        unsubDeleted();
      };
    }

    return () => {
      window.removeEventListener('TASK_CREATED', handleTaskChange);
      window.removeEventListener('TASK_UPDATED', handleTaskChange);
    };
  }, [isAuthenticated, initializing]);

  const recordActivity = (activity: ActivityLog) => {
    setActivities((current) => {
      const next = [activity, ...current].slice(0, 25);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addTask = async (newTaskData: TaskInput) => {
    try {
      const { task: created, employee } = await apiCreateTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
      const currentEmployees = employee && !employees.some((e) => e.id === employee.id)
        ? [...employees, employee]
        : employees;
      if (employee && !employees.some((e) => e.id === employee.id)) {
        setEmployees((prev) => [...prev, employee]);
      }
      recordActivity(
        buildActivity(
          created,
          'created',
          user?.name || 'Employee',
          `created task '${created.title}' and assigned it to ${getEmployeeName(currentEmployees, created.assignedTo)}.`,
        ),
      );
      toast.success('Task created successfully');
      fetchTasks();
    } catch (err) {
      handleError(err, 'Failed to create task in database');
    }
  };

  const updateTask = async (taskId: string, updates: TaskInput) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      const { task: updated, employee } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      if (employee && !employees.some((e) => e.id === employee.id)) {
        setEmployees((prev) => [...prev, employee]);
      }
      recordActivity(buildActivity(updated, 'updated', user?.name || 'Employee', buildChangeDetails(task, updates, employees)));
      toast.success('Task updated successfully');
      fetchTasks();
    } catch (err) {
      handleError(err, 'Failed to update task in database');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, 'status_changed', user?.name || 'Employee', `changed status for "${task.title}" to ${statusLabels[status]}.`));
      toast.success('Status updated successfully');
      fetchTasks();
    } catch (err) {
      handleError(err, 'Failed to update task status in database');
    }
  };

  const updateTaskPriority = async (taskId: string, priority: TaskPriority) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.priority === priority) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, 'updated', user?.name || 'Employee', `changed priority for "${task.title}" to ${priority}.`));
      toast.success('Task updated successfully');
    } catch (err) {
      handleError(err, 'Failed to update task priority in database');
    }
  };

  const assignTask = async (taskId: string, employeeId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.assignedTo === employeeId) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: employeeId,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, 'updated', user?.name || 'Employee', `assigned "${task.title}" to ${getEmployeeName(employees, employeeId)}.`));
      toast.success('Task updated successfully');
    } catch (err) {
      handleError(err, 'Failed to assign task in database');
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      await apiDeleteTask(taskId);
      setTasks((prev) => prev.filter((item) => item.id !== taskId));
      recordActivity(buildActivity(task, 'deleted', user?.name || 'Employee', `deleted task "${task.title}".`));
      toast.success('Task deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete task from database');
    }
  };

  const addEmployee = async (newEmployeeData: Omit<Employee, 'id'> & { password?: string }) => {
    const isMock = typeof window === 'undefined' ? false : localStorage.getItem('use_mock_auth') === 'true';
    if (isMock) {
      const newEmployee: Employee = {
        name: newEmployeeData.name,
        email: newEmployeeData.email,
        role: newEmployeeData.role || 'user',
        designation: newEmployeeData.designation || 'Specialist',
        avatarUrl: newEmployeeData.avatarUrl,
        id: `emp-${Date.now()}`,
      };
      setEmployees((prev) => {
        const next = [...prev, newEmployee];
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
        return next;
      });
      toast.success('Mock team member added');
    } else {
      try {
        const nameParts = (newEmployeeData.name || '').trim().split(/\s+/);
        const fName = nameParts[0] || 'Employee';
        const lName = nameParts.slice(1).join(' ') || 'Member';

        // Generate a random valid 10-digit Indian mobile number to bypass unique constraints 
        // since the admin creation form doesn't take a mobile number anymore
        const randomMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

        const regResult = await registerUser({
          name: newEmployeeData.name,
          firstName: fName,
          lastName: lName,
          gender: 'Other',
          mobileNumber: randomMobile,
          qualification: 'N/A',
          countryCode: '+91',
          email: newEmployeeData.email,
          password: newEmployeeData.password || 'TempPassword123!',
          profilePicture: newEmployeeData.avatarUrl,
        });

        const userId = regResult.user.id || (regResult.user as any)._id;
        await updateUserProfile(userId, {
          designation: newEmployeeData.designation || 'Employee',
          role: newEmployeeData.role || 'user',
        });

        const newEmp: Employee = {
          id: userId,
          name: newEmployeeData.name,
          email: newEmployeeData.email,
          role: newEmployeeData.role || 'user',
          designation: newEmployeeData.designation || 'Employee',
          avatarUrl: newEmployeeData.avatarUrl,
        };
        setEmployees((prev) => [...prev, newEmp]);
        toast.success('Team member registered successfully');
      } catch (err: any) {
        handleError(err, 'Failed to register team member');
        throw err;
      }
    }
  };

  const updateEmployeeDesignation = async (employeeId: string, designation: string) => {
    try {
      await updateUserProfile(employeeId, { designation });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, designation } : emp))
      );
      toast.success('Designation updated successfully');
    } catch (err) {
      handleError(err, 'Failed to update designation');
    }
  };

  const updateEmployeeRole = async (employeeId: string, role: string) => {
    try {
      await updateUserProfile(employeeId, { role });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, role } : emp))
      );
      toast.success('Role updated successfully');
    } catch (err) {
      handleError(err, 'Failed to update role');
    }
  };

  const removeEmployee = async (employeeId: string) => {
    try {
      await removeUser(employeeId);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      toast.success('Team member removed successfully');
    } catch (err) {
      handleError(err, 'Failed to remove team member');
    }
  };

  const blockEmployee = async (employeeId: string) => {
    try {
      await blockUserAPI(employeeId);
      setEmployees((prev) => prev.map((emp) => emp.id === employeeId ? { ...emp, isBlocked: true } : emp));
      toast.success('Team member blocked successfully');
    } catch (err: any) {
      handleError(err, 'Failed to block team member');
    }
  };

  const unblockEmployee = async (employeeId: string) => {
    try {
      await unblockUserAPI(employeeId);
      setEmployees((prev) => prev.map((emp) => emp.id === employeeId ? { ...emp, isBlocked: false } : emp));
      toast.success('Team member unblocked successfully');
    } catch (err: any) {
      handleError(err, 'Failed to unblock team member');
    }
  };

  const contextValue = useMemo(
    () => ({
      tasks,
      employees,
      activities,
      addTask,
      updateTask,
      updateTaskStatus,
      updateTaskPriority,
      assignTask,
      deleteTask,
      addEmployee,
      updateEmployeeDesignation,
      updateEmployeeRole,
      removeEmployee,
      blockEmployee,
      unblockEmployee,
    }),
    [tasks, employees, activities]
  );

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
