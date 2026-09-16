'use client';

import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getStatusChartData } from '../../utils/dashboardUtils';

interface PieChartCardProps {
  tasks: Task[];
  className?: string;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({ tasks, className = '' }) => {
  const { theme } = useTheme();
  const data = React.useMemo(() => getStatusChartData(tasks), [tasks]);
  const isDark = theme === 'dark';
  const colors: Record<string, string> = isDark
    ? { todo: '#a1a1aa', in_progress: '#60a5fa', completed: '#4ade80', overdue: '#fbbf24' }
    : { todo: '#71717a', in_progress: '#2563eb', completed: '#16a34a', overdue: '#d97706' };

  return (
    <div className={`rounded-2xl border border-zinc-200/60 bg-white/90 p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/40 backdrop-blur-sm ${className}`}>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Task Distribution</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Breakdown of tasks by active status.</p>
      <div className="mt-6 h-64 w-full flex items-center justify-center">
        {data.length > 0 ? (
            <PieChart width={300} height={256}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                label={({ percent }) => (percent !== undefined && percent > 0) ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={{ strokeWidth: 1 }}
                isAnimationActive={false}
              >
                {data.map((entry) => <Cell key={entry.key} fill={colors[entry.key as keyof typeof colors]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', color: isDark ? '#fafafa' : '#09090b', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{value}</span>} />
            </PieChart>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500 dark:text-zinc-500">No analytics available</div>
        )}
      </div>
    </div>
  );
};

