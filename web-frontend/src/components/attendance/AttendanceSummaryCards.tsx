import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Users, UserMinus, Clock, MapPin, Building2, AlertCircle } from 'lucide-react';

export const AttendanceSummaryCards: React.FC = () => {
  const { analytics, loading } = useAttendance();

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Present Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.presentToday}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Working Remote (WFH)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.wfhToday}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Late Arrivals</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.lateToday}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Avg Working Hours</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.avgHours}h</p>
          </div>
        </div>
      </div>
    </div>
  );
};
