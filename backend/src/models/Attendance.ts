import mongoose, { Document, Schema } from 'mongoose';


export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeAvatar?: string;
  department?: string;
  designation?: string;
  attendanceDate: string; // YYYY-MM-DD
  checkInTime?: Date;
  checkOutTime?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalWorkingHours?: number; // In hours (decimals)
  breakDuration?: number; // In hours
  overtimeHours?: number;
  attendanceStatus: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Work From Home' | 'On-Site Visit' | 'Holiday' | 'Weekend' | 'Leave';
  isLate: boolean;
  lateByMinutes?: number;
  leftEarly: boolean;
  earlyDepartureMinutes?: number;
  location?: string;
  workMode: 'Office' | 'Work From Home' | 'Hybrid' | 'On-Site Visit';
  attendanceSource?: string;
  remarks?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    employeeAvatar: { type: String },
    department: { type: String },
    designation: { type: String },
    attendanceDate: { type: String, required: true }, // Format: YYYY-MM-DD for easier querying
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    breakStart: { type: Date },
    breakEnd: { type: Date },
    totalWorkingHours: { type: Number, default: 0 },
    breakDuration: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    attendanceStatus: { 
      type: String, 
      enum: ['Present', 'Absent', 'Late', 'Half Day', 'Work From Home', 'On-Site Visit', 'Holiday', 'Weekend', 'Leave'], 
      default: 'Present' 
    },
    isLate: { type: Boolean, default: false },
    lateByMinutes: { type: Number, default: 0 },
    leftEarly: { type: Boolean, default: false },
    earlyDepartureMinutes: { type: Number, default: 0 },
    location: { type: String },
    workMode: { 
      type: String, 
      enum: ['Office', 'Work From Home', 'Hybrid', 'On-Site Visit'], 
      default: 'Office' 
    },
    attendanceSource: { type: String },
    remarks: { type: String },
    approvedBy: { type: String }
  },
  { timestamps: true }
);

// Ensure one record per employee per day
AttendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);


export default Attendance;
