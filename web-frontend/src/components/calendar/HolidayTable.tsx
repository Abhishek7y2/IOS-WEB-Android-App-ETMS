import React from 'react';
import { Holiday } from '../../types/holiday';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface Props {
  holidays: Holiday[];
  loading: boolean;
  onView: (holiday: Holiday) => void;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  isAdmin: boolean;
}

export const HolidayTable: React.FC<Props> = ({ holidays, loading, onView, onEdit, onDelete, isAdmin }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, j) => <div key={j} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>)}
          </div>
        ))}
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <p className="text-zinc-600 dark:text-zinc-400">No holidays found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-6 py-4 font-semibold">Holiday Name</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Type</th>
            <th className="px-6 py-4 font-semibold">Location</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {holidays.map((holiday) => (
            <tr key={holiday._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{holiday.holidayName}</p>
                {holiday.department && <p className="text-xs text-zinc-600">{holiday.department}</p>}
              </td>
              <td className="px-6 py-4">
                <p className="text-zinc-700 dark:text-zinc-300">
                  {new Date(holiday.holidayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-zinc-600">
                  {new Date(holiday.holidayDate).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50">
                  {holiday.holidayType}
                </span>
                {holiday.isOptional && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Optional
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-sm">
                {holiday.location || 'All Locations'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                  holiday.status === 'Upcoming' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  holiday.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {holiday.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onView(holiday)}
                    className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => onEdit(holiday)}
                        className="p-1.5 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition-colors"
                        title="Edit Holiday"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(holiday)}
                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete Holiday"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
