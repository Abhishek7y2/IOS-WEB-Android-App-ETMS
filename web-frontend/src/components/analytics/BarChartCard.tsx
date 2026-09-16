'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Employee, Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getTeamWorkloadData } from '../../utils/dashboardUtils';

interface BarChartCardProps {
  tasks: Task[];
  employees: Employee[];
  className?: string;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({ tasks, employees, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = React.useMemo(() => getTeamWorkloadData(tasks, employees), [tasks, employees]);
  const colors = isDark
    ? { todo: '#a1a1aa', inProgress: '#60a5fa', completed: '#4ade80' }
    : { todo: '#71717a', inProgress: '#2563eb', completed: '#16a34a' };

  return (
    <div className={`rounded-2xl border border-zinc-200/60 bg-white/90 p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/40 backdrop-blur-sm ${className}`}>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Team Workload Breakdown</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Number of tasks per employee by status.</p>
      <div className="mt-6 h-64 w-full">
        {tasks.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#f4f4f5'} />
              <XAxis dataKey="name" stroke={isDark ? '#71717a' : '#a1a1aa'} fontSize={10} fontWeight={600} tickLine={false} />
              <YAxis stroke={isDark ? '#71717a' : '#a1a1aa'} fontSize={10} fontWeight={600} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', color: isDark ? '#fafafa' : '#09090b', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{value === 'todo' ? 'Pending' : value === 'inProgress' ? 'In Progress' : 'Completed'}</span>} />
              <Bar dataKey="todo" name="todo" stackId="a" fill={colors.todo} isAnimationActive={false} />
              <Bar dataKey="inProgress" name="inProgress" stackId="a" fill={colors.inProgress} isAnimationActive={false} />
              <Bar dataKey="completed" name="completed" stackId="a" fill={colors.completed} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500 dark:text-zinc-500">No analytics available</div>
        )}
      </div>
    </div>
  );
};
