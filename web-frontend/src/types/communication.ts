'use client';

export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'unread' | 'replied' | 'archived';
export type ConversationType = 'direct' | 'announcement' | 'broadcast' | 'group';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'docx' | 'excel' | 'zip' | 'other';
  url: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments: Attachment[];
  mentions: string[];
  isEdited: boolean;
  replyToId?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  subject: string;
  groupName?: string;
  project?: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  priority: MessagePriority;
  participants: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender: string;
  unreadCount: number;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  hasAttachments: boolean;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: MessagePriority;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  readBy: string[];
  createdAt: string;
}

export interface Draft {
  id: string;
  to: string[];
  toNames: string[];
  subject: string;
  project?: string;
  relatedTaskId?: string;
  priority: MessagePriority;
  content: string;
  attachments: Attachment[];
  updatedAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'new_message' | 'reply_received' | 'announcement' | 'task_update' | 'mention';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  conversationId?: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunicationAnalytics {
  totalMessages: number;
  messagesToday: number;
  unreadMessages: number;
  totalAnnouncements: number;
  averageResponseTime: string;
  mostActiveEmployee: string;
  mostActiveProject: string;
  weeklyTrend: { day: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface ComposeFormData {
  to: string[];
  subject: string;
  project: string;
  relatedTaskId: string;
  priority: MessagePriority;
  content: string;
  attachments: Attachment[];
}

export interface CommunicationFilters {
  search: string;
  priority: MessagePriority | 'all';
  status: MessageStatus | 'all';
  project: string;
  employee: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  type: ConversationType | 'all';
  unreadOnly: boolean;
}