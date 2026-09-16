'use client';

import React, { useState } from 'react';
import axiosInstance from '@/services/axios';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Plus, LayoutGrid, List, X, Eye, FileText, UserRound, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

import { Holiday } from '@/types/holiday';
import { HolidayTable } from '@/components/calendar/HolidayTable';
import { HolidayCard } from '@/components/calendar/HolidayCard';
import { NotepadView } from '@/components/calendar/NotepadView';
import { HolidayModal } from '@/components/calendar/HolidayModal';
import { HolidayForm } from '@/components/calendar/HolidayForm';
import { HolidayDetails } from '@/components/calendar/HolidayDetails';
import { HolidayCalendarEvent } from '@/components/calendar/HolidayCalendarEvent';
import { TaskDetailsModal } from '@/components/task/TaskDetailsModal';
import { StatusBadge } from '@/components/task/StatusBadge';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task } from '@/types';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 font-bold',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 font-bold',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 font-bold',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 font-bold',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 font-bold',
};

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks, employees } = useTasks();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'HR';

  const [view, setView] = useState<'calendar' | 'list' | 'notepad'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ year: '', month: '', holidayType: '', status: '' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Day Overview & Task Detail Modal states
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  const fetchHolidaysQuery = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);
    if (filters.holidayType) params.append('holidayType', filters.holidayType);
    if (filters.status) params.append('status', filters.status);

    const [holidaysRes, statsRes] = await Promise.all([
      axiosInstance.get(`/holidays?${params.toString()}`).catch(() => ({ data: { data: [] } })),
      axiosInstance.get('/holidays/stats').catch(() => ({ data: { data: null } }))
    ]);
    return {
      holidays: holidaysRes.data.data || [],
      stats: statsRes.data.data
    };
  };

  const { data, isLoading: loading, refetch: refetchHolidays } = useQuery({
    queryKey: ['holidays', searchQuery, filters.year, filters.month, filters.holidayType, filters.status],
    queryFn: fetchHolidaysQuery,
  });

  const holidays: Holiday[] = data?.holidays || [];

  // Form Handlers
  const handleCreateSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/holidays', data);
      setIsModalOpen(false);
      refetchHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedHoliday) return;
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/holidays/${selectedHoliday._id}`, data);
      setIsModalOpen(false);
      refetchHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Holiday Delete State
  const [holidayDeleteConfirm, setHolidayDeleteConfirm] = useState<{
    isOpen: boolean;
    holiday: Holiday | null;
  }>({ isOpen: false, holiday: null });

  const handleDelete = (holiday: Holiday) => {
    setHolidayDeleteConfirm({ isOpen: true, holiday });
  };

  const executeDeleteHoliday = async () => {
    if (!holidayDeleteConfirm.holiday) return;
    try {
      await axiosInstance.delete(`/holidays/${holidayDeleteConfirm.holiday._id}`);
      toast.success('Holiday deleted successfully!');
      refetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
    } finally {
      setHolidayDeleteConfirm({ isOpen: false, holiday: null });
    }
  };

  // Actions
  const openCreateModal = () => {
    setSelectedHoliday(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Compute tasks & holidays for selectedDate
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  
  const selectedDayTasks = tasks.filter(t => {
    const due = t.dueDate ? t.dueDate.split('T')[0] : '';
    const created = t.createdAt ? t.createdAt.split('T')[0] : '';
    return due === selectedDateStr || created === selectedDateStr;
  });

  const selectedDayHolidays = holidays.filter((h: Holiday) => h.holidayDate.split('T')[0] === selectedDateStr);

  return (
    <div className="mx-auto max-w-[1600px] p-6 md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Company Calendar
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Manage and view company holidays, events, and assigned tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <LayoutGrid size={16} /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <List size={16} /> List
            </button>
            <button
              onClick={() => setView('notepad')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'notepad' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Notepad
            </button>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} className="text-white" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Dynamic View */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
          
          {view === 'notepad' ? (
            <NotepadView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          ) : view === 'list' ? (
            <HolidayTable
              holidays={holidays}
              loading={loading}
              onView={openViewModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 flex justify-between items-center bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <button onClick={prevMonth} className="px-4 py-2 text-sm font-medium bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 transition-colors">Previous</button>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{monthName}</h2>
                <button onClick={nextMonth} className="px-4 py-2 text-sm font-medium bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 transition-colors">Next</button>
              </div>

              <div className="grid grid-cols-7 text-center font-semibold text-xs text-zinc-600 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 gap-[1px]">
                {/* Empty cells */}
                {[...Array(firstDay)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border border-zinc-200/50 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/20" />
                ))}

                {/* Day cells */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const d = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                  const todayObj = new Date();
                  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

                  const dayHolidays = holidays.filter((h: Holiday) => h.holidayDate.split('T')[0] === dateStr);
                  const dayTasks = tasks.filter(t => {
                    const due = t.dueDate ? t.dueDate.split('T')[0] : '';
                    const created = t.createdAt ? t.createdAt.split('T')[0] : '';
                    return due === dateStr || created === dateStr;
                  });

                  const isToday = todayStr === dateStr;
                  const isSunday = dateObj.getDay() === 0;

                  return (
                    <div
                      key={d}
                      onClick={() => {
                        setSelectedDate(dateObj);
                        setIsDayModalOpen(true);
                      }}
                      className={`h-24 p-2 overflow-y-auto transition-all border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 ${selectedDate.getTime() === dateObj.getTime() ? 'ring-2 ring-inset ring-teal-500 bg-teal-50/40 dark:bg-teal-900/20' : isToday ? 'bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-500/50' : isSunday ? 'bg-red-50/40 dark:bg-red-900/20' : 'bg-white dark:bg-zinc-900'}`}
                    >
                      <div className={`font-bold text-sm mb-1.5 flex items-center justify-between ${isToday ? 'text-blue-600 dark:text-blue-400' : isSunday ? 'text-red-500 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        <span>{d}</span>
                        {isToday && <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">Today</span>}
                      </div>

                      {/* Display Holiday badge if present */}
                      {dayHolidays.map(h => (
                        <HolidayCalendarEvent key={h._id} holiday={h} onClick={openViewModal} />
                      ))}

                      {/* Clean Summary Pill for Tasks on this date */}
                      {dayTasks.length > 0 && (
                        <div
                          className="mt-1 px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-[10px] font-bold text-teal-800 dark:text-teal-300 truncate hover:border-teal-600 transition-colors shadow-2xs flex items-center justify-between"
                          title={`${dayTasks.length} task(s) scheduled for this date`}
                        >
                          <span className="truncate">• {dayTasks.length} Task{dayTasks.length > 1 ? 's' : ''}</span>
                          <span className="text-[9px] underline font-extrabold text-teal-700 dark:text-teal-400 ml-1">View</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Widgets */}
        {view !== 'notepad' && (
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <HolidayCard holidays={holidays} loading={loading} />
          </div>
        )}
      </div>

      {/* ── DAY OVERVIEW MODAL (SECTION 1: TASKS | SECTION 2: HOLIDAYS) ── */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" onClick={() => setIsDayModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 font-sans">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">
                    Schedule for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {selectedDayTasks.length} Task(s) • {selectedDayHolidays.length} Holiday(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto space-y-6 pr-1 flex-1">
              
              {/* SECTION 1: ASSIGNED TASKS */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Section 1: Tasks ({selectedDayTasks.length})
                  </h4>
                </div>

                {selectedDayTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayTasks.map((t) => {
                      const assignee = employees.find(e => e.id === t.assignedTo);
                      return (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-teal-600 dark:hover:border-teal-500 transition shadow-2xs group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{t.title}</h5>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${priorityColors[t.priority] || priorityColors.medium}`}>
                                {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                              </span>
                              <StatusBadge status={t.status} />
                            </div>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                            {t.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                              <UserRound className="h-3.5 w-3.5 text-teal-600" />
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                Assigned to: {assignee ? assignee.name : 'Unassigned'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTaskForModal(t);
                                setIsTaskDetailsOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white transition cursor-pointer shadow-xs"
                            >
                              <Eye size={14} />
                              <span>View Full Task</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20">
                    <p className="text-xs font-semibold text-zinc-500">No tasks assigned or due on this date.</p>
                  </div>
                )}
              </div>

              {/* SECTION 2: COMPANY HOLIDAYS */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    Section 2: Holidays {selectedDayHolidays.length > 0 ? `(${selectedDayHolidays.length})` : '(None)'}
                  </h4>
                </div>

                {selectedDayHolidays.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayHolidays.map(h => (
                      <div
                        key={h._id}
                        onClick={() => openViewModal(h)}
                        className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">{h.holidayName}</p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">{h.holidayType} • {h.description || 'Public Holiday'}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">View Holiday</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20">
                    <p className="text-xs font-semibold text-zinc-500">No holidays on this date.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold text-white dark:text-zinc-900 transition cursor-pointer"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TASK DETAILS MODAL (FOR INSPECTING SELECTED TASK) ── */}
      <TaskDetailsModal
        isOpen={isTaskDetailsOpen}
        task={selectedTaskForModal}
        employees={employees}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTaskForModal(null);
        }}
      />

      {/* ── HOLIDAY MODAL ── */}
      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Holiday' : modalMode === 'edit' ? 'Edit Holiday' : 'Holiday Details'}
      >
        {modalMode === 'view' && selectedHoliday && (
          <HolidayDetails holiday={selectedHoliday} />
        )}
        {(modalMode === 'create' || modalMode === 'edit') && (
          <HolidayForm
            initialData={selectedHoliday}
            onSubmit={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={isSubmitting}
          />
        )}
      </HolidayModal>

      {/* Enterprise Confirmation Modal for Holiday Deletion */}
      <ConfirmationModal
        isOpen={holidayDeleteConfirm.isOpen}
        title="Delete Holiday"
        message={`Are you sure you want to delete "${holidayDeleteConfirm.holiday?.holidayName}"? This action cannot be undone.`}
        confirmLabel="Delete Holiday"
        cancelLabel="Cancel"
        onConfirm={executeDeleteHoliday}
        onCancel={() => setHolidayDeleteConfirm({ isOpen: false, holiday: null })}
      />
    </div>
  );
}
