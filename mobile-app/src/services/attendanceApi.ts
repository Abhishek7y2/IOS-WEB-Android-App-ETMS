import axiosInstance from './axios';

export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'late' | 'half_day' | 'absent';
  location?: string;
}

export async function checkInApi(location?: string): Promise<AttendanceRecord> {
  const response = await axiosInstance.post<{ success: boolean; data: { attendance: any } }>('/attendance/check-in', {
    location: location || 'Mobile App GPS Check-In',
  });
  const a = response.data.data.attendance;
  return {
    id: a._id || a.id,
    date: a.date,
    checkInTime: a.checkInTime,
    checkOutTime: a.checkOutTime,
    status: a.status || 'present',
    location: a.location,
  };
}

export async function checkOutApi(): Promise<AttendanceRecord> {
  const response = await axiosInstance.post<{ success: boolean; data: { attendance: any } }>('/attendance/check-out');
  const a = response.data.data.attendance;
  return {
    id: a._id || a.id,
    date: a.date,
    checkInTime: a.checkInTime,
    checkOutTime: a.checkOutTime,
    status: a.status || 'present',
    location: a.location,
  };
}

export async function getAttendanceHistoryApi(): Promise<AttendanceRecord[]> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { history: any[] } }>('/attendance/history');
    return response.data.data.history.map((a: any) => ({
      id: a._id || a.id,
      date: a.date ? new Date(a.date).toISOString().split('T')[0] : '',
      checkInTime: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      checkOutTime: a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      status: a.status || 'present',
      location: a.location,
    }));
  } catch {
    return [];
  }
}
