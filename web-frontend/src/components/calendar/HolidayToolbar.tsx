import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filters: {
    year: string;
    month: string;
    holidayType: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  years: number[];
}

export const HolidayToolbar: React.FC<Props> = ({ searchQuery, setSearchQuery, filters, setFilters, years }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '', holidayType: '', status: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery !== '' || filters.year !== '' || filters.month !== '' || filters.holidayType !== '' || filters.status !== '';

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-zinc-500" />
        </div>
        <input
          type="text"
          placeholder="Search holidays by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
          <Filter size={16} /> Filters:
        </div>
        
        <select name="year" value={filters.year} onChange={handleChange} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select name="month" value={filters.month} onChange={handleChange} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500">
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select name="holidayType" value={filters.holidayType} onChange={handleChange} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500">
          <option value="">All Types</option>
          <option value="National Holiday">National</option>
          <option value="Festival Holiday">Festival</option>
          <option value="Company Holiday">Company</option>
          <option value="Regional Holiday">Regional</option>
          <option value="Optional Holiday">Optional</option>
          <option value="Restricted Holiday">Restricted</option>
        </select>

        <select name="status" value={filters.status} onChange={handleChange} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
