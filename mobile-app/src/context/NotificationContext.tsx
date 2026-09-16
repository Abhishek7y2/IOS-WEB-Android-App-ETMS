import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppNotification,
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../services/notificationApi';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';
import { GlobalToastBanner, ToastMessage, ToastType } from '../components/GlobalToastBanner';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  activeToast: ToastMessage | null;
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  dismissToast: () => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    setActiveToast({
      id: Date.now().toString(),
      message,
      type,
      title,
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast(message, 'success', title || 'Success');
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast(message, 'error', title || 'Error');
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast(message, 'info', title || 'Notification');
  }, [showToast]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchNotificationsApi();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();

      socketService.connect();
      const unsubNotif = socketService.subscribe('notification.created', (envelope) => {
        refreshNotifications();
        const msg = envelope?.data?.message || envelope?.data?.notification?.message || 'New notification received';
        showInfo(msg, 'New Alert');
      });

      const unsubTaskCreated = socketService.subscribe('task.created', (envelope) => {
        const title = envelope?.data?.task?.title || 'New Task';
        showSuccess(`Task "${title}" created successfully!`, 'Task Added');
      });

      const unsubTaskDeleted = socketService.subscribe('task.deleted', () => {
        showInfo('A task was deleted from the system.', 'Task Removed');
      });

      return () => {
        unsubNotif();
        unsubTaskCreated();
        unsubTaskDeleted();
      };
    }
  }, [isAuthenticated, refreshNotifications, showInfo, showSuccess]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => ((n._id === id || n.id === id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationReadApi(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadApi();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        activeToast,
        showToast,
        showSuccess,
        showError,
        showInfo,
        dismissToast,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
      <GlobalToastBanner toast={activeToast} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
