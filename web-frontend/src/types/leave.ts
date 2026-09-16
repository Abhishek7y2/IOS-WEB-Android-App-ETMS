export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Withdrawn';

export type LeaveType = 
  | 'Sick Leave' 
  | 'Casual Leave' 
  | 'Earned Leave' 
  | 'Annual Leave' 
  | 'Half-Day Leave' 
  | 'Work From Home' 
  | 'Maternity Leave' 
  | 'Paternity Leave' 
  | 'Marriage Leave' 
  | 'Bereavement Leave' 
  | 'Compensatory Leave' 
  | 'Unpaid Leave';

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department?: string;
  designation?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay: boolean;
  halfDaySession?: 'Morning' | 'Afternoon';
  reason: string;
  attachment?: string;
  status: LeaveStatus;
  approverName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  leaveBalanceBefore?: number;
  leaveBalanceAfter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceItem {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  _id: string;
  employeeId: string;
  year: number;
  balances: LeaveBalanceItem[];
}

export interface LeaveStats {
  onLeaveToday: number;
  pendingRequests: number;
  approvedLeaves: number;
  rejectedLeaves: number;
}
