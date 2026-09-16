import React, { useState } from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  isAdmin: boolean;
  onReset?: () => void;
}

export const LeaveFilters: React.FC<Props> = ({ filters, setFilters, isAdmin, onReset }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.leaveType || filters.department
  );

  const handleResetClick = () => {
    setIsRefreshing(true);
    if (onReset) {
      onReset();
    } else {
      setFilters({ search: '', status: '', leaveType: '', department: '' });
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const leaveTypes = [
    'Sick Leave', 'Casual Leave', 'Earned Leave', 'Annual Leave', 
    'Half-Day Leave', 'Work From Home', 'Maternity Leave', 
    'Paternity Leave', 'Marriage Leave', 'Bereavement Leave', 
    'Compensatory Leave', 'Unpaid Leave'
  ];

  return (
    <div className="space-y-2 mb-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search by reason or employee name..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters:</span>
          </div>

          <select 
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100 min-w-[130px] font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Today">On Leave Today</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>

          <select 
            name="leaveType"
            value={filters.leaveType || ''}
            onChange={handleChange}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100 max-w-[160px] font-medium"
          >
            <option value="">All Types</option>
            {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          {isAdmin && (
            <select 
              name="department"
              value={filters.department || ''}
              onChange={handleChange}
              className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100 min-w-[140px] font-medium"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
            </select>
          )}

          {/* Small Refresh & Reset Button */}
          <button
            type="button"
            onClick={handleResetClick}
            title="Reset all filters & refresh data"
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition-all duration-200 cursor-pointer ${
              hasActiveFilters 
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 shadow-sm' 
                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <RotateCcw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Filters:</span>
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Status: {filters.status}
              <button onClick={() => setFilters({ ...filters, status: '' })} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.leaveType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Type: {filters.leaveType}
              <button onClick={() => setFilters({ ...filters, leaveType: '' })} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.department && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Dept: {filters.department}
              <button onClick={() => setFilters({ ...filters, department: '' })} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Search: "{filters.search}"
              <button onClick={() => setFilters({ ...filters, search: '' })} className="hover:opacity-75">
                <X size={12} />
              </button>
            </span>
          )}
          <button 
            onClick={handleResetClick}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 underline ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
