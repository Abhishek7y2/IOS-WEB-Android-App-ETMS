import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { BriefcaseMedical, Coffee, Calendar, Plane } from 'lucide-react';

export const LeaveBalanceCard: React.FC = () => {
  const { balance } = useLeave();

  if (!balance) return null;

  const getIcon = (type: string) => {
    switch(type) {
      case 'Sick Leave': return <BriefcaseMedical size={20} className="text-blue-500" />;
      case 'Casual Leave': return <Coffee size={20} className="text-orange-500" />;
      case 'Earned Leave': return <Plane size={20} className="text-teal-500" />;
      default: return <Calendar size={20} className="text-zinc-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {balance.balances.map((b, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              {getIcon(b.leaveType)}
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{b.leaveType}</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-100 dark:divide-zinc-800">
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{b.total}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Used</p>
              <p className="font-semibold text-red-600 dark:text-red-400">{b.used}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Remaining</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{b.remaining}</p>
            </div>
          </div>
          
          <div className="mt-4 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${b.total > 0 ? (b.used / b.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
