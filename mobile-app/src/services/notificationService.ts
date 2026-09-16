import { Platform } from 'react-native';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Task Assigned',
    body: 'You have been assigned to "Update UI Components & Micro-animations".',
    timestamp: '10 mins ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Leave Application Approved',
    body: 'Your Earned Leave application for next week has been approved.',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'Attendance Recorded',
    body: 'Daily check-in recorded successfully at 09:15 AM.',
    timestamp: 'Today',
    read: true,
  },
];

export async function getNotificationsApi(): Promise<AppNotification[]> {
  return Promise.resolve(mockNotifications);
}

export async function markNotificationAsReadApi(id: string): Promise<void> {
  const target = mockNotifications.find((n) => n.id === id);
  if (target) {
    target.read = true;
  }
  return Promise.resolve();
}
