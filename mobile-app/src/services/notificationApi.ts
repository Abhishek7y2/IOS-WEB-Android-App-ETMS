import axiosInstance from './axios';

export interface AppNotification {
  _id: string;
  id?: string;
  type: 'task' | 'announcement' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export async function fetchNotificationsApi(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  try {
    const res = await axiosInstance.get<any>('/notifications');
    const data = res.data?.data || res.data;
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationReadApi(id: string): Promise<void> {
  try {
    await axiosInstance.put(`/notifications/${id}/read`);
  } catch {}
}

export async function markAllNotificationsReadApi(): Promise<void> {
  try {
    await axiosInstance.put('/notifications/read-all');
  } catch {}
}
