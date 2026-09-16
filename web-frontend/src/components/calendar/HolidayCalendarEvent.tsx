import React from 'react';
import { Holiday } from '../../types/holiday';
import { Info } from 'lucide-react';

interface Props {
  holiday: Holiday;
  onClick: (holiday: Holiday) => void;
}

export const HolidayCalendarEvent: React.FC<Props> = ({ holiday, onClick }) => {
  const getColorClass = (type: string, status: string) => {
    if (status === 'Cancelled') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
    
    switch (type) {
      case 'National Holiday':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'Festival Holiday':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
      case 'Company Holiday':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'Regional Holiday':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'Optional Holiday':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50';
      case 'Restricted Holiday':
        return 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(holiday);
      }}
      className={`relative group cursor-pointer text-[10px] sm:text-xs font-semibold px-2 py-1 mb-1 rounded flex items-center justify-between border transition-all hover:brightness-95 ${getColorClass(holiday.holidayType, holiday.status)}`}
    >
      <span className="truncate">{holiday.holidayName}</span>
      <Info size={12} className="opacity-50 flex-shrink-0 ml-1" />

      {/* Tooltip */}
      <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-zinc-900 text-white text-xs rounded-lg p-2.5 shadow-xl">
        <p className="font-bold text-sm mb-1">{holiday.holidayName}</p>
        <p className="text-zinc-300 mb-1">{new Date(holiday.holidayDate).toLocaleDateString()}</p>
        <div className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-700 mb-1">{holiday.holidayType}</div>
        {holiday.description && <p className="text-zinc-500 line-clamp-2 mt-1">{holiday.description}</p>}
        {/* Tooltip triangle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-zinc-900"></div>
      </div>
    </div>
  );
};
