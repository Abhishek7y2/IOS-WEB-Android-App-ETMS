import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../services/axios';
import { Loader2, Save, PlusCircle, Trash2, Search, FileText, CheckCircle2, CalendarDays, X, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { StatusBadge } from '../task/StatusBadge';
import { TaskDetailsModal } from '../task/TaskDetailsModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Task } from '../../types';

interface Props {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const NotepadView: React.FC<Props> = ({ selectedDate, setSelectedDate }) => {
  const { user } = useAuth();
  const { tasks, employees } = useTasks();

  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [activeNoteDate, setActiveNoteDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [fetchingAllNotes, setFetchingAllNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Filter states for Notes and Tasks
  const [noteDateFilter, setNoteDateFilter] = useState<string>('');
  const [taskDateFilter, setTaskDateFilter] = useState<string>('');

  // Confirmation Modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    noteId: string | null;
  }>({ isOpen: false, noteId: null });

  // Task Inspection Modal state inside notepad
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  // Fetch all saved notes list for left panel
  const fetchAllNotes = useCallback(async () => {
    try {
      setFetchingAllNotes(true);
      const res = await axiosInstance.get('/notes/history');
      if (res.data?.success) {
        setAllNotes(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notes history', error);
    } finally {
      setFetchingAllNotes(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  // Handle Save Note
  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.error('Cannot save empty note content.');
      return;
    }
    try {
      setSaving(true);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const res = await axiosInstance.post(`/notes/${todayStr}`, { content: note, noteId });
      if (res.data?.data?._id) {
        setNoteId(res.data.data._id);
        if (res.data.data.createdAt) {
          setActiveNoteDate(new Date(res.data.data.createdAt));
        }
      }
      toast.success(noteId ? 'Note updated successfully!' : 'New note created successfully!');
      fetchAllNotes();
    } catch (error) {
      console.error('Failed to save note', error);
      toast.error('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Click
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmState({ isOpen: true, noteId: id });
  };

  const executeDeleteNote = async () => {
    if (!deleteConfirmState.noteId) return;
    const idToDelete = deleteConfirmState.noteId;
    try {
      await axiosInstance.delete(`/notes/${idToDelete}`);
      toast.success('Note deleted successfully!');
      if (noteId === idToDelete) {
        setNote('');
        setNoteId(null);
        setActiveNoteDate(new Date());
      }
      fetchAllNotes();
    } catch (error) {
      console.error('Failed to delete note', error);
      toast.error('Failed to delete note.');
    } finally {
      setDeleteConfirmState({ isOpen: false, noteId: null });
    }
  };

  // Handle Create New Page / New Note
  const handleNewPage = () => {
    setNote('');
    setNoteId(null);
    setActiveNoteDate(new Date());
    setSelectedDate(new Date());
    toast.info('New blank note page ready. Start typing and click Save.');
  };

  // Filter notes based on search query & selected note date filter
  const filteredNotes = allNotes.filter(n => {
    const matchesSearch = 
      (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.createdAt && n.createdAt.includes(searchQuery));

    if (!noteDateFilter) return matchesSearch;

    const createdDate = n.createdAt ? n.createdAt.split('T')[0] : (n.dateStr || '');
    return matchesSearch && createdDate === noteDateFilter;
  });

  // Filter tasks based on search query & selected task date filter
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!taskDateFilter) return matchesSearch;

    const createdDate = t.createdAt ? t.createdAt.split('T')[0] : '';
    const dueDate = t.dueDate ? t.dueDate.split('T')[0] : '';
    return matchesSearch && (createdDate === taskDateFilter || dueDate === taskDateFilter);
  });

  return (
    <div className="flex-1 w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-220px)] font-sans">
      
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Notepad & Tasks Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Write, edit, and manage multiple notes and assigned tasks side-by-side.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            type="button"
            onClick={handleNewPage}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-xl shadow-xs border border-zinc-300 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>New Page</span>
          </button>

          <button 
            type="button"
            onClick={handleSaveNote}
            disabled={saving || fetching}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Save Note</span>
          </button>

          <div className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-extrabold shadow-2xs flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{activeNoteDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Body */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* ── LEFT PANEL: NOTES & TASKS MANAGER SIDEBAR ── */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden shrink-0">
          
          {/* Panel Tabs with Integrated Small Calendar Buttons for BOTH Notes and Tasks */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 p-1.5 gap-1 items-center">
            
            {/* My Notes Tab & Date Filter */}
            <div className="flex-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <FileText size={14} />
                <span>My Notes ({filteredNotes.length})</span>
              </button>

              <div className="relative shrink-0" title="Click to filter notes by date">
                <input
                  type="date"
                  value={noteDateFilter}
                  onChange={(e) => {
                    setNoteDateFilter(e.target.value);
                    setActiveTab('notes');
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <button
                  type="button"
                  className={`p-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    noteDateFilter
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <CalendarDays size={14} />
                </button>
              </div>
            </div>

            {/* My Tasks Tab & Date Filter */}
            <div className="flex-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>My Tasks ({filteredTasks.length})</span>
              </button>

              <div className="relative shrink-0" title="Click to filter tasks by date">
                <input
                  type="date"
                  value={taskDateFilter}
                  onChange={(e) => {
                    setTaskDateFilter(e.target.value);
                    setActiveTab('tasks');
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <button
                  type="button"
                  className={`p-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    taskDateFilter
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <CalendarDays size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Active Date Filter Badges */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'notes' ? "Search notes..." : "Search tasks..."}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-600 transition"
              />
            </div>

            {/* Active Note Date Filter Badge */}
            {noteDateFilter && activeTab === 'notes' && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-[10px] text-teal-800 dark:text-teal-300 font-bold">
                <span className="flex items-center gap-1">
                  <Filter size={11} className="text-teal-600" />
                  Showing notes for: <span className="font-mono text-zinc-900 dark:text-zinc-100">{noteDateFilter}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setNoteDateFilter('')}
                  className="hover:bg-teal-200/60 dark:hover:bg-teal-900/60 p-0.5 rounded transition cursor-pointer"
                  title="Clear note date filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Active Task Date Filter Badge */}
            {taskDateFilter && activeTab === 'tasks' && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-[10px] text-teal-800 dark:text-teal-300 font-bold">
                <span className="flex items-center gap-1">
                  <Filter size={11} className="text-teal-600" />
                  Showing tasks for: <span className="font-mono text-zinc-900 dark:text-zinc-100">{taskDateFilter}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTaskDateFilter('')}
                  className="hover:bg-teal-200/60 dark:hover:bg-teal-900/60 p-0.5 rounded transition cursor-pointer"
                  title="Clear task date filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Content List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activeTab === 'notes' ? (
              fetchingAllNotes ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-teal-600" />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <FileText className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No notes found</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {noteDateFilter ? `No notes created on ${noteDateFilter}. Click 'X' to clear date filter.` : "Click 'New Page' above to create a new note."}
                  </p>
                </div>
              ) : (
                filteredNotes.map((n) => {
                  const title = n.title || (n.content ? n.content.trim().split('\n')[0] : 'Untitled Note');
                  const preview = n.content.trim().substring(0, 60) + (n.content.length > 60 ? '...' : '');
                  
                  const createdDateObj = n.createdAt ? new Date(n.createdAt) : new Date(n.dateStr);
                  const formattedDate = createdDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const formattedTime = createdDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                  const isSelected = noteId === n._id;

                  return (
                    <div
                      key={n._id}
                      onClick={() => {
                        setNote(n.content);
                        setNoteId(n._id);
                        setActiveNoteDate(createdDateObj);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-300 dark:bg-teal-950/40 dark:border-teal-700/60 shadow-2xs'
                          : 'bg-zinc-50/50 border-zinc-200/80 dark:bg-zinc-950/20 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formattedDate} • {formattedTime}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(n._id, e)}
                          title="Delete note"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-0.5">{title}</h5>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {preview || <span className="italic text-zinc-400">Empty note page</span>}
                      </p>
                    </div>
                  );
                })
              )
            ) : (
              /* TASKS MANAGER TAB CONTENT WITH DATE FILTER SUPPORT */
              filteredTasks.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No tasks found</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {taskDateFilter ? `No tasks found for ${taskDateFilter}. Click 'X' to clear date filter.` : "Tasks assigned to you will appear here."}
                  </p>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const assignee = employees.find(e => e.id === t.assignedTo);
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskForModal(t);
                        setIsTaskDetailsOpen(true);
                      }}
                      className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 hover:border-teal-600 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">{t.title}</h5>
                        <StatusBadge status={t.status} />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-2">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {assignee ? assignee.name : 'Unassigned'}
                        </span>
                        <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">
                          Due: {t.dueDate ? t.dueDate.split('T')[0] : 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: LINED YELLOW NOTEPAD CANVAS ── */}
        <div className="flex-1 h-full bg-[#fcf9d9] rounded-xl overflow-hidden shadow-inner relative border border-[#e6e2b8] flex flex-col">
          
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={fetching}
            placeholder="Type your notes, ideas, meeting logs, or tasks here..."
            className="w-full h-full p-6 md:p-8 bg-transparent resize-none outline-none text-zinc-800 font-medium text-base md:text-lg leading-relaxed z-20"
            spellCheck="false"
          />

          {fetching && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
              <Loader2 size={32} className="text-amber-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Confirmation Modal for Note Deletion */}
      <ConfirmationModal
        isOpen={deleteConfirmState.isOpen}
        title="Delete Note Page"
        message="Are you sure you want to delete this note page? This action cannot be undone."
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        onConfirm={executeDeleteNote}
        onCancel={() => setDeleteConfirmState({ isOpen: false, noteId: null })}
      />

      {/* Task Details Modal (If clicked from left task list) */}
      <TaskDetailsModal
        isOpen={isTaskDetailsOpen}
        task={selectedTaskForModal}
        employees={employees}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTaskForModal(null);
        }}
      />
    </div>
  );
};
