import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'unread' | 'replied' | 'archived';
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'pdf' | 'docx' | 'excel' | 'zip' | 'other';
    url: string;
    size: number;
  }[];
  mentions: string[];
  isEdited: boolean;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    // Ye message kis conversation/chat ka hissa hai uski ID
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    // Kis user ne ye message bheja hai uski ID
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
      default: '',
    },
    // Message me actual me kya likha hai
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'unread', 'replied', 'archived'],
      default: 'sent',
    },
    // Agar message me koi files (images, pdf) attached hain, unki details
    attachments: [{
      id: String,
      name: String,
      type: {
        type: String,
        enum: ['image', 'pdf', 'docx', 'excel', 'zip', 'other'],
        default: 'other',
      },
      url: String,
      size: Number,
    }],
    // Jin users ko is message me mention kiya gaya hai
    mentions: [{
      type: String,
    }],
    // Kya bhejne ke baad message edit kiya gaya hai?
    isEdited: {
      type: Boolean,
      default: false,
    },
    // Agar kisi purane message ka reply hai, toh us purane message ki ID
    replyToId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;