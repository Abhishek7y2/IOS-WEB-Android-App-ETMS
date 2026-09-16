import mongoose, { Document, Schema } from 'mongoose';


export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeAvatar?: string;
  department?: string;
  designation?: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  halfDay: boolean;
  halfDaySession?: 'Morning' | 'Afternoon';
  reason: string;
  attachment?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Withdrawn';
  approverName?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  leaveBalanceBefore?: number;
  leaveBalanceAfter?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    employeeAvatar: { type: String },
    department: { type: String },
    designation: { type: String },
    leaveType: { 
      type: String, 
      enum: [
        'Sick Leave', 'Casual Leave', 'Earned Leave', 'Annual Leave', 
        'Half-Day Leave', 'Work From Home', 'Maternity Leave', 
        'Paternity Leave', 'Marriage Leave', 'Bereavement Leave', 
        'Compensatory Leave', 'Unpaid Leave'
      ],
      required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    halfDay: { type: Boolean, default: false },
    halfDaySession: { type: String, enum: ['Morning', 'Afternoon'] },
    reason: { type: String, required: true, minlength: 10, maxlength: 500 },
    attachment: { type: String },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn'], 
      default: 'Pending' 
    },
    approverName: { type: String },
    approvedDate: { type: Date },
    rejectionReason: { type: String },
    leaveBalanceBefore: { type: Number },
    leaveBalanceAfter: { type: Number }
  },
  { timestamps: true }
);

const Leave = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);


export default Leave;
