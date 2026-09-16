import axiosInstance from '../services/axios';
import {
  Announcement,
  CommunicationAnalytics,
  Conversation,
  Message,
} from '../types/communication';

// ─── Employee type & fetch ───────────────────────────────────────────────────
export interface EmployeeOption {
  id: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  profilePicture: string;
}

export async function fetchEmployees(): Promise<EmployeeOption[]> {
  const res = await axiosInstance.get('/communication/employees');
  return res.data.data.employees;
}

// ─── Conversations ──────────────────────────────────────────────────────────
export async function fetchConversations(params?: {
  type?: string;
  isArchived?: string;
  search?: string;
}): Promise<Conversation[]> {
  const res = await axiosInstance.get('/communication/conversations', { params });
  return res.data.data.conversations;
}

export async function fetchConversationById(id: string): Promise<Conversation> {
  const res = await axiosInstance.get(`/communication/conversations/${id}`);
  return res.data.data.conversation;
}

export async function createConversation(data: {
  to: string[];
  subject: string;
  project?: string;
  relatedTaskId?: string;
  priority: string;
  content: string;
  attachments?: any[];
}): Promise<{ conversation: Conversation; message: Message }> {
  const res = await axiosInstance.post('/communication/conversations', data);
  return res.data.data;
}

export async function createGroup(data: {
  groupName: string;
  participants: string[];
  relatedTaskId?: string;
  initialMessage?: string;
}): Promise<{ conversation: Conversation }> {
  const res = await axiosInstance.post('/communication/groups', data);
  return res.data.data;
}

export async function updateConversation(id: string, updates: Record<string, any>): Promise<Conversation> {
  const res = await axiosInstance.put(`/communication/conversations/${id}`, updates);
  return res.data.data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  await axiosInstance.delete(`/communication/conversations/${id}`);
}

// ─── Messages ────────────────────────────────────────────────────────────────
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await axiosInstance.get(`/communication/conversations/${conversationId}/messages`);
  return res.data.data.messages;
}

export async function sendMessage(conversationId: string, data: {
  content: string;
  attachments?: any[];
}): Promise<Message> {
  const res = await axiosInstance.post(`/communication/conversations/${conversationId}/messages`, data);
  return res.data.data.message;
}

// ─── Announcements ───────────────────────────────────────────────────────────
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await axiosInstance.get('/communication/announcements');
  return res.data.data.announcements;
}

export async function createAnnouncement(data: {
  title: string;
  description: string;
  priority: string;
  publishDate?: string;
  expiryDate?: string;
}): Promise<Announcement> {
  const res = await axiosInstance.post('/communication/announcements', data);
  return res.data.data.announcement;
}

export async function updateAnnouncement(id: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  publishDate?: string;
  expiryDate?: string | null;
}): Promise<Announcement> {
  const res = await axiosInstance.put(`/communication/announcements/${id}`, data);
  return res.data.data.announcement;
}

export async function togglePinAnnouncement(id: string): Promise<Announcement> {
  const res = await axiosInstance.patch(`/communication/announcements/${id}/pin`);
  return res.data.data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await axiosInstance.delete(`/communication/announcements/${id}`);
}

// ─── Broadcast ───────────────────────────────────────────────────────────────
export async function sendBroadcast(data: {
  subject: string;
  project?: string;
  priority: string;
  content: string;
  attachments?: any[];
}): Promise<{ conversation: Conversation; message: Message }> {
  const res = await axiosInstance.post('/communication/broadcast', data);
  return res.data.data;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function fetchAnalytics(): Promise<CommunicationAnalytics> {
  const res = await axiosInstance.get('/communication/analytics');
  return res.data.data.analytics;
}