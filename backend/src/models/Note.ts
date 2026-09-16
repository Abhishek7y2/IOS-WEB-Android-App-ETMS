import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  dateStr: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Note' },
    dateStr: { type: String, required: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<INote>('Note', NoteSchema);
