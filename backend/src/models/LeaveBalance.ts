import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  balances: {
    leaveType: string;
    total: number;
    used: number;
    remaining: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveBalanceSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    balances: [
      {
        leaveType: { type: String, required: true },
        total: { type: Number, required: true, default: 0 },
        used: { type: Number, required: true, default: 0 },
        remaining: { type: Number, required: true, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

export default mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);
