import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: 'message' | 'announcement' | 'task' | 'system';
  referenceId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    // Jisko notification bheji jaa rahi hai uski ID
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    // Jisne notification bheji hai uski ID (System generated bhi ho sakti hai)
    senderId: {
      type: String,
      default: null,
    },
    senderName: {
      type: String,
      default: 'System',
    },
    senderAvatar: {
      type: String,
      default: '',
    },
    // Notification kis baare me hai (message aaya, task mila, ya system alert)
    type: {
      type: String,
      enum: ['message', 'announcement', 'task', 'system'],
      default: 'system',
    },
    // Kis specific task ya chat se judi hui hai uski ID
    referenceId: {
      type: String,
      default: null,
    },
    // Notification ka actual text/message
    message: {
      type: String,
      required: true,
    },
    // Kya user ne is notification ko dekh liya hai?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for fetching unread notifications efficiently
notificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
