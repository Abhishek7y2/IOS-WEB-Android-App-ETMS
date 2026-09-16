'use client';

import React, { useRef } from 'react';
import { Calendar as CalendarIcon, X, FilterX, ArrowRight } from 'lucide-react';

interface EnterpriseDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  className?: string;
}

export const EnterpriseDateRangePicker: React.FC<EnterpriseDateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = '',
}) => {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const setPresetToday = () => {
    const today = getTodayStr();
    onStartDateChange(today);
    onEndDateChange(today);
  };

  const setPresetThisWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diffToMon));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    onStartDateChange(mon.toISOString().split('T')[0]);
    onEndDateChange(sun.toISOString().split('T')[0]);
  };

  const setPresetThisMonth = () => {
    const d = new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    onStartDateChange(firstDay.toISOString().split('T')[0]);
    onEndDateChange(lastDay.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isFiltered = Boolean(startDate || endDate);

  return (
    <div className={`w-full max-w-full flex flex-col gap-2 ${className}`}>
      {/* Date Input Boxes - Responsive Grid */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        
        {/* From Date Box */}
        <div 
          onClick={() => startInputRef.current?.showPicker?.()}
          className="relative flex-1 min-w-0 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 transition duration-200 hover:border-teal-500/50 hover:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-teal-500/50 dark:hover:bg-zinc-900 cursor-pointer group shadow-2xs"
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              From Date
            </span>
            <div className="relative flex items-center w-full min-w-0">
              <input
                ref={startInputRef}
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer"
                title="Select From Date"
              />
            </div>
          </div>
          {startDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartDateChange('');
              }}
              className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
              title="Clear From Date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Separator Arrow / Text */}
        <div className="hidden sm:flex items-center justify-center shrink-0 text-zinc-400 dark:text-zinc-600">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* To Date Box */}
        <div 
          onClick={() => endInputRef.current?.showPicker?.()}
          className="relative flex-1 min-w-0 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 transition duration-200 hover:border-teal-500/50 hover:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-teal-500/50 dark:hover:bg-zinc-900 cursor-pointer group shadow-2xs"
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              To Date
            </span>
            <div className="relative flex items-center w-full min-w-0">
              <input
                ref={endInputRef}
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer"
                title="Select To Date"
              />
            </div>
          </div>
          {endDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEndDateChange('');
              }}
              className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
              title="Clear To Date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Presets Bar & Active Filter Status */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={setPresetToday}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-zinc-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-teal-950 dark:hover:text-teal-300 dark:hover:border-teal-800 transition shadow-2xs cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={setPresetThisWeek}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-zinc-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-teal-950 dark:hover:text-teal-300 dark:hover:border-teal-800 transition shadow-2xs cursor-pointer"
          >
            This Week
          </button>
          <button
            type="button"
            onClick={setPresetThisMonth}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-zinc-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-teal-950 dark:hover:text-teal-300 dark:hover:border-teal-800 transition shadow-2xs cursor-pointer"
          >
            This Month
          </button>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-900/60 transition cursor-pointer"
            title="Reset Date Filters"
          >
            <FilterX className="h-3 w-3" />
            <span>Reset Dates</span>
          </button>
        )}
      </div>
    </div>
  );
};
