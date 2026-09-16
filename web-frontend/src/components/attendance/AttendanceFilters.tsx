import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  isAdmin: boolean;
}

export const AttendanceFilters: React.FC<Props> = ({ filters, setFilters, isAdmin }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search by employee name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
          disabled={!isAdmin}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-600" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filters:</span>
        </div>

        <input
          type="date"
          name="date"
          value={filters.date || ''}
          onChange={handleChange}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
        />

        <select
          name="status"
          value={filters.status || ''}
          onChange={handleChange}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Half Day">Half Day</option>
        </select>

        <select
          name="workMode"
          value={filters.workMode || ''}
          onChange={handleChange}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">All Work Modes</option>
          <option value="Office">Office</option>
          <option value="Work From Home">Work From Home</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-Site Visit">On-Site Visit</option>
        </select>

        {isAdmin && (
          <select
            name="department"
            value={filters.department || ''}
            onChange={handleChange}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        )}
      </div>
    </div>
  );
};
