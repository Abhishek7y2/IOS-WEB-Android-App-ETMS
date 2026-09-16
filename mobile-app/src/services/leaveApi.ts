import axiosInstance from './axios';

export interface LeaveRequest {
  id: string;
  leaveType: 'sick' | 'casual' | 'earned';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LeaveBalance {
  sickLeave: number;
  casualLeave: number;
  earnedLeave: number;
}

export async function applyLeaveApi(payload: {
  leaveType: 'sick' | 'casual' | 'earned';
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<LeaveRequest> {
  const response = await axiosInstance.post<{ success: boolean; data: { leave: any } }>('/leaves/apply', payload);
  const l = response.data.data.leave;
  return {
    id: l._id || l.id,
    leaveType: l.leaveType,
    startDate: l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : payload.startDate,
    endDate: l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : payload.endDate,
    reason: l.reason,
    status: l.status || 'pending',
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export async function getMyLeavesApi(): Promise<{ leaves: LeaveRequest[]; balances: LeaveBalance }> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { leaves: any[]; balances: LeaveBalance } }>('/leaves/my-leaves');
    const leaves = response.data.data.leaves.map((l: any) => ({
      id: l._id || l.id,
      leaveType: l.leaveType,
      startDate: l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : '',
      endDate: l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : '',
      reason: l.reason,
      status: l.status || 'pending',
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : '',
    }));
    const balances = response.data.data.balances || { sickLeave: 12, casualLeave: 12, earnedLeave: 15 };
    return { leaves, balances };
  } catch {
    return {
      leaves: [],
      balances: { sickLeave: 12, casualLeave: 12, earnedLeave: 15 },
    };
  }
}
