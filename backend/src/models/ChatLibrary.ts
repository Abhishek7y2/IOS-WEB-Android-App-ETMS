import mongoose, { Document, Schema } from 'mongoose';

export interface IChatLibrary extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  chats: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatLibrarySchema = new Schema<IChatLibrary>(
  {
    // Ye library folder kis user ne banaya hai
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Library/Folder ka naam
    name: { type: String, required: true },
    // Is library me kaun kaun si chats (ChatHistory IDs) save hain
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatHistory' }],
  },
  { timestamps: true }
);

chatLibrarySchema.index({ userId: 1 });

export default mongoose.model<IChatLibrary>('ChatLibrary', chatLibrarySchema);
