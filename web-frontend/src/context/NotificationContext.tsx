'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../services/axios';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';

// Notification object ka structure (TypeScript interface) - backend se kis tarah ka data aayega
export interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', user?._id],
    queryFn: async () => {
      const res = await axiosInstance.get('/notifications');
      return res.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
  }, [data]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    await refetchNotifications();
  }, [refetchNotifications, user]);

  // Jab user kisi ek notification par click kare toh use 'read' mark karna
  const markAsRead = useCallback(async (id: string) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Ek button click se sabhi unread notifications ko 'read' kar dena
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Har 30 second mein background mein check karna ki koi naya notification aaya hai ya nahi
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
