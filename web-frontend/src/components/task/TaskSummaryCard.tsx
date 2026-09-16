import React from 'react';
import Link from 'next/link';

export interface TaskSummaryCardProps {
  title: string;
  value: string | number;
  href?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'amber' | 'green' | 'indigo' | 'zinc' | 'red';
  className?: string;
  isActive?: boolean;
}

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
  title,
  value,
  href,
  icon,
  color = 'zinc',
  className = '',
  isActive = false,
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-100/90 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
      activeBorder: 'border-2 border-blue-500 ring-2 ring-blue-500/20',
      hoverBorder: 'hover:border-2 hover:border-blue-500 dark:hover:border-blue-400',
      bgGradient: 'hover:bg-blue-50 dark:hover:bg-blue-950/40',
      hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
    },
    amber: {
      iconBg: 'bg-amber-100/90 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      activeBorder: 'border-2 border-amber-500 ring-2 ring-amber-500/20',
      hoverBorder: 'hover:border-2 hover:border-amber-500 dark:hover:border-amber-400',
      bgGradient: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',
      hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
    },
    green: {
      iconBg: 'bg-green-100/90 text-green-700 dark:bg-green-950/60 dark:text-green-400',
      activeBorder: 'border-2 border-green-500 ring-2 ring-green-500/20',
      hoverBorder: 'hover:border-2 hover:border-green-500 dark:hover:border-green-400',
      bgGradient: 'hover:bg-green-50 dark:hover:bg-green-950/40',
      hoverText: 'group-hover:text-green-600 dark:group-hover:text-green-400'
    },
    indigo: {
      iconBg: 'bg-indigo-100/90 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
      activeBorder: 'border-2 border-indigo-500 ring-2 ring-indigo-500/20',
      hoverBorder: 'hover:border-2 hover:border-indigo-500 dark:hover:border-indigo-400',
      bgGradient: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40',
      hoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
    },
    red: {
      iconBg: 'bg-red-100/90 text-red-700 dark:bg-red-950/60 dark:text-red-400',
      activeBorder: 'border-2 border-red-500 ring-2 ring-red-500/20',
      hoverBorder: 'hover:border-2 hover:border-red-500 dark:hover:border-red-400',
      bgGradient: 'hover:bg-red-50 dark:hover:bg-red-950/40',
      hoverText: 'group-hover:text-red-600 dark:group-hover:text-red-400'
    },
    zinc: {
      iconBg: 'bg-zinc-100/80 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400',
      activeBorder: 'border-2 border-zinc-500 ring-2 ring-zinc-600/10',
      hoverBorder: 'hover:border-2 hover:border-zinc-400 dark:hover:border-zinc-700',
      bgGradient: 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40',
      hoverText: 'group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
    },
  };

  const selectedColor = colorStyles[color];
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-black transition-colors duration-300 dark:text-white">{title}</span>
        {icon && <div className={`rounded-xl p-2 transition-all duration-300 ${selectedColor.iconBg}`}>{icon}</div>}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-zinc-950 transition-colors duration-300 dark:text-zinc-50 font-outfit">{value}</span>
        {href && <span className={`text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-colors duration-300 dark:text-zinc-500 ${selectedColor.hoverText}`}>VIEW</span>}
      </div>
    </>
  );

  const classes = `group rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
    isActive
      ? `${selectedColor.activeBorder} bg-zinc-50/80 dark:bg-zinc-900/80`
      : `border-zinc-300/80 bg-white/90 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] dark:border-zinc-800/80 dark:bg-zinc-950/30 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-md ${selectedColor.hoverBorder} ${selectedColor.bgGradient}`
  } ${className}`;

  if (href) {
    return (
      <Link href={href} aria-current={isActive ? 'page' : undefined} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
};

