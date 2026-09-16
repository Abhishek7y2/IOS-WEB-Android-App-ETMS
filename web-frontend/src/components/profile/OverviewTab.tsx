'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Briefcase, MapPin, Calendar, Building2 } from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Overview</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Your personal and professional details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserIcon className="text-blue-500" size={16} /> Contact Information
          </h3>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email Address" value={user.email} />
            <InfoRow icon={Phone} label="Mobile Number" value={user.mobileNumber ? `+${user.countryCode || ''} ${user.mobileNumber}` : ''} />
            <InfoRow icon={Phone} label="Alternate Number" value={user.alternateNumber ? `+${user.countryCode || ''} ${user.alternateNumber}` : ''} />
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="text-blue-500" size={16} /> Location Details
          </h3>
          <div className="space-y-4">
            <InfoRow icon={MapPin} label="Country" value={user.country || ''} />
            <InfoRow icon={MapPin} label="State & District" value={[user.state, user.district].filter(Boolean).join(', ')} />
            <InfoRow icon={MapPin} label="Current Address" value={user.currentAddress || ''} />
            <InfoRow icon={MapPin} label="Permanent Address" value={user.permanentAddress || ''} />
          </div>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserIcon className="text-blue-500" size={16} /> Personal Details
          </h3>
          <div className="space-y-4">
            <InfoRow icon={UserIcon} label="Gender" value={user.gender || ''} />
            <InfoRow icon={Briefcase} label="Qualification" value={user.qualification || ''} />
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="text-blue-500" size={16} /> Professional Details
          </h3>
          <div className="space-y-4">
            <InfoRow icon={Building2} label="Department" value={user.department || 'Unassigned'} />
            <InfoRow icon={Briefcase} label="Designation" value={user.designation || 'Employee'} />
            <InfoRow icon={Calendar} label="Date of Joining" value={new Date(user.createdAt || Date.now()).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 shrink-0">
      <Icon size={14} className="text-zinc-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value || '-'}</p>
    </div>
  </div>
);

const UserIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
