import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Play, Square, Coffee, Clock } from 'lucide-react';

export const AttendanceActions: React.FC = () => {
  const { todayRecord, checkIn, checkOut, markBreakStart, markBreakEnd } = useAttendance();
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;
  const isOnBreak = !!todayRecord?.breakStart && !todayRecord?.breakEnd;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <div className="text-center mb-6">
        <Clock size={32} className="mx-auto text-blue-500 mb-2" />
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">{formatTime(time)}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center w-full">
        {!isCheckedIn ? (
          <button
            onClick={() => checkIn('Office')} // Simplification for MVP. We can add a modal to select WorkMode.
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-600/20"
          >
            <Play size={18} /> Check In
          </button>
        ) : !isCheckedOut ? (
          <>
            <button
              onClick={isOnBreak ? markBreakEnd : markBreakStart}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all shadow-sm ${
                isOnBreak 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Coffee size={18} /> {isOnBreak ? 'End Break' : 'Start Break'}
            </button>
            
            <button
              onClick={checkOut}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-red-600/20"
            >
              <Square size={18} /> Check Out
            </button>
          </>
        ) : (
          <div className="w-full text-center py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-medium border border-green-200 dark:border-green-900/50">
            Attendance completed for today.
          </div>
        )}
      </div>

      {isCheckedIn && (
        <div className="mt-6 w-full grid grid-cols-2 gap-4 text-center text-sm">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">Check In</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              {new Date(todayRecord.checkInTime!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{todayRecord.attendanceStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
};
