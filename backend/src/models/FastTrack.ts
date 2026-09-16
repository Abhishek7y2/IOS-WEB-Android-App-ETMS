import mongoose, { Schema, Document } from 'mongoose';

export interface IFastTrack extends Document {
  intentId: string;
  intentKeywords: string[];
  canonicalQuestion: string;
  answer: string;
  requiresRole: 'admin' | 'member' | 'any';
  userId?: mongoose.Types.ObjectId; // Optional: If the cache is specific to a user (like tasks)
}

const FastTrackSchema: Schema = new Schema(
  {
    intentId: { type: String, required: true },
    intentKeywords: { type: [String], required: true },
    canonicalQuestion: { type: String, required: true },
    answer: { type: String, required: true },
    requiresRole: { type: String, enum: ['admin', 'member', 'any'], default: 'any' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true }
  },
  { timestamps: true }
);

// Create compound index for faster lookup
FastTrackSchema.index({ intentId: 1, userId: 1 });

export default mongoose.models.FastTrack || mongoose.model<IFastTrack>('FastTrack', FastTrackSchema);
