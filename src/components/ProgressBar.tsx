// src/components/ProgressBar.tsx
// A visual progress bar showing task completion percentage.
// Pass in total and completed — it calculates the rest.

interface ProgressBarProps {
  total: number;
  completed: number;
}

export default function ProgressBar({ total, completed }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 text-left">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider m-0">Overall Progress</p>
        <p className="text-sm font-bold text-indigo-600 m-0">{percentage}%</p>
      </div>
      <div className="w-full bg-gray-100/70 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2.5">
        <p className="text-[11px] font-medium text-gray-400 m-0">
          {completed} of {total} tasks completed
        </p>
        <p className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full m-0">
          Active Track
        </p>
      </div>
    </div>
  );
}
