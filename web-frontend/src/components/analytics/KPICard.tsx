'use client';

import React from 'react';
import { Task } from '../../types';
import { getDashboardMetrics, isOverdueTask } from '../../utils/dashboardUtils';
import { TrendingUp, TrendingDown, Target, Zap, Clock, AlertCircle } from 'lucide-react';

interface KPICardProps {
  tasks: Task[];
  className?: string;
}

interface KPI {
  label: string;
  value: string;
  subtext: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPICard: React.FC<KPICardProps> = ({ tasks, className = '' }) => {
  const metrics = getDashboardMetrics(tasks);

  const completionRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
      : 0;

  const activeRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.inProgressTasks / metrics.totalTasks) * 100)
      : 0;



  const highPriorityPending = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'completed'
  ).length;

  const kpis: KPI[] = [
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: `${metrics.completedTasks} of ${metrics.totalTasks} tasks done`,
      color: completionRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : completionRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
      bgColor: completionRate >= 70 ? 'bg-emerald-50 dark:bg-emerald-950/40' : completionRate >= 40 ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-red-50 dark:bg-red-950/40',
      borderColor: completionRate >= 70 ? 'border-emerald-200 dark:border-emerald-800' : completionRate >= 40 ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800',
      icon: <Target className="h-4 w-4" />,
      trend: completionRate >= 70 ? 'up' : completionRate >= 40 ? 'neutral' : 'down',
    },
    {
      label: 'Active Work Rate',
      value: `${activeRate}%`,
      subtext: `${metrics.inProgressTasks} tasks in progress`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: <Zap className="h-4 w-4" />,
      trend: activeRate > 0 ? 'up' : 'neutral',
    },
    {
      label: 'High Priority Open',
      value: `${highPriorityPending}`,
      subtext: highPriorityPending === 0 ? 'No urgent tasks pending' : `${highPriorityPending} need attention`,
      color: highPriorityPending === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400',
      bgColor: highPriorityPending === 0 ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: highPriorityPending === 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-orange-200 dark:border-orange-800',
      icon: <AlertCircle className="h-4 w-4" />,
      trend: highPriorityPending === 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Key Performance Indicators</h3>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Real-time snapshot of team productivity metrics.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-lg border p-3 transition-all duration-200 hover:shadow-sm ${kpi.bgColor} ${kpi.borderColor}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`flex items-center gap-1 text-xs font-semibold ${kpi.color}`}>
                {kpi.icon}
                {kpi.label}
              </span>
              {kpi.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {kpi.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            </div>
            <p className={`mt-2 text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="mt-4 flex items-center justify-center py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-500">
          No tasks yet — KPIs will appear once tasks are created.
        </div>
      )}
    </div>
  );
};
