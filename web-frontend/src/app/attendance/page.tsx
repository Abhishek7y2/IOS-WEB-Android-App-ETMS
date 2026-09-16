'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance, AttendanceProvider } from '../../context/AttendanceContext';
import { AttendanceActions } from '../../components/attendance/AttendanceActions';
import { AttendanceSummaryCards } from '../../components/attendance/AttendanceSummaryCards';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { AttendanceFilters } from '../../components/attendance/AttendanceFilters';
import { AttendanceDetailsModal } from '../../components/attendance/AttendanceDetailsModal';
import { AttendanceRecord } from '../../types/attendance';

const AttendanceContent = () => {
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'HR';
  
  const { records, loading, fetchRecords, fetchTodayRecord, fetchAnalytics } = useAttendance();
  const [filters, setFilters] = useState({ search: '', status: '', date: '', workMode: '', department: '' });
  
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchTodayRecord();
    fetchAnalytics();
  }, [fetchTodayRecord, fetchAnalytics]);

  useEffect(() => {
    fetchRecords(filters);
  }, [filters, fetchRecords]);

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Attendance Management</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Track working hours, breaks, and daily attendance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isAdmin && (
          <div className="lg:col-span-1">
            <AttendanceActions />
          </div>
        )}
        
        <div className={!isAdmin ? "lg:col-span-2" : "col-span-1 lg:col-span-3"}>
          {isAdmin && <AttendanceSummaryCards />}
          
          <div className="mt-2">
            <AttendanceFilters filters={filters} setFilters={setFilters} isAdmin={isAdmin} />
            <AttendanceTable 
              records={records}
              loading={loading}
              isAdmin={isAdmin}
              onView={(r) => { setSelectedRecord(r); setIsDetailsModalOpen(true); }}
            />
          </div>
        </div>
      </div>

      <AttendanceDetailsModal 
        isOpen={isDetailsModalOpen} 
        record={selectedRecord} 
        onClose={() => setIsDetailsModalOpen(false)} 
      />
    </div>
  );
};

export default function AttendancePage() {
  return (
    <AttendanceProvider>
      <AttendanceContent />
    </AttendanceProvider>
  );
}
