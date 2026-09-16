import React, { useEffect, useState } from 'react';
import { X, Paperclip, FileText, Image as ImageIcon, Table } from 'lucide-react';
import { toast } from 'sonner';
import { Employee, Task, TaskAttachment, TaskInput, TaskPriority, TaskStatus } from '../../types';

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

import { useAuth } from '../../context/AuthContext';

interface TaskEditorModalProps {
  isOpen: boolean;
  employees: Employee[];
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updates: TaskInput) => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  employees,
  task,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(() => task?.title ?? '');
  const [description, setDescription] = useState(() => task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(() => task?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(() => task?.priority ?? 'medium');
  const [assignedTo, setAssignedTo] = useState(() => task?.assignedTo ?? '');
  const [dueDate, setDueDate] = useState(() => (task?.dueDate ? task.dueDate.split('T')[0] : ''));
  const [attachments, setAttachments] = useState<TaskAttachment[]>(() => task?.attachments ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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

    setAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Field validation errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setStatus(task.status ?? 'todo');
      setPriority(task.priority ?? 'medium');
      setAssignedTo(task.assignedTo ?? '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setAttachments(task.attachments ?? []);
      setTitleError(null);
      setDescriptionError(null);
      setAssigneeError(null);
      setDueDateError(null);
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let hasError = false;

    if (!title.trim()) {
      setTitleError('Please enter a task title.');
      hasError = true;
    } else if (title.length > 150) {
      setTitleError('Please keep the task title under 150 characters.');
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (!description.trim()) {
      setDescriptionError('Please enter a task description.');
      hasError = true;
    } else if (description.length > 500) {
      setDescriptionError('Please keep the task description under 500 characters.');
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    if (!assignedTo) {
      setAssigneeError('Please assign this task to an employee.');
      hasError = true;
    } else {
      setAssigneeError(null);
    }

    if (!dueDate) {
      setDueDateError('Please select a due date.');
      hasError = true;
    } else {
      setDueDateError(null);
    }

    if (hasError) return;

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo,
      dueDate,
      attachments,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit task modal"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Edit Task</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Update task details and manage attached documents.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Title <span className="text-red-500">*</span>
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{title.length}/150 characters</span>
              </div>
              <input
                maxLength={150}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter task title"
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-teal-700/20 dark:bg-zinc-950 dark:text-zinc-50 ${
                  titleError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-teal-700 dark:border-zinc-700 dark:focus:border-teal-500'
                }`}
              />
              {titleError && <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>}
            </label>
            <label className="md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Description <span className="text-red-500">*</span>
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{description.length}/500 characters</span>
              </div>
              <textarea
                value={description}
                maxLength={500}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter task details..."
                rows={4}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-teal-700/20 dark:bg-zinc-950 dark:text-zinc-50 ${
                  descriptionError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-teal-700 dark:border-zinc-700 dark:focus:border-teal-500'
                }`}
              />
              {descriptionError && <p className="mt-1 text-xs font-semibold text-red-500">{descriptionError}</p>}
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Status <span className="text-red-500">*</span>
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-teal-500 font-semibold cursor-pointer"
              >
                <option value="todo">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Priority <span className="text-red-500">*</span>
              </span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-teal-500 font-semibold cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Assignee <span className="text-red-500">*</span>
              </span>
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-teal-700/20 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer ${
                  assigneeError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-teal-700 dark:border-zinc-700 dark:focus:border-teal-500'
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Due Date <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                min={today}
                value={dueDate}
                onClick={(e) => 'showPicker' in HTMLInputElement.prototype && (e.target as HTMLInputElement).showPicker()}
                onChange={(event) => setDueDate(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-teal-700/20 dark:bg-zinc-950 dark:text-zinc-50 ${
                  dueDateError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-teal-700 dark:border-zinc-700 dark:focus:border-teal-500'
                }`}
              />
              {dueDateError && <p className="mt-1 text-xs font-semibold text-red-500">{dueDateError}</p>}
            </label>

            {/* ── ATTACH DOCUMENTS / FILES SECTION ── */}
            <div className="md:col-span-2 space-y-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  Attach Documents / Files
                </span>
                <span className="text-[9px] text-zinc-500 font-semibold">
                  Accepts CSV, Excel, PDF, Photos & MS Office
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-600/50 bg-teal-50/40 dark:bg-teal-950/20 px-4 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-600 transition cursor-pointer shrink-0">
                  <Paperclip className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading...' : 'Attach Files'}</span>
                  <input
                    type="file"
                    multiple
                    accept=".csv,.xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,image/*,text/csv,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {attachments.length > 0
                    ? `${attachments.length} file(s) attached`
                    : 'No files attached yet'}
                </span>
              </div>

              {/* Attached Files List Previews */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        {att.name.endsWith('.pdf') ? (
                          <FileText className="h-4 w-4 text-red-500 shrink-0" />
                        ) : att.name.endsWith('.csv') || att.name.endsWith('.xls') || att.name.endsWith('.xlsx') ? (
                          <Table className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : att.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-purple-600 shrink-0" />
                        ) : (
                          <Paperclip className="h-4 w-4 text-teal-600 shrink-0" />
                        )}
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{att.name}</span>
                        <span className="text-[9px] text-zinc-500 shrink-0 font-medium">({(att.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-teal-900/20 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
