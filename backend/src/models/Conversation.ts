import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  type: 'direct' | 'announcement' | 'broadcast' | 'group';
  subject: string;
  project?: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  groupName?: string;
  groupAdmins?: Types.Array<string>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  participants: Types.Array<string>;
  participantNames: Types.Array<string>;
  participantAvatars: Types.Array<string>;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: string;
  unreadCount: number;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  hasAttachments: boolean;
  status: 'sent' | 'delivered' | 'read' | 'unread' | 'replied' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    // Conversation kis type ki hai (direct chat, ya announcement, ya group)
    type: {
      type: String,
      enum: ['direct', 'announcement', 'broadcast', 'group'],
      default: 'direct',
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmins: {
      type: [{ type: String }],
      default: [],
    },
    // Conversation ka subject ya title
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    // Kya ye kisi specific project se judi hai
    project: {
      type: String,
      default: '',
    },
    // Kya ye kisi task ke bare me chat ho rahi hai? (Task ID)
    relatedTaskId: {
      type: String,
      default: '',
    },
    relatedTaskTitle: {
      type: String,
      default: '',
    },
    // Is chat ki importance/priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    // Kin kin users ke beech ye baat ho rahi hai (unke IDs)
    participants: [{
      type: String,
    }],
    participantNames: [{
      type: String,
    }],
    participantAvatars: [{
      type: String,
    }],
    // Aakhri bheja gaya message kya tha (UI me chat preview ke liye)
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    // Aakhri message kisne bheja tha
    lastMessageSender: {
      type: String,
      default: '',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Kya chat ko upar pin kiya gaya hai?
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'unread', 'replied', 'archived'],
      default: 'sent',
    },
    // Kis user ne ye chat start ki thi
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;