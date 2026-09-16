'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Announcement,
  CommunicationAnalytics,
  CommunicationFilters,
  ComposeFormData,
  Conversation,
  Draft,
  Message,
  Notification,
} from '../types/communication';
import {
  mockAnnouncements,
  mockConversations,
  mockDrafts,
  mockMessages,
  mockNotifications,
} from '../data/mockCommunication';
import { mockEmployees } from '../constants/mockData';

const emptyAnalytics: CommunicationAnalytics = {
  totalMessages: 0,
  messagesToday: 0,
  unreadMessages: 0,
  totalAnnouncements: 0,
  averageResponseTime: 'N/A',
  mostActiveEmployee: 'N/A',
  mostActiveProject: 'N/A',
  weeklyTrend: [],
  monthlyTrend: [],
};
import { useAuth } from './AuthContext';
import * as commApi from '../api/communication';
import { socketClient } from '../services/socketClient';

const STORAGE_KEYS = {
  conversations: 'comm_conversations',
  messages: 'comm_messages',
  announcements: 'comm_announcements',
  drafts: 'comm_drafts',
  notifications: 'comm_notifications',
};

interface CommunicationContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  announcements: Announcement[];
  drafts: Draft[];
  notifications: Notification[];
  analytics: CommunicationAnalytics;
  filters: CommunicationFilters;
  selectedConversation: Conversation | null;
  isComposeOpen: boolean;
  composePrefill: (Partial<ComposeFormData> & { id?: string }) | null;
  isMobileListOpen: boolean;
  isLoading: boolean;
  employees: commApi.EmployeeOption[];

  // Actions
  setFilters: (filters: Partial<CommunicationFilters>) => void;
  resetFilters: () => void;
  selectConversation: (conversation: Conversation | null) => void;
  openCompose: (prefill?: Partial<ComposeFormData> & { id?: string }) => void;
  closeCompose: () => void;
  sendMessage: (data: ComposeFormData) => Promise<Conversation>;
  replyToConversation: (conversationId: string, content: string, attachments?: File[]) => Promise<void>;
  createGroup: (data: { groupName: string; participants: string[]; relatedTaskId?: string; initialMessage?: string }) => Promise<Conversation>;
  addMembersToGroup: (conversationId: string, newParticipantIds: string[]) => Promise<void>;
  saveDraft: (data: ComposeFormData, draftId?: string) => void;
  deleteDraft: (draftId: string) => void;
  markAsRead: (conversationId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  archiveConversation: (conversationId: string) => void;
  unarchiveConversation: (conversationId: string) => void;
  pinConversation: (conversationId: string) => void;
  unpinConversation: (conversationId: string) => void;
  createAnnouncement: (data: Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'isPinned' | 'readBy' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, data: Partial<Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'isPinned' | 'readBy' | 'createdAt'>>) => void;
  pinAnnouncement: (announcementId: string) => void;
  deleteAnnouncement: (announcementId: string) => void;
  sendBroadcast: (data: ComposeFormData) => void;
  setMobileListOpen: (open: boolean) => void;
  refreshData: () => void;

  // Computed
  filteredConversations: Conversation[];
  inboxConversations: Conversation[];
  sentConversations: Conversation[];
  archivedConversations: Conversation[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  startDirectConversation: (employeeId: string) => void;
}

const defaultFilters: CommunicationFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  project: '',
  employee: '',
  dateRange: 'all',
  type: 'all',
  unreadOnly: false,
};

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'emp-1';

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [drafts, setDrafts] = useState<Draft[]>(mockDrafts);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<CommunicationAnalytics>(emptyAnalytics);
  const [filters, setFiltersState] = useState<CommunicationFilters>(defaultFilters);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composePrefill, setComposePrefill] = useState<(Partial<ComposeFormData> & { id?: string }) | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<commApi.EmployeeOption[]>([]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const createGroupChat = useCallback(
    async (data: { groupName: string; participants: string[]; relatedTaskId?: string; initialMessage?: string }) => {
      try {
        const res = await commApi.createGroup(data);
        const newGroup = res.conversation;
        setConversations((prev) => [newGroup, ...prev]);
        toast.success('Group created successfully');
        return newGroup;
      } catch (error) {
        console.error('Failed to create group:', error);
        toast.error('Failed to create group');
        throw error;
      }
    },
    []
  );

  const addMembersToGroup = useCallback(async (conversationId: string, newParticipantIds: string[]) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) throw new Error('Conversation not found');

      // Fetch the details for the new participants
      const newEmployees = employees.filter(e => newParticipantIds.includes(e.id));
      const newNames = newEmployees.map(e => e.name);
      const newAvatars = newEmployees.map(e => e.profilePicture || '');

      const updatedParticipants = [...new Set([...conversation.participants, ...newParticipantIds])];
      const updatedParticipantNames = [...conversation.participantNames, ...newNames];
      const updatedParticipantAvatars = [...conversation.participantAvatars, ...newAvatars];

      const res = await commApi.updateConversation(conversationId, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantAvatars: updatedParticipantAvatars
      });

      setConversations(prev => prev.map(c => c.id === conversationId ? res : c));
      toast.success('Members added successfully');
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('Failed to add members');
      throw error;
    }
  }, [conversations, employees]);

  // ─── Load data from API ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let conversationsList: Conversation[] = [];
      let announcementsList: Announcement[] = [];

      // if user exists, they are authenticated
      if (user) {
        const [convData, annData, analyticsData, empData] = await Promise.allSettled([
          commApi.fetchConversations(),
          commApi.fetchAnnouncements(),
          commApi.fetchAnalytics(),
          commApi.fetchEmployees(),
        ]);

        if (empData.status === 'fulfilled') {
          setEmployees(empData.value);
        } else {
          setEmployees([]); // strictly use empty array if API fails, no mock data
        }

        if (convData.status === 'fulfilled') {
          conversationsList = convData.value;
          setConversations(convData.value);
        } else {
          setConversations([]);
        }

        if (annData.status === 'fulfilled') {
          announcementsList = annData.value;
          setAnnouncements(annData.value);
        } else {
          setAnnouncements([]);
        }

        if (analyticsData.status === 'fulfilled') {
          setAnalytics(analyticsData.value);
        } else {
          console.warn('communicationContext: Failed to fetch analytics from DB:', (analyticsData as PromiseRejectedResult).reason);
        }
      } else {
        // No token — use empty state
        setConversations([]);
        setAnnouncements([]);
        setEmployees([]);
        setMessages({});
      }

      // Generate real notifications dynamically
      const generatedNotifs: Notification[] = [];

      conversationsList.forEach((c) => {
        if (c.lastMessageSender && c.lastMessageSender !== (user?.name || 'You') && c.lastMessageSender !== 'You') {
          generatedNotifs.push({
            id: `notif-conv-${c.id}`,
            type: 'new_message',
            title: c.type === 'broadcast' ? 'Broadcast Message' : 'New Message',
            message: `${c.lastMessageSender} sent: "${c.subject}"`,
            senderId: c.participants.find((p) => p !== userId) || '',
            senderName: c.lastMessageSender,
            conversationId: c.id,
            isRead: c.isRead,
            createdAt: c.lastMessageTime || c.updatedAt,
          });
        }
      });

      announcementsList.forEach((ann) => {
        const isRead = ann.readBy.includes(userId);
        generatedNotifs.push({
          id: `notif-ann-${ann.id}`,
          type: 'announcement',
          title: 'New Announcement',
          message: `${ann.authorName || 'Admin'} published announcement: "${ann.title}"`,
          senderId: ann.authorId,
          senderName: ann.authorName,
          senderAvatar: ann.authorAvatar,
          isRead: isRead,
          createdAt: ann.publishDate || ann.createdAt,
        });
      });

      generatedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(generatedNotifs);
    } catch {
      // Silent fallback
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();

    if (user) {
      socketClient.connect();

      const unsubMsg = socketClient.subscribe('message.created', (envelope) => {
        console.log('[Web Realtime] message.created event received:', envelope);
        loadData();
      });

      const unsubAnn = socketClient.subscribe('announcement.created', (envelope) => {
        console.log('[Web Realtime] announcement.created event received:', envelope);
        loadData();
      });

      return () => {
        unsubMsg();
        unsubAnn();
      };
    }
  }, [loadData, user]);

  // ─── Persist to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.drafts, JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  const setFilters = useCallback((partial: Partial<CommunicationFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const selectConversation = useCallback(async (conversation: Conversation | null) => {
    setSelectedConversation(conversation);
    setIsMobileListOpen(false);

    if (conversation && !conversation.isRead) {
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, isRead: true, unreadCount: 0, status: 'read' as const } : c
        )
      );

      // Try API update
      try {
        await commApi.updateConversation(conversation.id, { isRead: true, unreadCount: 0, status: 'read' });
      } catch {
        // API failed — optimistic update already applied
      }

      // Load messages for this conversation from API
      try {
        const msgs = await commApi.fetchMessages(conversation.id);
        setMessages((prev) => ({ ...prev, [conversation.id]: msgs }));
      } catch {
        // Fallback to existing local messages
      }
    } else if (conversation) {
      // Load messages for this conversation from API
      try {
        const msgs = await commApi.fetchMessages(conversation.id);
        setMessages((prev) => ({ ...prev, [conversation.id]: msgs }));
      } catch {
        // Fallback to existing local messages
      }
    }
  }, []);

  const openCompose = useCallback((prefill?: Partial<ComposeFormData> & { id?: string }) => {
    setComposePrefill(prefill || null);
    setIsComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsComposeOpen(false);
    setComposePrefill(null);
  }, []);



  const startDirectConversation = useCallback((employeeId: string) => {
    // Check if we already have a direct conversation with this employee
    const existing = conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(userId) &&
        c.participants.includes(employeeId) &&
        c.participants.length === 2
    );

    if (existing) {
      selectConversation(existing);
      return;
    }

    // Find employee details
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    // Create a temporary "draft" conversation in state to chat with
    const tempConv: Conversation = {
      id: `temp-${employeeId}`,
      subject: `Chat with ${emp.name}`,
      type: 'direct',
      priority: 'medium',
      status: 'sent',
      participants: [userId, employeeId],
      participantNames: [user?.name || 'You', emp.name],
      participantAvatars: [user?.profilePicture || '', emp.profilePicture],
      lastMessage: 'Say hi to start the conversation',
      lastMessageTime: new Date().toISOString(),
      lastMessageSender: '',
      unreadCount: 0,
      isRead: true,
      isPinned: false,
      isArchived: false,
      hasAttachments: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    };

    setConversations((prev) => [tempConv, ...prev]);
    selectConversation(tempConv);
  }, [conversations, userId, user, employees, selectConversation]);



  const sendMessage = useCallback(async (data: ComposeFormData) => {
    try {
      const result = await commApi.createConversation({
        to: data.to,
        subject: data.subject,
        project: data.project || undefined,
        relatedTaskId: data.relatedTaskId || undefined,
        priority: data.priority,
        content: data.content,
        attachments: data.attachments,
      });

      // Add to local state
      setConversations((prev) => [
        result.conversation,
        ...prev.filter(c => !c.id.startsWith('temp-') && !c.id.startsWith('new-'))
      ]);
      setMessages((prev) => ({ ...prev, [result.conversation.id]: [result.message] }));

      // Add notification
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'new_message',
        title: 'New Message',
        message: `${user?.name || 'Someone'} sent you a message about "${data.subject}"`,
        senderId: userId,
        senderName: user?.name,
        senderAvatar: user?.profilePicture,
        conversationId: result.conversation.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);

      toast.success('Message sent successfully');
      setIsComposeOpen(false);
      return result.conversation;
    } catch {
      // Fallback to local-only
      const newConversationId = `conv-${Date.now()}`;
      const newMessageId = `msg-${Date.now()}`;

      const newConversation: Conversation = {
        id: newConversationId,
        type: 'direct',
        subject: data.subject,
        project: data.project || undefined,
        relatedTaskId: data.relatedTaskId || undefined,
        priority: data.priority,
        participants: data.to,
        participantNames: data.to,
        participantAvatars: data.to.map(() => ''),
        lastMessage: data.content.substring(0, 80),
        lastMessageTime: new Date().toISOString(),
        lastMessageSender: user?.name || 'You',
        unreadCount: 0,
        isRead: true,
        isPinned: false,
        isArchived: false,
        hasAttachments: data.attachments.length > 0,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newMessage: Message = {
        id: newMessageId,
        conversationId: newConversationId,
        senderId: userId,
        senderName: user?.name || 'You',
        senderAvatar: user?.profilePicture,
        content: data.content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: data.attachments,
        mentions: [],
        isEdited: false,
      };

      setConversations((prev) => [newConversation, ...prev]);
      setMessages((prev) => ({ ...prev, [newConversationId]: [newMessage] }));
      toast.success('Message sent successfully (offline)');
      setIsComposeOpen(false);
      return newConversation;
    }
  }, [userId, user]);

  const replyToConversation = useCallback(async (conversationId: string, content: string, attachments?: File[]) => {
    try {
      const newMessage = await commApi.sendMessage(conversationId, {
        content,
        attachments: [],
      });

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: content.substring(0, 80),
                lastMessageTime: new Date().toISOString(),
                lastMessageSender: user?.name || 'You',
                updatedAt: new Date().toISOString(),
                status: 'replied' as const,
              }
            : c
        )
      );

      toast.success('Reply sent');
    } catch {
      // Fallback to local-only
      const newMessageId = `msg-${Date.now()}`;
      const newMessage: Message = {
        id: newMessageId,
        conversationId,
        senderId: userId,
        senderName: user?.name || 'You',
        senderAvatar: user?.profilePicture,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: [],
        mentions: [],
        isEdited: false,
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: content.substring(0, 80),
                lastMessageTime: new Date().toISOString(),
                lastMessageSender: user?.name || 'You',
                updatedAt: new Date().toISOString(),
                status: 'replied' as const,
              }
            : c
        )
      );

      toast.success('Reply saved locally (server unavailable)');
    }
  }, [userId, user]);

  const saveDraft = useCallback((data: ComposeFormData, draftId?: string) => {
    const finalId = draftId || `draft-${Date.now()}`;
    const newDraft: Draft = {
      id: finalId,
      to: data.to,
      toNames: data.to,
      subject: data.subject,
      project: data.project || undefined,
      relatedTaskId: data.relatedTaskId || undefined,
      priority: data.priority,
      content: data.content,
      attachments: data.attachments,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setDrafts((prev) => {
      const exists = prev.some((d) => d.id === finalId);
      if (exists) {
        return prev.map((d) => (d.id === finalId ? { ...newDraft, createdAt: d.createdAt } : d));
      }
      return [newDraft, ...prev];
    });
    toast.success('Draft saved');
    setIsComposeOpen(false);
    setComposePrefill(null);
  }, []);

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    toast.success('Draft deleted');
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isRead: true, unreadCount: 0, status: 'read' as const } : c
      )
    );

    try {
      await commApi.updateConversation(conversationId, { isRead: true, unreadCount: 0, status: 'read' });
    } catch {
      // Local update already applied
    }
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif && notif.conversationId) {
      markAsRead(notif.conversationId);
    }
  }, [notifications, markAsRead]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    conversations.forEach((c) => {
      if (!c.isRead) {
        markAsRead(c.id);
      }
    });
  }, [conversations, markAsRead]);

  const archiveConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isArchived: true, status: 'archived' as const } : c
      )
    );
    setSelectedConversation((prev) =>
      prev && prev.id === conversationId ? { ...prev, isArchived: true, status: 'archived' as const } : prev
    );
    toast.success('Conversation archived');

    try {
      await commApi.updateConversation(conversationId, { isArchived: true, status: 'archived' });
    } catch {
      // Local update already applied
    }
  }, []);

  const unarchiveConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isArchived: false, status: 'read' as const } : c
      )
    );
    setSelectedConversation((prev) =>
      prev && prev.id === conversationId ? { ...prev, isArchived: false, status: 'read' as const } : prev
    );
    toast.success('Conversation unarchived');

    try {
      await commApi.updateConversation(conversationId, { isArchived: false, status: 'read' });
    } catch {
      // Local update already applied
    }
  }, []);

  const pinConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isPinned: true } : c))
    );
    setSelectedConversation((prev) =>
      prev && prev.id === conversationId ? { ...prev, isPinned: true } : prev
    );
    toast.success('Conversation pinned');

    try {
      await commApi.updateConversation(conversationId, { isPinned: true });
    } catch {
      // Local update already applied
    }
  }, []);

  const unpinConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isPinned: false } : c))
    );
    setSelectedConversation((prev) =>
      prev && prev.id === conversationId ? { ...prev, isPinned: false } : prev
    );
    toast.success('Conversation unpinned');

    try {
      await commApi.updateConversation(conversationId, { isPinned: false });
    } catch {
      // Local update already applied
    }
  }, []);

  const createAnnouncement = useCallback(
    async (data: Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'isPinned' | 'readBy' | 'createdAt'>) => {
      try {
        const newAnnouncement = await commApi.createAnnouncement({
          title: data.title,
          description: data.description,
          priority: data.priority,
          publishDate: data.publishDate,
          expiryDate: data.expiryDate,
        });

        setAnnouncements((prev) => [newAnnouncement, ...prev]);

        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          type: 'announcement',
          title: 'New Announcement',
          message: `${user?.name || 'Admin'} published: "${data.title}"`,
          senderId: userId,
          senderName: user?.name,
          senderAvatar: user?.profilePicture,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev]);

        toast.success('Announcement published');
      } catch {
        // Fallback to local-only
        const newAnnouncement: Announcement = {
          ...data,
          id: `ann-${Date.now()}`,
          authorId: userId,
          authorName: user?.name || 'Admin',
          authorAvatar: user?.profilePicture,
          isPinned: false,
          readBy: [],
          createdAt: new Date().toISOString(),
        };
        setAnnouncements((prev) => [newAnnouncement, ...prev]);
        toast.success('Announcement saved locally (server unavailable)');
      }
    },
    [userId, user]
  );

  const updateAnnouncement = useCallback(
    async (id: string, data: Partial<Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'isPinned' | 'readBy' | 'createdAt'>>) => {
      try {
        const updated = await commApi.updateAnnouncement(id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          publishDate: data.publishDate,
          expiryDate: data.expiryDate,
        });

        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        );
        toast.success('Announcement updated');
      } catch {
        // Fallback to local-only
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
        toast.success('Announcement updated locally (server unavailable)');
      }
    },
    []
  );

  const pinAnnouncement = useCallback(async (announcementId: string) => {
    try {
      const updated = await commApi.togglePinAnnouncement(announcementId);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? updated : a))
      );
    } catch {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a))
      );
    }
    toast.success('Announcement pin toggled');
  }, []);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    toast.success('Announcement deleted');

    try {
      await commApi.deleteAnnouncement(announcementId);
    } catch {
      // Local delete already applied
    }
  }, []);

  const sendBroadcast = useCallback(async (data: ComposeFormData) => {
    try {
      const result = await commApi.sendBroadcast({
        subject: data.subject,
        project: data.project || undefined,
        priority: data.priority,
        content: data.content,
        attachments: data.attachments,
      });

      setConversations((prev) => [result.conversation, ...prev]);
      setMessages((prev) => ({ ...prev, [result.conversation.id]: [result.message] }));

      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'announcement',
        title: 'Broadcast Message',
        message: `${user?.name || 'Admin'} sent a broadcast: "${data.subject}"`,
        senderId: userId,
        senderName: user?.name,
        senderAvatar: user?.profilePicture,
        conversationId: result.conversation.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);

      toast.success('Broadcast sent successfully');
      setIsComposeOpen(false);
    } catch {
      // Fallback to local-only
      const newConversationId = `conv-${Date.now()}`;
      const newMessageId = `msg-${Date.now()}`;

      const newConversation: Conversation = {
        id: newConversationId,
        type: 'broadcast',
        subject: data.subject,
        project: data.project || undefined,
        priority: data.priority,
        participants: [userId],
        participantNames: [user?.name || 'Admin'],
        participantAvatars: [user?.profilePicture || ''],
        lastMessage: data.content.substring(0, 80),
        lastMessageTime: new Date().toISOString(),
        lastMessageSender: user?.name || 'Admin',
        unreadCount: 0,
        isRead: true,
        isPinned: false,
        isArchived: false,
        hasAttachments: data.attachments.length > 0,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newMessage: Message = {
        id: newMessageId,
        conversationId: newConversationId,
        senderId: userId,
        senderName: user?.name || 'Admin',
        senderAvatar: user?.profilePicture,
        content: data.content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: data.attachments,
        mentions: [],
        isEdited: false,
      };

      setConversations((prev) => [newConversation, ...prev]);
      setMessages((prev) => ({ ...prev, [newConversationId]: [newMessage] }));
      toast.success('Broadcast saved locally (server unavailable)');
      setIsComposeOpen(false);
    }
  }, [userId, user]);

  const setMobileListOpen = useCallback((open: boolean) => {
    setIsMobileListOpen(open);
  }, []);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Computed values
  const filteredConversations = React.useMemo(() => {
    let result = conversations.filter((c) => 
      c.type === 'broadcast' ||
      c.participants.includes(userId) ||
      (user?.name && c.participantNames.includes(user.name)) ||
      c.lastMessageSender === (user?.name || 'You')
    );

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.subject.toLowerCase().includes(searchLower) ||
          c.lastMessage.toLowerCase().includes(searchLower) ||
          c.participantNames.some((n) => n.toLowerCase().includes(searchLower)) ||
          (c.project && c.project.toLowerCase().includes(searchLower))
      );
    }

    if (filters.priority !== 'all') {
      result = result.filter((c) => c.priority === filters.priority);
    }

    if (filters.status !== 'all') {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.project) {
      result = result.filter((c) => c.project === filters.project);
    }

    if (filters.employee) {
      result = result.filter((c) => c.participantNames.includes(filters.employee));
    }

    if (filters.type !== 'all') {
      result = result.filter((c) => c.type === filters.type);
    }

    if (filters.unreadOnly) {
      result = result.filter((c) => !c.isRead);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.dateRange === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (filters.dateRange === 'week') cutoff.setDate(now.getDate() - 7);
      else if (filters.dateRange === 'month') cutoff.setMonth(now.getMonth() - 1);
      result = result.filter((c) => new Date(c.updatedAt) >= cutoff);
    }

    // Sort: pinned first, then by updatedAt
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [conversations, filters, userId, user]);

  const inboxConversations = React.useMemo(
    () => filteredConversations.filter((c) => !c.isArchived),
    [filteredConversations]
  );

  const sentConversations = React.useMemo(
    () => filteredConversations.filter((c) => !c.isArchived && c.lastMessageSender === (user?.name || 'You')),
    [filteredConversations, user]
  );

  const archivedConversations = React.useMemo(
    () => filteredConversations.filter((c) => c.isArchived),
    [filteredConversations]
  );

  const unreadNotificationCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const unreadMessageCount = React.useMemo(
    () => conversations.filter((c) => 
      !c.isRead && 
      !c.isArchived && 
      (c.type === 'broadcast' || c.participants.includes(userId) || (user?.name && c.participantNames.includes(user.name)) || c.lastMessageSender === (user?.name || 'You'))
    ).length,
    [conversations, userId, user]
  );

  const contextValue = useMemo(
    () => ({
      conversations,
      messages,
      announcements,
      drafts,
      notifications,
      analytics,
      filters,
      selectedConversation,
      isComposeOpen,
      composePrefill,
      isMobileListOpen,
      isLoading,
      setFilters,
      resetFilters,
      selectConversation,
      openCompose,
      closeCompose,
      sendMessage,
      replyToConversation,
      createGroup: createGroupChat,
      addMembersToGroup,
      saveDraft,
      deleteDraft,
      markAsRead,
      markNotificationRead,
      markAllNotificationsRead,
      archiveConversation,
      unarchiveConversation,
      pinConversation,
      unpinConversation,
      createAnnouncement,
      updateAnnouncement,
      pinAnnouncement,
      deleteAnnouncement,
      sendBroadcast,
      setMobileListOpen,
      refreshData,
      startDirectConversation,
      filteredConversations,
      inboxConversations,
      sentConversations,
      archivedConversations,
      unreadNotificationCount,
      unreadMessageCount,
      employees,
    }),
    [
      conversations,
      messages,
      announcements,
      drafts,
      notifications,
      analytics,
      filters,
      selectedConversation,
      isComposeOpen,
      composePrefill,
      isMobileListOpen,
      isLoading,
      setFilters,
      resetFilters,
      selectConversation,
      openCompose,
      closeCompose,
      sendMessage,
      replyToConversation,
      createGroupChat,
      addMembersToGroup,
      saveDraft,
      deleteDraft,
      markAsRead,
      markNotificationRead,
      markAllNotificationsRead,
      archiveConversation,
      unarchiveConversation,
      pinConversation,
      unpinConversation,
      createAnnouncement,
      updateAnnouncement,
      pinAnnouncement,
      deleteAnnouncement,
      sendBroadcast,
      setMobileListOpen,
      refreshData,
      startDirectConversation,
      filteredConversations,
      inboxConversations,
      sentConversations,
      archivedConversations,
      unreadNotificationCount,
      unreadMessageCount,
      employees,
    ]
  );

  return (
    <CommunicationContext.Provider value={contextValue}>
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function loadFromStorage(key: string): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}