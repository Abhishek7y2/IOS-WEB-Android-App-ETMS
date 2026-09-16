'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLeave, LeaveProvider } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveStatistics } from '../../components/leave/LeaveStatistics';
import { LeaveBalanceCard } from '../../components/leave/LeaveBalanceCard';
import { LeaveFilters } from '../../components/leave/LeaveFilters';
import { LeaveTable } from '../../components/leave/LeaveTable';
import { LeaveCalendar } from '../../components/leave/LeaveCalendar';
import { LeaveModal } from '../../components/leave/LeaveModal';
import { LeaveDetailsModal } from '../../components/leave/LeaveDetailsModal';
import { LeaveRequest } from '../../types/leave';
import { Plus, List, Calendar as CalendarIcon, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const LeaveContent = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'SuperAdmin' || user?.designation === 'CEO';
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'HR';
  
  const { leaves, loading, fetchLeaves, fetchBalance, fetchStats, updateLeaveStatus, deleteLeave } = useLeave();
  
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [filters, setFilters] = useState({ search: '', status: '', leaveType: '', department: '' });
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    // If status is "Today", fetch all approved leaves and filter client-side
    const queryFilters = filters.status === 'Today' ? { ...filters, status: 'Approved' } : filters;
    fetchLeaves(queryFilters);
  }, [filters, fetchLeaves]);

  useEffect(() => {
    fetchBalance();
    fetchStats();
  }, [fetchBalance, fetchStats]);

  const handleResetFilters = async () => {
    setFilters({ search: '', status: '', leaveType: '', department: '' });
    await Promise.all([fetchLeaves({}), fetchStats(), fetchBalance()]);
    toast.success('Leave filters reset and data refreshed!');
  };

  const displayLeaves = useMemo(() => {
    if (filters.status === 'Today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return leaves.filter(l => {
        if (l.status !== 'Approved') return false;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      });
    }
    return leaves;
  }, [leaves, filters.status]);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | 'cancel' | null;
    leave: LeaveRequest | null;
    message: string;
    reason: string;
  }>({ isOpen: false, action: null, leave: null, message: '', reason: '' });

  const executeConfirmAction = async () => {
    if (!confirmState.leave) return;
    
    if (confirmState.action === 'approve') {
      await updateLeaveStatus(confirmState.leave._id, 'Approved');
    } else if (confirmState.action === 'reject') {
      await updateLeaveStatus(confirmState.leave._id, 'Rejected', confirmState.reason);
    } else if (confirmState.action === 'cancel') {
      await updateLeaveStatus(confirmState.leave._id, 'Withdrawn');
    }
    
    setConfirmState({ isOpen: false, action: null, leave: null, message: '', reason: '' });
  };

  const handleApprove = (leave: LeaveRequest) => {
    setConfirmState({
      isOpen: true,
      action: 'approve',
      leave,
      message: `Are you sure you want to approve leave for ${leave.employeeName}?`,
      reason: ''
    });
  };

  const handleReject = (leave: LeaveRequest) => {
    setConfirmState({
      isOpen: true,
      action: 'reject',
      leave,
      message: `Are you sure you want to reject leave for ${leave.employeeName}?`,
      reason: ''
    });
  };

  const handleCancel = (leave: LeaveRequest) => {
    setConfirmState({
      isOpen: true,
      action: 'cancel',
      leave,
      message: `Are you sure you want to withdraw this leave request?`,
      reason: ''
    });
  };

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Leave Management</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your leaves and view team requests.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button in Header */}
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters & Refresh"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
          >
            <RotateCcw size={14} className="text-teal-600 dark:text-teal-400" />
            <span>Refresh</span>
          </button>

          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'table' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <List size={16} /> Table
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'calendar' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>
          {!isSuperAdmin && (
            <button 
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} className="text-white" />
              <span>Apply Leave</span>
            </button>
          )}
        </div>
      </header>

      {isAdmin && (
        <LeaveStatistics 
          activeStatus={filters.status}
          onCardClick={(status) => setFilters(prev => ({ ...prev, status }))} 
        />
      )}
      {!isAdmin && <LeaveBalanceCard />}

      {view === 'table' ? (
        <>
          <LeaveFilters 
            filters={filters} 
            setFilters={setFilters} 
            isAdmin={isAdmin} 
            onReset={handleResetFilters}
          />
          <LeaveTable 
            leaves={displayLeaves} 
            loading={loading} 
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onView={(leave) => { setSelectedLeave(leave); setIsDetailsModalOpen(true); }}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        </>
      ) : (
        <LeaveCalendar 
          leaves={displayLeaves} 
          onView={(leave) => { setSelectedLeave(leave); setIsDetailsModalOpen(true); }} 
        />
      )}

      <LeaveModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        onSuccess={() => setIsApplyModalOpen(false)} 
      />
      
      <LeaveDetailsModal 
        isOpen={isDetailsModalOpen} 
        leave={selectedLeave} 
        onClose={() => setIsDetailsModalOpen(false)} 
      />

      {/* Custom Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">Confirm Action</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{confirmState.message}</p>
            
            {confirmState.action === 'reject' && (
              <div className="mb-6">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason for Rejection</label>
                <textarea
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows={3}
                  value={confirmState.reason}
                  onChange={(e) => setConfirmState({ ...confirmState, reason: e.target.value })}
                  placeholder="Enter reason..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmState({ isOpen: false, action: null, leave: null, message: '', reason: '' })}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                disabled={confirmState.action === 'reject' && !confirmState.reason.trim()}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function LeavePage() {
  return (
    <LeaveProvider>
      <LeaveContent />
    </LeaveProvider>
  );
}
