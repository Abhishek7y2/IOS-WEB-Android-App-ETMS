import React, { useState } from 'react';
import { LeaveRequest } from '../../types/leave';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  leaves: LeaveRequest[];
  onView: (leave: LeaveRequest) => void;
}

export const LeaveCalendar: React.FC<Props> = ({ leaves, onView }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getLeaveColor = (type: string) => {
    switch (type) {
      case 'Sick Leave': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30';
      case 'Casual Leave': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/30';
      case 'Earned Leave': return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/30';
      case 'Maternity Leave':
      case 'Paternity Leave': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/30';
      case 'Half-Day Leave': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/30';
      default: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30';
    }
  };

  // Only show approved leaves in the calendar
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
        </button>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border-t border-l border-zinc-200 dark:border-zinc-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-zinc-50 dark:bg-zinc-900/50 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {/* Empty cells before month start */}
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="bg-zinc-50/50 dark:bg-zinc-900/20 min-h-[100px] border-b border-r border-zinc-200 dark:border-zinc-800"></div>
        ))}

        {/* Day cells */}
        {[...Array(daysInMonth)].map((_, i) => {
          const d = i + 1;
          const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
          const dateStr = dateObj.toISOString().split('T')[0];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const isSunday = dateObj.getDay() === 0;

          // Find leaves that overlap with this date
          const dayLeaves = approvedLeaves.filter(l => {
            const start = new Date(l.startDate).toISOString().split('T')[0];
            const end = new Date(l.endDate).toISOString().split('T')[0];
            return dateStr >= start && dateStr <= end;
          });

          return (
            <div 
              key={d} 
              onClick={() => { if(dayLeaves.length > 0) onView(dayLeaves[0]); }}
              className={`min-h-[100px] p-2 border-b border-r border-zinc-200 dark:border-zinc-800 transition-colors ${dayLeaves.length > 0 ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-500/50' : isSunday ? 'bg-red-50/20 dark:bg-red-900/5' : 'bg-white dark:bg-zinc-900'}`}
            >
              <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : isSunday ? 'text-red-500 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {d}
              </div>

              <div className="space-y-1">
                {dayLeaves.map(l => (
                  <div 
                    key={l._id} 
                    className={`text-[10px] font-semibold px-2 py-1 rounded border truncate ${getLeaveColor(l.leaveType)}`}
                    title={`${l.employeeName} - ${l.leaveType}`}
                  >
                    {l.employeeName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
