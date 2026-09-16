'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OverviewTab } from '../../components/profile/OverviewTab';
import { SecurityTab } from '../../components/profile/SecurityTab';
import { PreferencesTab } from '../../components/profile/PreferencesTab';
import { ActivityLogTab } from '../../components/profile/ActivityLogTab';
import { AdminTab } from '../../components/profile/AdminTab';
import { User, Shield, Settings, Activity, Users } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return <div className="p-8 text-center text-zinc-600">Loading profile...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  if ((user.role === 'admin' || user.role === 'superadmin')) {
    tabs.push({ id: 'admin', label: 'Admin Actions', icon: Users });
  }

  return (
    <div className="w-full space-y-6">
      <header className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={user.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'} 
            alt={user.name} 
            className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
          />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{user.name}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.designation || 'Employee'} • {user.role}</p>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 md:p-8 min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'activity' && <ActivityLogTab />}
          {activeTab === 'admin' && (user.role === 'admin' || user.role === 'superadmin') && <AdminTab />}
        </div>
      </div>
    </div>
  );
}
