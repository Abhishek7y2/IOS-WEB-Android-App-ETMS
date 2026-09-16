import React from 'react';
import { Holiday } from '../../types/holiday';
import { MapPin, Calendar, Tag, Info, Building2, User, Clock } from 'lucide-react';

interface Props {
  holiday: Holiday;
}

export const HolidayDetails: React.FC<Props> = ({ holiday }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{holiday.holidayName}</h2>
          <div className="flex items-center gap-2 mt-2 text-zinc-600 dark:text-zinc-400">
            <Calendar size={16} />
            <span>{new Date(holiday.holidayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {holiday.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Tag size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Type:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{holiday.holidayType}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Location:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{holiday.location || 'All Locations'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Department:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{holiday.department || 'All Departments'}</span>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Info size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Optional:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{holiday.isOptional ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Recurring:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{holiday.isRecurring ? `Yes (${holiday.recurrenceType})` : 'No'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User size={16} className="text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-400 w-24">Created:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{new Date(holiday.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {holiday.description && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Description</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {holiday.description}
          </p>
        </div>
      )}
    </div>
  );
};
