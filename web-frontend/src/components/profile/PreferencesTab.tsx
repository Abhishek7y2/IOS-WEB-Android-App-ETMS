'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axios';
import { Settings, Bell, Moon, Sun, Type } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { AccessibilityToggle } from '../AccessibilityToggle';
import { toast } from 'sonner';

export const PreferencesTab: React.FC = () => {
  const { user } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setEmailNotifs(user.notificationPreferences.email !== false);
      setInAppNotifs(user.notificationPreferences.inApp !== false);
    }
  }, [user]);

  const savePreferences = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/profile/preferences', {
        notificationPreferences: { email: emailNotifs, inApp: inAppNotifs }
      });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Preferences</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Customize your workspace experience.</p>
        </div>
        <button 
          onClick={savePreferences}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display Settings */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <Settings className="text-blue-500" size={16} /> Display & Accessibility
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Moon size={14} className="text-zinc-600" /> Theme Mode
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">Choose between light, dark, or system preference</p>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="h-px bg-zinc-200 dark:bg-zinc-700/50" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Type size={14} className="text-zinc-600" /> Font Size
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">Adjust text size for better readability</p>
              </div>
              <AccessibilityToggle />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <Bell className="text-blue-500" size={16} /> Notifications
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Email Notifications</p>
                <p className="text-[10px] text-zinc-600 mt-1">Receive daily summaries and critical alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="h-px bg-zinc-200 dark:bg-zinc-700/50" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">In-App Notifications</p>
                <p className="text-[10px] text-zinc-600 mt-1">Receive real-time alerts inside the dashboard</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={inAppNotifs} onChange={(e) => setInAppNotifs(e.target.checked)} />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
