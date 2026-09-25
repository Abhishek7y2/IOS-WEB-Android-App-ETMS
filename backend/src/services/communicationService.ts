import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Announcement from '../models/Announcement';
import User from '../models/User';
import Notification from '../models/Notification';
import { publishEvent } from '../realtime/event.publisher';

export function formatConversation(conv: any) {
  return {
    id: conv._id.toString(),
    type: conv.type,
    subject: conv.subject,
    groupName: conv.groupName,
    project: conv.project || undefined,
    relatedTaskId: conv.relatedTaskId || undefined,
    relatedTaskTitle: conv.relatedTaskTitle || undefined,
    priority: conv.priority,
    participants: conv.participants.map((p: any) => p.toString()),
    participantNames: conv.participantNames,
    participantAvatars: conv.participantAvatars,
    lastMessage: conv.lastMessage,
    lastMessageTime: conv.lastMessageTime?.toISOString() || new Date().toISOString(),
    lastMessageSender: conv.lastMessageSender,
    unreadCount: conv.unreadCount,
    isRead: conv.isRead,
    isPinned: conv.isPinned,
    isArchived: conv.isArchived,
    hasAttachments: conv.hasAttachments,
    status: conv.status,
    createdAt: conv.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: conv.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function formatMessage(msg: any) {
  return {
    id: msg._id.toString(),
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar || undefined,
    content: msg.content,
    timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
    status: msg.status,
    attachments: msg.attachments || [],
    mentions: msg.mentions || [],
    isEdited: msg.isEdited,
    replyToId: msg.replyToId || undefined,
  };
}

export function formatAnnouncement(ann: any) {
  return {
    id: ann._id.toString(),
    title: ann.title,
    description: ann.description,
    priority: ann.priority,
    authorId: ann.authorId,
    authorName: ann.authorName,
    authorAvatar: ann.authorAvatar || undefined,
    publishDate: ann.publishDate?.toISOString() || new Date().toISOString(),
    expiryDate: ann.expiryDate?.toISOString() || undefined,
    isPinned: ann.isPinned,
    readBy: ann.readBy || [],
    createdAt: ann.createdAt?.toISOString() || new Date().toISOString(),
  };
}

export class CommunicationService {
  async getEmployees(currentUserId: string) {
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      'name email role designation profilePicture'
    );

    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation || 'Employee',
      profilePicture: u.profilePicture || '',
    }));
  }

  async getConversations(queryParams: any, user: any) {
    const userId = user?._id.toString();
    const { type, isArchived, search } = queryParams;

    const filter: any = { participants: userId };

    // WhatsApp style privacy: Admins cannot see chats they aren't part of.
    // Removed `all=true` bypass for admins.

    if (type) filter.type = type;
    if (isArchived === 'true') filter.isArchived = true;
    else if (isArchived === 'false') filter.isArchived = false;

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { lastMessage: { $regex: search, $options: 'i' } },
      ];
    }

    const conversations = await Conversation.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    return conversations.map(formatConversation);
  }

  async getConversationById(id: string, user: any) {
    const conversation = await Conversation.findById(id);
    if (!conversation) throw { status: 404, message: 'Conversation not found.' };

    const isParticipant = conversation.participants.some((p) => p.toString() === user?._id.toString());

    // WhatsApp style privacy: Must be a participant
    if (!isParticipant) {
      throw { status: 403, message: 'Forbidden. You are not a participant in this conversation.' };
    }

    return formatConversation(conversation);
  }

  async createConversation(body: any, user: any) {
    const userId = user?._id.toString();
    const { to, subject, project, relatedTaskId, priority, content, attachments } = body;

    if (!to || to.length === 0) {
      throw { status: 400, message: 'At least one recipient is required.' };
    }

    if (!subject || !subject.trim()) {
      throw { status: 400, message: 'Subject is required.' };
    }

    const recipients = await User.find({ _id: { $in: to } }, 'name profilePicture');
    const sender = user;

    const participantIds = [userId, ...to];
    const participantNames = [sender?.name || 'You', ...recipients.map((r) => r.name)];
    const participantAvatars = [sender?.profilePicture || '', ...recipients.map((r) => r.profilePicture || '')];

    const conversation = await Conversation.create({
      type: 'direct',
      subject,
      project: project || '',
      relatedTaskId: relatedTaskId || '',
      priority: priority || 'medium',
      participants: participantIds,
      participantNames,
      participantAvatars,
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'You',
      unreadCount: 0,
      isRead: true,
      isPinned: false,
      isArchived: false,
      hasAttachments: attachments && attachments.length > 0,
      status: 'sent',
      createdBy: userId,
    });

    let formattedMessage = null;
    let messageId = undefined;

    if (content && content.trim()) {
      const message = await Message.create({
        conversationId: conversation._id.toString(),
        senderId: userId,
        senderName: sender?.name || 'You',
        senderAvatar: sender?.profilePicture || '',
        content,
        timestamp: new Date(),
        status: 'sent',
        attachments: attachments || [],
        mentions: [],
        isEdited: false,
      });

      messageId = message._id;
      formattedMessage = formatMessage(message);

      const notifications = recipients.map((r) => ({
        recipientId: r._id.toString(),
        senderId: userId,
        senderName: sender?.name || 'You',
        senderAvatar: sender?.profilePicture || '',
        type: 'message',
        referenceId: conversation._id.toString(),
        message: `New message from ${sender?.name || 'You'}: ${content.substring(0, 50)}...`,
      }));
      await Notification.insertMany(notifications);
    }

    const formattedConversation = formatConversation(conversation);
    const orgRoom = `org:${user?.organizationId || 'main'}`;

    if (formattedMessage) {
        publishEvent('message.created', { messageId: messageId, message: formattedMessage, conversationId: conversation._id.toString() }, [orgRoom, `conv:${conversation._id.toString()}`], {
          actorId: user?._id?.toString(),
          organizationId: user?.organizationId || 'main',
        });
    }

    return formattedConversation;
  }

  async updateConversation(id: string, updates: any) {
    const conversation = await Conversation.findByIdAndUpdate(id, updates, { new: true });
    if (!conversation) throw { status: 404, message: 'Conversation not found.' };
    return formatConversation(conversation);
  }

  async deleteConversation(id: string) {
    const conversation = await Conversation.findByIdAndDelete(id);
    if (!conversation) throw { status: 404, message: 'Conversation not found.' };

    await Message.deleteMany({ conversationId: id });
    return true;
  }

  async getMessages(conversationId: string, user: any) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw { status: 404, message: 'Conversation not found.' };

    const isParticipant = conversation.participants.some((p) => p.toString() === user?._id.toString());

    // WhatsApp style privacy: Must be a participant
    if (!isParticipant) {
      throw { status: 403, message: 'Forbidden. You are not a participant in this conversation.' };
    }

    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });

    // Mark conversation and notifications as read when fetched
    await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0, isRead: true });
    if (user?._id) {
      await Notification.updateMany(
        { recipientId: user._id.toString(), referenceId: conversationId, type: 'message' },
        { $set: { isRead: true } }
      );
    }

    return messages.map(formatMessage);
  }

  async sendMessage(conversationId: string, body: any, user: any) {
    const userId = user?._id.toString();
    const { content, attachments } = body;

    if (!content || !content.trim()) {
      throw { status: 400, message: 'Message content is required.' };
    }

    const conversationCheck = await Conversation.findById(conversationId);
    if (!conversationCheck) throw { status: 404, message: 'Conversation not found.' };

    const isParticipant = conversationCheck.participants.some((p) => p.toString() === userId);

    // WhatsApp style privacy: Must be a participant to send
    if (!isParticipant) {
      throw { status: 403, message: 'Forbidden. You cannot send messages to this conversation.' };
    }

    const sender = user;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderName: sender?.name || 'You',
      senderAvatar: sender?.profilePicture || '',
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments || [],
      mentions: [],
      isEdited: false,
    });

    const conversation = await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'You',
      status: 'replied',
      updatedAt: new Date(),
    });

    if (conversation) {
      const recipients = conversation.participants.filter((p) => p.toString() !== userId);
      const notifications = recipients.map((recipientId) => ({
        recipientId,
        senderId: userId,
        senderName: sender?.name || 'You',
        senderAvatar: sender?.profilePicture || '',
        type: 'message',
        referenceId: conversationId,
        message: `Reply from ${sender?.name || 'You'}: ${content.substring(0, 50)}...`,
      }));
      await Notification.insertMany(notifications);
    }

    const formatted = formatMessage(message);

    const orgRoom = `org:${user?.organizationId || 'main'}`;

    // Database First, Event Second: Publish real-time Socket event from Service
    publishEvent('message.created', { messageId: message._id, message: formatted, conversationId }, [orgRoom, `conv:${conversationId}`], {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return formatted;
  }

  async getAnnouncements() {
    const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });
    return announcements.map(formatAnnouncement);
  }

  async createAnnouncement(body: any, user: any) {
    const userId = user?._id.toString();
    const { title, description, priority, publishDate, expiryDate } = body;

    if (!title || !title.trim()) throw { status: 400, message: 'Title is required.' };
    if (!description || !description.trim()) throw { status: 400, message: 'Description is required.' };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (publishDate && new Date(publishDate) < todayStart) {
      throw { status: 400, message: 'Publish date cannot be set in the past.' };
    }

    if (expiryDate && new Date(expiryDate) < todayStart) {
      throw { status: 400, message: 'Expiry date cannot be set in the past.' };
    }

    const sender = user;

    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'medium',
      authorId: userId,
      authorName: sender?.name || 'Admin',
      authorAvatar: sender?.profilePicture || '',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isPinned: false,
      readBy: [],
    });

    const formattedAnn = formatAnnouncement(announcement);

    const allUsers = await User.find({ isVerified: true, _id: { $ne: userId } }, '_id');
    const notifications = allUsers.map((u) => ({
      recipientId: u._id.toString(),
      senderId: userId,
      senderName: sender?.name || 'Admin',
      senderAvatar: sender?.profilePicture || '',
      type: 'announcement',
      referenceId: announcement._id.toString(),
      message: `New announcement: ${title}`,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const orgRoom = `org:${user?.organizationId || 'main'}`;

    // Database First, Event Second: Publish real-time Socket event from Service
    publishEvent('announcement.created', { announcement: formattedAnn }, [orgRoom], {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return formattedAnn;
  }

  async updateAnnouncement(id: string, body: any, user: any) {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      throw { status: 403, message: 'Forbidden. Admin privileges required.' };
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) throw { status: 404, message: 'Announcement not found.' };

    const { title, description, priority, publishDate, expiryDate } = body;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (publishDate) {
      const newPubDate = new Date(publishDate);
      if (newPubDate.getTime() !== new Date(announcement.publishDate).getTime() && newPubDate < todayStart) {
        throw { status: 400, message: 'Publish date cannot be set in the past.' };
      }
      announcement.publishDate = newPubDate;
    }

    if (expiryDate) {
      const newExpDate = new Date(expiryDate);
      const currentExpTime = announcement.expiryDate ? new Date(announcement.expiryDate).getTime() : 0;
      if (newExpDate.getTime() !== currentExpTime && newExpDate < todayStart) {
        throw { status: 400, message: 'Expiry date cannot be set in the past.' };
      }
      announcement.expiryDate = newExpDate;
    } else if (expiryDate === null) {
      announcement.expiryDate = undefined;
    }

    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (priority !== undefined) announcement.priority = priority;

    await announcement.save();
    return formatAnnouncement(announcement);
  }

  async togglePinAnnouncement(id: string) {
    const announcement = await Announcement.findById(id);
    if (!announcement) throw { status: 404, message: 'Announcement not found.' };

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();
    return formatAnnouncement(announcement);
  }

  async deleteAnnouncement(id: string) {
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) throw { status: 404, message: 'Announcement not found.' };
    return true;
  }

  async sendBroadcast(body: any, user: any) {
    const userId = user?._id.toString();
    const { subject, project, priority, content, attachments } = body;

    if (!subject || !subject.trim()) throw { status: 400, message: 'Subject is required.' };
    if (!content || !content.trim()) throw { status: 400, message: 'Message content is required.' };

    const sender = user;

    const allUsers = await User.find({ isVerified: true }, '_id name profilePicture');
    const participantIds = allUsers.map((u) => u._id.toString());
    const participantNames = allUsers.map((u) => u.name);
    const participantAvatars = allUsers.map((u) => u.profilePicture || '');

    const conversation = await Conversation.create({
      type: 'broadcast',
      subject,
      project: project || '',
      priority: priority || 'medium',
      participants: participantIds,
      participantNames,
      participantAvatars,
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'Admin',
      unreadCount: 0,
      isRead: true,
      isPinned: false,
      isArchived: false,
      hasAttachments: attachments && attachments.length > 0,
      status: 'sent',
      createdBy: userId,
    });

    const message = await Message.create({
      conversationId: conversation._id.toString(),
      senderId: userId,
      senderName: sender?.name || 'Admin',
      senderAvatar: sender?.profilePicture || '',
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments || [],
      mentions: [],
      isEdited: false,
    });

    const notifications = participantIds
      .filter((id) => id !== userId)
      .map((recipientId) => ({
        recipientId,
        senderId: userId,
        senderName: sender?.name || 'Admin',
        senderAvatar: sender?.profilePicture || '',
        type: 'message',
        referenceId: conversation._id.toString(),
        message: `Broadcast from ${sender?.name || 'Admin'}: ${subject}`,
      }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return {
      conversation: formatConversation(conversation),
      message: formatMessage(message),
    };
  }

  async createGroup(body: any, user: any) {
    const userId = user?._id.toString();
    const userRole = user?.role;

    if (!userId || !userRole) throw { status: 401, message: 'Unauthorized.' };

    const { groupName, participants, relatedTaskId, initialMessage } = body;
    if (!groupName || !participants || !Array.isArray(participants)) {
      throw { status: 400, message: 'Invalid data.' };
    }

    const participantIds = [userId, ...participants];
    const uniqueParticipants = Array.from(new Set(participantIds));

    const users = await User.find({ _id: { $in: uniqueParticipants } }, 'name profilePicture');
    const participantNames = users.map((u) => u.name);
    const participantAvatars = users.map((u) => u.profilePicture || '');

    const group = await Conversation.create({
      type: 'group',
      groupName,
      groupAdmins: [userId],
      subject: groupName,
      relatedTaskId: relatedTaskId || '',
      participants: uniqueParticipants,
      participantNames,
      participantAvatars,
      lastMessage: initialMessage || 'Group created',
      lastMessageTime: new Date(),
      lastMessageSender: user?.name || 'Admin',
      unreadCount: 0,
      isRead: true,
      status: 'sent',
      createdBy: userId,
    });

    if (initialMessage) {
      await Message.create({
        conversationId: group._id.toString(),
        senderId: userId,
        senderName: user?.name || 'Admin',
        senderAvatar: user?.profilePicture || '',
        content: initialMessage,
        status: 'sent',
        attachments: [],
        mentions: [],
      });
    }

    return formatConversation(group);
  }

  async getAnalytics() {
    const totalMessages = await Message.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await Message.countDocuments({ timestamp: { $gte: today } });
    const unreadMessages = await Conversation.countDocuments({ isRead: false, isArchived: false });
    const totalAnnouncements = await Announcement.countDocuments();

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await Message.countDocuments({ timestamp: { $gte: day, $lt: nextDay } });
      weeklyTrend.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      month.setDate(1);
      month.setHours(0, 0, 0, 0);
      const nextMonth = new Date(month);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const count = await Message.countDocuments({ timestamp: { $gte: month, $lt: nextMonth } });
      monthlyTrend.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        count,
      });
    }

    const mostActiveResult = await Message.aggregate([
      { $group: { _id: '$senderId', senderName: { $first: '$senderName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostActiveEmployee = mostActiveResult[0]?.senderName || 'N/A';

    const mostActiveProjectResult = await Conversation.aggregate([
      { $match: { project: { $exists: true, $ne: '' } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostActiveProject = mostActiveProjectResult[0]?._id || 'N/A';

    const conversationIds = await Conversation.distinct('_id');
    let totalGapMs = 0;
    let gapCount = 0;
    for (const convId of conversationIds.slice(0, 20)) {
      const msgs = await Message.find({ conversationId: convId.toString() }).sort({ timestamp: 1 }).limit(10);
      for (let i = 1; i < msgs.length; i++) {
        const gap = new Date(msgs[i].timestamp).getTime() - new Date(msgs[i - 1].timestamp).getTime();
        if (gap > 0 && gap < 24 * 60 * 60 * 1000) {
          totalGapMs += gap;
          gapCount++;
        }
      }
    }
    let averageResponseTime = 'N/A';
    if (gapCount > 0) {
      const avgMs = totalGapMs / gapCount;
      const avgH = Math.floor(avgMs / 3600000);
      const avgM = Math.floor((avgMs % 3600000) / 60000);
      averageResponseTime = avgH > 0 ? `~${avgH}h ${avgM}m` : `~${avgM}m`;
    }

    return {
      totalMessages,
      messagesToday,
      unreadMessages,
      totalAnnouncements,
      averageResponseTime,
      mostActiveEmployee,
      mostActiveProject,
      weeklyTrend,
      monthlyTrend,
    };
  }
}

export const communicationService = new CommunicationService();
