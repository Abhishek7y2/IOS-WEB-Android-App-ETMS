'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search, X, Download, Paperclip, FileText, Image as ImageIcon, Table } from 'lucide-react';
import { toast } from 'sonner';
import { useTasks } from '../../context/TaskContext';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskTable } from '../../components/task/TaskTable';
import { TaskEditorModal } from '../../components/task/TaskEditorModal';
import { TaskDetailsModal } from '../../components/task/TaskDetailsModal';
import { AttachmentPanel } from '../../components/task/AttachmentPanel';
import { EnterpriseDateRangePicker } from '../../components/task/EnterpriseDateRangePicker';
import { Task, TaskAttachment, TaskInput, TaskPriority } from '../../types';
import { getFilteredTasksByUrlStatus, TaskUrlStatus } from '../../utils/dashboardUtils';
import { useAuth } from '../../context/AuthContext';

const convertFileToAttachment = (file: File): Promise<TaskAttachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

interface TasksClientProps {
  initialStatus: TaskUrlStatus;
}

const statusOptions: Array<{ value: TaskUrlStatus; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },

];

const defaultTaskForm: Omit<TaskInput, 'status'> & { status?: TaskInput['status'] } = {
  title: '',
  description: '',
  priority: 'medium',
  assignedTo: '',
  dueDate: getTodayString(),
};

const priorityWeights: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const TasksClient: React.FC<TasksClientProps> = ({ initialStatus }) => {
  const { tasks, employees, addTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskUrlStatus>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState(defaultTaskForm.title);
  const [newDescription, setNewDescription] = useState(defaultTaskForm.description);
  const [newPriority, setNewPriority] = useState<TaskPriority>(defaultTaskForm.priority);
  const [newAssignee, setNewAssignee] = useState(defaultTaskForm.assignedTo);
  const [newDueDate, setNewDueDate] = useState(defaultTaskForm.dueDate);
  const [createAttachments, setCreateAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed size of 10MB.`);
        continue;
      }
      try {
        const att = await convertFileToAttachment(file);
        newAttachments.push(att);
      } catch {
        toast.error(`Failed to attach file "${file.name}".`);
      }
    }

    setCreateAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(false);
    e.target.value = '';
  };

  const removeCreateAttachment = (id: string) => {
    setCreateAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, startDateFilter, endDateFilter]);

  // Field validation errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const urlFiltered = getFilteredTasksByUrlStatus(tasks, statusFilter);
    return urlFiltered
      .filter((task) => {
        const query = searchTerm.trim().toLowerCase();
        const employee = employees.find((item) => item.id === task.assignedTo);
        const matchesSearch =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          employee?.name.toLowerCase().includes(query);
        const matchesPriority = priorityFilter === 'all' || priorityFilter === 'a-z' || task.priority === priorityFilter;
        let matchesDate = true;
        if (startDateFilter) {
          matchesDate = matchesDate && task.dueDate >= startDateFilter;
        }
        if (endDateFilter) {
          matchesDate = matchesDate && task.dueDate <= endDateFilter;
        }
        return matchesSearch && matchesPriority && matchesDate;
      })
      .sort((a, b) => {
        if (priorityFilter === 'a-z') {
          return a.title.localeCompare(b.title);
        }
        // When viewing 'all' priorities, prioritize newest tasks first
        if (priorityFilter === 'all') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        // Otherwise, group by priority first, then newest
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        if (weightA !== weightB) {
          return weightB - weightA;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [employees, priorityFilter, searchTerm, statusFilter, tasks, startDateFilter, endDateFilter]);



  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  const resetCreateForm = () => {
    setNewTitle(defaultTaskForm.title);
    setNewDescription(defaultTaskForm.description);
    setNewPriority(defaultTaskForm.priority);
    setNewAssignee(defaultTaskForm.assignedTo);
    setNewDueDate(getTodayString());
    setCreateAttachments([]);
    setTitleError(null);
    setDescriptionError(null);
    setAssigneeError(null);
    setDueDateError(null);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // 1. Task Title Validation
    const trimmedTitle = newTitle.replace(/\s{2,}/g, ' ').trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      hasError = true;
    } else if (trimmedTitle.length < 5) {
      setTitleError('Task title must contain at least 5 characters.');
      hasError = true;
    } else if (trimmedTitle.length > 120) {
      setTitleError('Task title cannot exceed 120 characters.');
      hasError = true;
    } else if (/<[a-z][\s\S]*>/i.test(trimmedTitle)) {
      setTitleError('HTML or JavaScript code is not allowed.');
      hasError = true;
    } else {
      setTitleError(null);
    }

    // 2. Task Description Validation
    const trimmedDesc = newDescription.replace(/\s{2,}/g, ' ').trim();
    if (!trimmedDesc || trimmedDesc.length < 20) {
      setDescriptionError('Task description must contain at least 20 characters.');
      hasError = true;
    } else if (trimmedDesc.length > 1000) {
      setDescriptionError('Task description cannot exceed 1000 characters.');
      hasError = true;
    } else if (/<[a-z][\s\S]*>/i.test(trimmedDesc)) {
      setDescriptionError('HTML or JavaScript code is not allowed.');
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    if (!newAssignee) {
      setAssigneeError('Please assign this task to an employee.');
      hasError = true;
    } else {
      setAssigneeError(null);
    }

    const today = getTodayString();
    if (!newDueDate) {
      setDueDateError('Please select a due date.');
      hasError = true;
    } else if (new Date(newDueDate).getTime() < new Date(today).getTime()) {
      setDueDateError('Please select a due date that is today or in the future.');
      hasError = true;
    } else {
      // Due Date bounds based on Priority
      const maxDays = newPriority === 'critical' ? 7 : newPriority === 'medium' ? 30 : 90;
      const futureLimit = new Date();
      futureLimit.setDate(futureLimit.getDate() + maxDays);
      if (new Date(newDueDate).getTime() > futureLimit.getTime()) {
        setDueDateError(`Maximum due date for ${newPriority} priority is ${maxDays} days.`);
        hasError = true;
      } else {
        setDueDateError(null);
      }
    }

    if (hasError) return;

    try {
      await addTask({
        title: trimmedTitle,
        description: trimmedDesc,
        status: 'todo',
        priority: newPriority,
        assignedTo: newAssignee,
        dueDate: newDueDate,
        attachments: createAttachments,
      });
      resetCreateForm();
      setShowAddForm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create task.';
      if (msg.includes('duplicate') || msg.includes('exists')) setTitleError(msg);
      else if (msg.includes('employee has reached the maximum')) setAssigneeError(msg);
      else if (msg.includes('overdue tasks')) setAssigneeError(msg);
      else toast.error(msg);
    }
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const handleDownloadCSV = () => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks available to download.');
      return;
    }

    // Helper to format Priority cleanly (e.g. 'high' -> 'High')
    const formatPriority = (p: string) => {
      if (!p) return 'Medium';
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    };

    // Helper to format Status cleanly (e.g. 'todo' -> 'Pending', 'in_progress' -> 'In Progress')
    const formatStatus = (s: string) => {
      switch (s) {
        case 'todo': return 'Pending';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'overdue': return 'Overdue';
        case 'cancelled': return 'Cancelled';
        default: return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending';
      }
    };

    // Helper to format Date cleanly (e.g. '2026-08-28' -> '28 Aug 2026')
    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const headers = ['S.No.', 'Task Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Created At'];

    const escapeCSV = (val: any) => {
      const str = String(val ?? '').replace(/[\r\n]+/g, ' ');
      // Only wrap in double quotes if the field contains commas, double quotes, or leading/trailing spaces
      if (/[",\n\r]/.test(str) || str.trim() !== str) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...filteredTasks.map((task, index) => {
        const employee = employees.find(e => e.id === task.assignedTo);
        const assigneeName = employee ? employee.name : 'Unassigned';

        return [
          escapeCSV(index + 1),
          escapeCSV(task.title),
          escapeCSV(task.description),
          escapeCSV(formatPriority(task.priority)),
          escapeCSV(formatStatus(task.status)),
          escapeCSV(assigneeName),
          escapeCSV(formatDate(task.dueDate)),
          escapeCSV(formatDate(task.createdAt || ''))
        ].join(',');
      })
    ].join('\r\n');

    // Add UTF-8 BOM so Excel & Sheets open in clean line-by-line format
    const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_export_${getTodayString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Tasks</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">Review, create, and update task tracking logs assigned to employees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-teal-600/30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-2.5 text-xs font-extrabold text-teal-800 dark:text-teal-300 shadow-sm hover:border-teal-600 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 hover:shadow-lg hover:shadow-teal-600/15 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Download className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300" />
            <span>Export CSV</span>
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAddForm((current) => !current)}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {!showAddForm && <Plus className="h-4 w-4 text-white" />}
              <span>Create New Task</span>
            </button>
          )}
        </div>
      </div>

      {showAddForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowAddForm(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Create Task</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Create a new task and assign it to a team member.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-555">Title</span>
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{newTitle.length}/120 characters</span>
                  </div>
                  <input
                    maxLength={120}
                    value={newTitle}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Block starting with special chars
                      if (/^[_\-.,/]/.test(val)) return;
                      // Allow only Alphabets, Numbers, Spaces, _ / () & : , .
                      val = val.replace(/[^a-zA-Z0-9\s_/\()&:,.]/g, '');
                      // Title capitalization
                      val = val.replace(/\b\w/g, c => c.toUpperCase());
                      setNewTitle(val);
                    }}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${titleError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                      }`}
                  />
                  {titleError && <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>}
                </label>
                <label className="md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-555">Description</span>
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{newDescription.length}/1000 characters</span>
                  </div>
                  <textarea
                    maxLength={1000}
                    value={newDescription}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Emojis regex blocker
                      val = val.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
                      setNewDescription(val);
                    }}
                    rows={3}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${descriptionError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                      }`}
                  />
                  {descriptionError && <p className="mt-1 text-xs font-semibold text-red-500">{descriptionError}</p>}
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Priority</span>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-550">Assignee</span>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer ${assigneeError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                      }`}
                  >
                    <option value="">Select Employee</option>
                    {employees
                      .filter((emp) => {
                        if (!user) return true;
                        const loggedInId = user._id || user.id;
                        const empId = emp.id || (emp as any)._id;
                        if (user.role === 'superadmin') {
                          return empId !== loggedInId;
                        }
                        if (user.role === 'admin') {
                          if (empId === loggedInId) return false;
                          if (emp.role === 'admin' || emp.role === 'superadmin') return false;
                          return true;
                        }
                        return true;
                      })
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.designation || 'Employee'})
                        </option>
                      ))}
                  </select>
                  {assigneeError && <p className="mt-1 text-xs font-semibold text-red-500">{assigneeError}</p>}
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Due Date</span>
                  <input
                    min={getTodayString()}
                    type="date"
                    value={newDueDate}
                    onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${dueDateError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                      }`}
                  />
                  {dueDateError && <p className="mt-1 text-xs font-semibold text-red-500">{dueDateError}</p>}
                </label>

                <div className="md:col-span-2 flex flex-col pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1.5">
                    Please upload your document
                  </span>
                  <AttachmentPanel
                    attachments={createAttachments}
                    onAddAttachments={(newAtts) => setCreateAttachments((prev) => [...prev, ...newAtts])}
                    onRemoveAttachment={removeCreateAttachment}
                  />
                </div>

              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 sm:w-auto cursor-pointer">
                Create Task
              </button>

            </form>
          </div>
        </div>
      )}

      <div className="enterprise-card flex flex-col gap-3.5 rounded-2xl p-4.5 w-full max-w-full overflow-hidden">
        {/* Top Filter Bar: Search & Select Dropdowns */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
          <div className="relative max-w-md flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500 dark:text-zinc-500 pointer-events-none" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskUrlStatus)} className="flex-1 md:flex-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="flex-1 md:flex-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer">
              <option value="all">All Priorities</option>
              <option value="a-z">A-Z (Title)</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {(searchTerm !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || startDateFilter !== '' || endDateFilter !== '') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Enterprise Date Range Picker Section */}
        <div className="w-full pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <EnterpriseDateRangePicker
            startDate={startDateFilter}
            endDate={endDateFilter}
            onStartDateChange={setStartDateFilter}
            onEndDateChange={setEndDateFilter}
            onClear={() => {
              setStartDateFilter('');
              setEndDateFilter('');
            }}
          />
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          <TaskTable
            tasks={paginatedTasks}
            employees={employees}
            onDeleteTask={setTaskToDelete}
            onEditTask={setTaskToEdit}
            onViewTask={setViewingTask}
            onStatusChange={updateTaskStatus}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No tasks found" message="Try adjusting your filters or search terms." />
      )}

      <TaskEditorModal
        key={taskToEdit?.id ?? 'task-editor'}
        isOpen={taskToEdit !== null}
        task={taskToEdit}
        employees={employees}
        onClose={() => setTaskToEdit(null)}
        onSave={updateTask}
      />

      <ConfirmationModal
        isOpen={taskToDelete !== null}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      <TaskDetailsModal
        isOpen={viewingTask !== null}
        task={viewingTask}
        employees={employees}
        onClose={() => setViewingTask(null)}
      />
    </div>
  );
};
