export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Work From Home' | 'On-Site Visit' | 'Holiday' | 'Weekend' | 'Leave';
export type WorkMode = 'Office' | 'Work From Home' | 'Hybrid' | 'On-Site Visit';

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department?: string;
  designation?: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakStart?: string;
  breakEnd?: string;
  totalWorkingHours?: number;
  breakDuration?: number;
  overtimeHours?: number;
  attendanceStatus: AttendanceStatus;
  isLate: boolean;
  lateByMinutes?: number;
  leftEarly: boolean;
  earlyDepartureMinutes?: number;
  location?: string;
  workMode: WorkMode;
  attendanceSource?: string;
  remarks?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAnalytics {
  presentToday: number;
  wfhToday: number;
  lateToday: number;
  avgHours: number;
}
