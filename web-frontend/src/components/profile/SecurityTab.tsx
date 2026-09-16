'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axios';
import { Shield, Key, Smartphone, Laptop, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const SecurityTab: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.put('/profile/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Security</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage your password and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Key className="text-blue-500" size={16} /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* 2FA and Sessions */}
        <div className="space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Coming Soon
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2 opacity-60">
              <Smartphone className="text-blue-500" size={16} /> Two-Factor Authentication
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 opacity-60">
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
            <button disabled className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 px-4 py-2 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">
              Enable 2FA
            </button>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Coming Soon
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 opacity-60">
              <Laptop className="text-blue-500" size={16} /> Active Sessions
            </h3>
            <div className="space-y-3 opacity-60">
              <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                    <Laptop size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Windows • Chrome</p>
                    <p className="text-[10px] text-zinc-600">Current Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
