import axiosInstance from './axios';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readBy?: string[];
}

export interface Conversation {
  id: string;
  groupName?: string;
  isGroup?: boolean;
  participantNames: string[];
  lastMessage?: string;
  updatedAt?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export async function getAnnouncementsApi(): Promise<Announcement[]> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { announcements: any[] } }>('/communication/announcements');
    return response.data.data.announcements.map((a: any) => ({
      id: a._id || a.id,
      title: a.title,
      content: a.content,
      authorName: a.authorName || 'Admin',
      authorAvatar: a.authorAvatar,
      priority: a.priority || 'medium',
      createdAt: a.publishDate || a.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getConversationsApi(): Promise<Conversation[]> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { conversations: any[] } }>('/communication/conversations');
    return response.data.data.conversations.map((c: any) => ({
      id: c._id || c.id,
      groupName: c.groupName,
      isGroup: c.isGroup || false,
      participantNames: c.participantNames || [],
      lastMessage: c.lastMessage || 'No messages yet',
      updatedAt: c.updatedAt || new Date().toISOString(),
      unreadCount: c.unreadCount || 0,
    }));
  } catch {
    return [];
  }
}

export async function getChatMessagesApi(conversationId: string): Promise<Message[]> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { messages: any[] } }>(`/chat/messages/${conversationId}`);
    return response.data.data.messages.map((m: any) => ({
      id: m._id || m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName || 'Team Member',
      senderAvatar: m.senderAvatar,
      content: m.content,
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function sendChatMessageApi(conversationId: string, content: string): Promise<Message> {
  const response = await axiosInstance.post<{ success: boolean; data: { message: any } }>('/chat/messages', {
    conversationId,
    content,
  });
  const m = response.data.data.message;
  return {
    id: m._id || m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.senderName || 'You',
    senderAvatar: m.senderAvatar,
    content: m.content,
    createdAt: m.createdAt || new Date().toISOString(),
  };
}

export async function createGroupApi(groupName: string, participantIds: string[]): Promise<Conversation> {

  const response = await axiosInstance.post<{ success: boolean; data: { conversation: any } }>('/communication/groups', {
    groupName,
    participantIds,
  });
  const c = response.data.data.conversation;
  return {
    id: c._id || c.id,
    groupName: c.groupName,
    isGroup: true,
    participantNames: c.participantNames || [],
    lastMessage: c.lastMessage || 'Group created',
    updatedAt: c.updatedAt || new Date().toISOString(),
    unreadCount: 0,
  };
}

export async function createAnnouncementApi(title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<Announcement> {
  const response = await axiosInstance.post<{ success: boolean; data: { announcement: any } }>('/communication/announcements', {
    title,
    content,
    priority,
  });
  const a = response.data.data.announcement;
  return {
    id: a._id || a.id,
    title: a.title,
    content: a.content,
    authorName: a.authorName || 'Admin',
    authorAvatar: a.authorAvatar,
    priority: a.priority || 'medium',
    createdAt: a.publishDate || a.createdAt || new Date().toISOString(),
  };
}

export async function togglePinAnnouncementApi(id: string): Promise<boolean> {
  try {
    const response = await axiosInstance.patch<{ success: boolean }>(`/communication/announcements/${id}/pin`);
    return response.data.success;
  } catch {
    return false;
  }
}

export async function sendBroadcastApi(title: string, message: string, recipientRole: string = 'all'): Promise<boolean> {
  try {
    const response = await axiosInstance.post<{ success: boolean }>('/communication/broadcast', {
      title,
      message,
      recipientRole,
    });
    return response.data.success;
  } catch {
    return false;
  }
}

