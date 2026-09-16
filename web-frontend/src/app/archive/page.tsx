'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getArchivedTasks, restoreTask, getArchivedUsers, restoreUser, permanentDeleteTask, permanentDeleteUser } from '@/api/tasks';
import { Task, Employee } from '@/types';
import { toast } from 'sonner';

export default function ArchivePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'users'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewedTask, setViewedTask] = useState<Task | null>(null);
  const [viewedUser, setViewedUser] = useState<Employee | null>(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);

  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.designation?.toLowerCase() === 'admin' || user?.designation?.toLowerCase() === 'ceo' || user?.designation?.toLowerCase() === 'project manager';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'tasks') {
        const archivedTasks = await getArchivedTasks();
        setTasks(archivedTasks);
      } else {
        const archivedUsers = await getArchivedUsers();
        setUsers(archivedUsers);
      }
    } catch (error) {
      console.error('Failed to load archive data', error);
      toast.error('Failed to load archived items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      await restoreTask(taskId);
      toast.success('Task restored successfully');
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      toast.error('Failed to restore task');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await restoreUser(userId);
      toast.success('User restored successfully');
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error) {
      toast.error('Failed to restore user');
    }
  };

  const handlePermanentDeleteTask = async (taskId: string) => {
    try {
      await permanentDeleteTask(taskId);
      toast.success('Task permanently deleted');
      setTasks(tasks.filter((t) => t.id !== taskId));
      setDeleteTaskConfirm(null);
    } catch (error) {
      toast.error('Failed to permanently delete task');
    }
  };

  const handlePermanentDeleteUser = async (userId: string) => {
    try {
      await permanentDeleteUser(userId);
      toast.success('User permanently deleted');
      setUsers(users.filter((u) => u.id !== userId));
      setDeleteUserConfirm(null);
    } catch (error) {
      toast.error('Failed to permanently delete user');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-80px)] w-full flex-col p-4 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Archive
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage deleted tasks and users. You can restore them if needed.
            </p>
          </div>
        </div>

        {!isAdmin ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-zinc-200/50 bg-white/50 p-12 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <div className="max-w-md">
              <svg className="mx-auto h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Access Denied</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                You do not have permission to view the archive. This area is restricted to administrators only.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 pt-4">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 font-semibold ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
              >
                Deleted Tasks
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-semibold ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
              >
                Deleted Users
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600"></div>
                </div>
              ) : activeTab === 'tasks' ? (
                tasks.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-zinc-600">No deleted tasks found.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex flex-col justify-between rounded-xl border border-zinc-200/50 bg-white p-4 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                            <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                              Status: {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => setViewedTask(task)}
                            className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="View Details"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleRestoreTask(task.id)}
                            className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                          >
                            Restore Task
                          </button>
                          <button
                            onClick={() => setDeleteTaskConfirm(task.id)}
                            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                users.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-zinc-600">No deleted users found.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((u) => (
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200/50 bg-white p-4 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-600 dark:bg-zinc-800">
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setViewedUser(u)}
                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="View Details"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRestoreUser(u.id)}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => setDeleteUserConfirm(u.id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Task View Modal */}
        {viewedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Task Details</h2>
                <button onClick={() => setViewedTask(null)} className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-medium text-zinc-600">Title</span>
                  <p className="text-zinc-900 dark:text-zinc-100">{viewedTask.title}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-600">Description</span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{viewedTask.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-zinc-600">Status</span>
                    <p className="text-zinc-900 dark:text-zinc-100 capitalize">{viewedTask.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-zinc-600">Priority</span>
                    <p className="text-zinc-900 dark:text-zinc-100 capitalize">{viewedTask.priority}</p>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-600">Created At</span>
                  <p className="text-zinc-900 dark:text-zinc-100">{new Date(viewedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewedTask(null)} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* User View Modal */}
        {viewedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">User Details</h2>
                <button onClick={() => setViewedUser(null)} className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {viewedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{viewedUser.name}</h3>
                  <p className="text-sm text-zinc-600">{viewedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <span className="block text-xs font-medium text-zinc-600">Role</span>
                  <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 capitalize">{viewedUser.role}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <span className="block text-xs font-medium text-zinc-600">Designation</span>
                  <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 capitalize">{viewedUser.designation || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewedUser(null)} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Close</button>
              </div>
            </div>
          </div>
        )}
        {deleteTaskConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-500">Delete Task?</h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to permanently delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeleteTaskConfirm(null)} 
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handlePermanentDeleteTask(deleteTaskConfirm)} 
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {deleteUserConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-500">Delete User?</h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeleteUserConfirm(null)} 
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handlePermanentDeleteUser(deleteUserConfirm)} 
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
