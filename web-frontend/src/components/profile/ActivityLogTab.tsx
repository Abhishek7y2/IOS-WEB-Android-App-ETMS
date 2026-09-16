'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axios';
import { Activity, ClipboardList, CalendarCheck, FileCheck } from 'lucide-react';

interface Stats {
  taskCount: number;
  activeLeaves: number;
  attendanceCount: number;
}

export const ActivityLogTab: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/profile');
        setStats(res.data.data.stats);
      } catch (error) {
        console.error('Failed to load profile stats');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Activity Log</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">A summary of your recent interactions and modules.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Tasks Assigned" 
            value={stats?.taskCount || 0} 
            icon={ClipboardList} 
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard 
            title="Attendance Marked" 
            value={stats?.attendanceCount || 0} 
            icon={CalendarCheck} 
            color="text-green-600 dark:text-green-400"
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard 
            title="Active Leaves" 
            value={stats?.activeLeaves || 0} 
            icon={FileCheck} 
            color="text-purple-600 dark:text-purple-400"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>
      )}

      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 mt-8">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <Activity className="text-blue-500" size={16} /> Recent Activity Timeline
        </h3>
        
        <div className="text-center py-8 opacity-60">
          <p className="text-xs text-zinc-600 font-medium">Activity timeline integration coming soon.</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon size={24} className={color} />
    </div>
    <div>
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
      <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</h4>
    </div>
  </div>
);
