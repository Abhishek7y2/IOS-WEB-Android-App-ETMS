import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema: Schema = new Schema(
  {
    // Ye chat history kis user ki hai uski ID
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    // Chat ka title ya heading (by default 'New Conversation')
    title: { 
      type: String, 
      required: true,
      default: 'New Conversation'
    },
    // AI se generate hui chat ki choti si summary
    summary: { 
      type: String,
      required: false 
    },
    // Kya is chat ko archive kar diya gaya hai?
    isArchived: {
      type: Boolean,
      default: false
    },
    // Kya ye chat important mark (pin) ki gayi hai?
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// Add compound index for fetching chat history (sorted by updatedAt)
ChatHistorySchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);