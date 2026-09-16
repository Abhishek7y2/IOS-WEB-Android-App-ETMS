'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MessageSquare, TrendingUp, Users, Award, Clock, BarChart3 } from 'lucide-react';
import { CommunicationAnalytics } from '../../types/communication';

interface AnalyticsCardProps {
  analytics: CommunicationAnalytics;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; subtext?: string }> = ({ icon, label, value, color, subtext }) => (
  <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 transition-all duration-300 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">{label}</p>
        <p className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 font-outfit">{value}</p>
        {subtext && <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{subtext}</p>}
      </div>
    </div>
  </div>
);

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />} label="Total Messages" value={analytics.totalMessages} color="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} label="Messages Today" value={analytics.messagesToday} color="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard icon={<MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />} label="Unread" value={analytics.unreadMessages} color="bg-orange-50 dark:bg-orange-950/30" />
        <StatCard icon={<BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />} label="Announcements" value={analytics.totalAnnouncements} color="bg-violet-50 dark:bg-violet-950/30" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard icon={<Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />} label="Avg Response Time" value={analytics.averageResponseTime} color="bg-indigo-50 dark:bg-indigo-950/30" />
        <StatCard icon={<Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />} label="Most Active Employee" value={analytics.mostActiveEmployee} color="bg-amber-50 dark:bg-amber-950/30" subtext="Highest message count" />
        <StatCard icon={<Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />} label="Most Active Project" value={analytics.mostActiveProject} color="bg-cyan-50 dark:bg-cyan-950/30" subtext="Most discussed project" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Weekly Communication Trend</h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">Messages sent per day this week</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                <defs><linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Monthly Communication Trend</h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">Messages sent per month</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyTrend}>
                <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};