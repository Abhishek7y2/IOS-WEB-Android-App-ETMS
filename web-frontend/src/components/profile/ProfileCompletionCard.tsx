'use client';

import React from 'react';
import { Check, CircleDashed } from 'lucide-react';

interface ProfileCompletionCardProps {
  user: any;
}

export default function ProfileCompletionCard({ user }: ProfileCompletionCardProps) {
  const items = [
    { label: 'Setup account', weight: 10, completed: true },
    { label: 'Upload your photo', weight: 15, completed: !!user?.profilePicture },
    { label: 'Personal Info', weight: 20, completed: !!(user?.firstName && user?.lastName && user?.mobileNumber && user?.gender) },
    { label: 'Professional Info', weight: 15, completed: !!(user?.qualification && user?.role) },
    { label: 'Location', weight: 20, completed: !!((user?.permanentAddress || user?.currentAddress) && (user?.country || user?.state || user?.district || 'India')) },
    { label: 'Biography', weight: 20, completed: !!user?.biography },
  ];

  const completedPercentage = items.reduce((acc, item) => item.completed ? acc + item.weight : acc, 0);
  const totalPercentage = 100;
  
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercentage / totalPercentage) * circumference;

  return (
    <div className="enterprise-card enterprise-card-hover rounded-2xl p-7 flex flex-col items-center w-full sticky top-6">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xl font-outfit mb-8 tracking-tight">Complete your profile</h3>
      
      <div className="relative flex items-center justify-center mb-8 group w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" /> {/* emerald-500 */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-zinc-100 dark:text-zinc-800/80"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="inline-flex items-baseline justify-center leading-none">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-100 dark:to-zinc-400 font-outfit">
              {completedPercentage}
            </span>
            <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 ml-0.5">
              %
            </span>
          </div>
          {completedPercentage === 100 && (
            <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="w-full space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3.5">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${item.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500'}`}>
                {item.completed ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <CircleDashed className="h-3.5 w-3.5 stroke-[2.5]" />
                )}
              </div>
              <span className={`text-[13px] font-semibold transition-colors ${item.completed ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.label}
              </span>
            </div>
            {item.completed ? (
               <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wide">
                 {item.weight}%
               </span>
            ) : (
               <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full tracking-wide">
                 +{item.weight}%
               </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
