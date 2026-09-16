import axiosInstance from './axios';
import { AuthUser } from '../types/auth';

export async function updateProfileApi(userId: string, updates: {
  name?: string;
  designation?: string;
  department?: string;
  mobileNumber?: string;
  countryCode?: string;
  profilePicture?: string;
  coverPicture?: string;
  biography?: string;
  password?: string;
}): Promise<AuthUser> {
  const response = await axiosInstance.put<{ success: boolean; data: { user: any } }>(`/auth/users/${userId}`, updates);
  const u = response.data.data.user;
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role || 'user',
    designation: u.designation,
    department: u.department,
    profilePicture: u.profilePicture,
    coverPicture: u.coverPicture,
    mobileNumber: u.mobileNumber,
    biography: u.biography,
  };
}

export async function purgeAccountApi(): Promise<void> {
  await axiosInstance.delete('/auth/me/purge');
}

export async function exportPersonalDataApi(): Promise<any> {
  const res = await axiosInstance.get('/profile/export-data');
  return res.data;
}

