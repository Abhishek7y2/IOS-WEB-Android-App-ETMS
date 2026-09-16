import React from 'react';
import { Holiday } from '../../types/holiday';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Props {
  holidays: Holiday[];
  loading: boolean;
}

export const HolidayCard: React.FC<Props> = ({ holidays, loading }) => {
  const upcomingHolidays = holidays
    .filter(h => new Date(h.holidayDate) >= new Date())
    .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())
    .slice(0, 5); // Next 5 holidays

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse flex justify-between mb-6">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nextHoliday = upcomingHolidays[0];

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Calendar size={20} className="text-blue-500" /> Upcoming Holidays
        </h3>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {nextHoliday && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Next Holiday</div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-blue-950 dark:text-blue-100 mb-1">{nextHoliday.holidayName}</h4>
                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <Clock size={14} />
                  {new Date(nextHoliday.holidayDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="bg-white dark:bg-blue-950 px-3 py-2 rounded-lg text-center shadow-sm border border-blue-100 dark:border-blue-800">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{getDaysRemaining(nextHoliday.holidayDate)}</div>
                <div className="text-[10px] font-medium text-blue-500 mt-1 uppercase">Days Left</div>
              </div>
            </div>
            <div className="mt-3 inline-block px-2 py-1 bg-white/60 dark:bg-zinc-900/40 rounded text-xs text-blue-800 dark:text-blue-300 font-medium">
              {nextHoliday.holidayType}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {upcomingHolidays.slice(1).length === 0 && !nextHoliday && (
            <div className="text-center py-8 text-zinc-600 flex flex-col items-center">
              <Calendar size={48} className="text-zinc-300 mb-3" />
              <p>No upcoming holidays found.</p>
            </div>
          )}

          {upcomingHolidays.slice(1).map(holiday => (
            <div key={holiday._id} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors rounded-xl">
              <div>
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{holiday.holidayName}</h4>
                <p className="text-xs text-zinc-600 mt-0.5">{new Date(holiday.holidayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded font-medium">
                  {holiday.holidayType.replace(' Holiday', '')}
                </span>
                {holiday.location && (
                  <p className="text-[10px] text-zinc-500 mt-1 flex items-center justify-end gap-1">
                    <MapPin size={10} /> {holiday.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
