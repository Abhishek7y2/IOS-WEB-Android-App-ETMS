import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    const DocumentChunk = mongoose.model('DocumentChunk');
    if (DocumentChunk) {
      await DocumentChunk.deleteMany({ documentId: doc._id });
    }
  }
  next();
});

DocumentSchema.pre('deleteMany', async function(next) {
  const docs = await this.model.find(this.getQuery());
  const docIds = docs.map(d => d._id);
  if (docIds.length > 0) {
    const DocumentChunk = mongoose.model('DocumentChunk');
    if (DocumentChunk) {
      await DocumentChunk.deleteMany({ documentId: { $in: docIds } });
    }
  }
  next();
});

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
