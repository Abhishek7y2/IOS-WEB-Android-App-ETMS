import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  text: string;
  embedding: number[];
  chunkIndex: number;
  fileName: string;
  pageNumber?: number;
  uploaderId: mongoose.Types.ObjectId;
  uploaderRole: string;
  createdAt: Date;
}

const DocumentChunkSchema: Schema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: false,
      default: null,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderRole: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.DocumentChunk || mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
