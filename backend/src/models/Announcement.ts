import { Schema, model, Document } from 'mongoose';


export interface IAnnouncement extends Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishDate: Date;
  expiryDate?: Date;
  isPinned: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    // Announcement ka heading ya title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Announcement ki poori detail ya body
    description: {
      type: String,
      required: true,
    },
    // Announcement ki urgency (e.g., normal notice hai ya urgent)
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    // Kis user (admin) ne ye announcement banayi hai uski ID
    authorId: {
      type: String,
      required: true,
    },
    // Author ka naam (UI pe dikhane ke liye)
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    // Kab publish karni hai (by default abhi)
    publishDate: {
      type: Date,
      default: Date.now,
    },
    // Kab ye announcement hat jayegi (optional)
    expiryDate: {
      type: Date,
      default: null,
    },
    // Kya isko dashboard ke top par pin karna hai?
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Kin kin users ne ise padh liya hai unki IDs ki list
    readBy: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

const Announcement = model<IAnnouncement>('Announcement', announcementSchema);



export default Announcement;