import React from 'react';
import { HolidayStats } from '../../types/holiday';
import { CalendarDays, Star, CalendarClock, CalendarCheck } from 'lucide-react';

interface Props {
  stats: HolidayStats | null;
  loading: boolean;
}

export const HolidayStatistics: React.FC<Props> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <CalendarDays size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Holidays</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.totalHolidays}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
          <Star size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Optional Holidays</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.optionalHolidays}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
          <CalendarClock size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Upcoming Holidays</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.upcomingHolidays}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
          <CalendarCheck size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Passed Holidays</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.passedHolidays}</p>
        </div>
      </div>
    </div>
  );
};
