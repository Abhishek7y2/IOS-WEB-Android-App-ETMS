import mongoose, { Document, Schema } from 'mongoose';

export interface IChatProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  chats: mongoose.Types.ObjectId[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatProjectSchema = new Schema<IChatProject>(
  {
    // Kis user ka project folder hai
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Project ka naam
    name: { type: String, required: true },
    // Is project folder me kitni chats (ChatHistory) shamil hain
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatHistory' }],
    // Kya is project ko top par pin kiya gaya hai?
    isPinned: { type: Boolean, default: false },
    // Kya is project ko hide (archive) kar diya gaya hai?
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatProjectSchema.index({ userId: 1, isArchived: 1 });

export default mongoose.model<IChatProject>('ChatProject', chatProjectSchema);
