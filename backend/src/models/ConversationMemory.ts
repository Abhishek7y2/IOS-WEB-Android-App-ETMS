import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMemory extends Document {
  chatHistoryId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  tokensUsed?: number;
  createdAt: Date;
}

const ConversationMemorySchema: Schema = new Schema(
  {
    // Ye message kis chat history/session se juda hua hai
    chatHistoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'ChatHistory', 
      required: true,
      index: true
    },
    // Kisne message bheja (insaan ne ya AI chatbot ne ya system ne)
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system', 'tool'], 
      required: true 
    },
    // Message ka actual text ya content kya hai
    content: { 
      type: String, 
      required: true 
    },
    // Agar AI chatbot ne koi external tool/API use kiya hai, toh uski details
    toolCalls: {
      type: Schema.Types.Mixed,
      required: false
    },
    // Tool se aane wala data/result
    toolResults: {
      type: Schema.Types.Mixed,
      required: false
    },
    // Is message me AI ke kitne tokens kharch hue
    tokensUsed: {
      type: Number,
      required: false
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Add compound index for fetching messages sorted by time
ConversationMemorySchema.index({ chatHistoryId: 1, createdAt: 1 });

export default mongoose.models.ConversationMemory || mongoose.model<IConversationMemory>('ConversationMemory', ConversationMemorySchema);