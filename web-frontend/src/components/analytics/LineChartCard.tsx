'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getCompletedTimelineData } from '../../utils/dashboardUtils';

interface LineChartCardProps {
  tasks: Task[];
  className?: string;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({ tasks, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = getCompletedTimelineData(tasks);

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Tasks Completed Over Time</h3>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Timeline of completed task accomplishments.</p>
      <div className="mt-6 h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#f4f4f5'} />
              <XAxis dataKey="date" stroke={isDark ? '#71717a' : '#a1a1aa'} fontSize={10} fontWeight={600} tickLine={false} />
              <YAxis stroke={isDark ? '#71717a' : '#a1a1aa'} fontSize={10} fontWeight={600} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', color: isDark ? '#fafafa' : '#09090b', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }} />
              <Line type="monotone" dataKey="tasks" name="Tasks Completed" stroke={isDark ? '#4ade80' : '#16a34a'} strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, strokeWidth: 1 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500 dark:text-zinc-500">No analytics available</div>
        )}
      </div>
    </div>
  );
};

