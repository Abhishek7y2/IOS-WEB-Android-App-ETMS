import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskAuditLog extends Document {
  taskId: Types.ObjectId;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE';
  changedBy: Types.ObjectId;
  previousValue: any;
  newValue: any;
  createdAt: Date;
}

const taskAuditLogSchema = new Schema<ITaskAuditLog>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

taskAuditLogSchema.index({ taskId: 1 });
taskAuditLogSchema.index({ changedBy: 1 });

const TaskAuditLog = model<ITaskAuditLog>('TaskAuditLog', taskAuditLogSchema);

export default TaskAuditLog;
