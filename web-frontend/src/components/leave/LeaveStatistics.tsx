import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Users, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  activeStatus?: string;
  onCardClick?: (status: string) => void;
}

export const LeaveStatistics: React.FC<Props> = ({ activeStatus, onCardClick }) => {
  const { stats, loading } = useLeave();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const handleCardClick = (statusTarget: string) => {
    if (!onCardClick) return;
    if (activeStatus === statusTarget) {
      onCardClick(''); // Toggle off if already selected
    } else {
      onCardClick(statusTarget);
    }
  };

  const getCardStyle = (statusTarget: string) => {
    const isActive = activeStatus === statusTarget;
    const base = 'relative bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer select-none';
    if (isActive) {
      return `${base} border-teal-600 dark:border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-[1.02] bg-teal-50/20 dark:bg-teal-950/10`;
    }
    return `${base} border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-sm hover:shadow-md`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* On Leave Today */}
      <div 
        className={getCardStyle('Today')}
        onClick={() => handleCardClick('Today')}
      >
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <Users size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">On Leave Today</p>
            {activeStatus === 'Today' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                Active <RotateCcw size={10} className="hover:rotate-180 transition-transform" />
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.onLeaveToday}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div 
        className={getCardStyle('Pending')} 
        onClick={() => handleCardClick('Pending')}
      >
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
          <Clock size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Pending Requests</p>
            {activeStatus === 'Pending' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                Active <RotateCcw size={10} className="hover:rotate-180 transition-transform" />
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.pendingRequests}</p>
        </div>
      </div>

      {/* Approved Leaves */}
      <div 
        className={getCardStyle('Approved')} 
        onClick={() => handleCardClick('Approved')}
      >
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
          <CheckCircle size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Approved Leaves</p>
            {activeStatus === 'Approved' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                Active <RotateCcw size={10} className="hover:rotate-180 transition-transform" />
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.approvedLeaves}</p>
        </div>
      </div>

      {/* Rejected Leaves */}
      <div 
        className={getCardStyle('Rejected')} 
        onClick={() => handleCardClick('Rejected')}
      >
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          <XCircle size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Rejected Leaves</p>
            {activeStatus === 'Rejected' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                Active <RotateCcw size={10} className="hover:rotate-180 transition-transform" />
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.rejectedLeaves}</p>
        </div>
      </div>
    </div>
  );
};
