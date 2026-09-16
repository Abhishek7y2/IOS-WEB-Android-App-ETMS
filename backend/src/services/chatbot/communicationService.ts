import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import Announcement from '../../models/Announcement';
import { IUser } from '../../models/User';

// ---------------------------------------------------------------------------
// 1. CREATE ANNOUNCEMENT
// ---------------------------------------------------------------------------
// AI Bot ke liye 'createAnnouncement' tool ka schema
export const createAnnouncementDeclaration: FunctionDeclaration = {
  name: 'createAnnouncement',
  description: 'Creates a new workspace-wide announcement. ADMIN ONLY.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: 'Title of the announcement' },
      content: { type: SchemaType.STRING, description: 'The main message or content of the announcement' },
      priority: { type: SchemaType.STRING, description: 'low, normal, high, urgent' }
    },
    required: ['title', 'content']
  },
};

// Asli function jo Admin ke kehne par company-wide notice (announcement) database me banata hai
export async function handleCreateAnnouncement(user: IUser, args: { title: string; content: string; priority?: string }) {
  if (user.role !== 'admin') {
    return { error: 'UNAUTHORIZED: Only administrators can create announcements.' };
  }

  const announcement = await Announcement.create({
    title: args.title,
    content: args.content,
    priority: args.priority || 'normal',
    createdBy: user._id,
  });

  return { success: true, message: `Announcement '${announcement.title}' has been successfully broadcast to the workspace.` };
}

// ---------------------------------------------------------------------------
// 2. FETCH ANNOUNCEMENTS
// ---------------------------------------------------------------------------
// AI Bot ke liye 'fetchAnnouncements' tool ka schema
export const fetchAnnouncementsDeclaration: FunctionDeclaration = {
  name: 'fetchAnnouncements',
  description: 'Fetches recent workspace announcements.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'Optional. Number of recent announcements to fetch. Default is 5.' }
    }
  },
};

// Function jo database se naye announcements laata hai aur AI ko deta hai
export async function handleFetchAnnouncements(user: IUser, args: { limit?: number }) {
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(args.limit || 5)
    .populate('createdBy', 'name role')
    .lean();

  if (!announcements.length) {
    return { message: 'There are no recent announcements.' };
  }

  return announcements.map((a: any) => ({
    title: a.title,
    content: a.content,
    priority: a.priority,
    date: a.createdAt,
    author: a.createdBy?.name || 'Admin'
  }));
}
