import axiosInstance from './axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await axiosInstance.post<any>('/auth/login', payload);
  const apiData = response.data.data;
  return {
    user: apiData.user,
    token: {
      accessToken: apiData.token,
      expiresIn: 3600,
    },
  };
}

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await axiosInstance.post<any>('/auth/register', payload);
  const apiData = response.data;
  return {
    message: apiData.message || 'Registration successful.',
    user: apiData.data?.user || apiData.user,
    token: apiData.data?.token ? { accessToken: apiData.data.token, expiresIn: 3600 } : undefined,
  };
}

export async function logoutUserApi(): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.post<any>('/auth/logout');
    return { message: response.data.message || 'Logged out successfully.' };
  } catch {
    return { message: 'Logged out.' };
  }
}

export async function requestLoginOtp(payload: { email?: string; mobileNumber?: string; countryCode?: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/request-login-otp', payload);
  return { message: response.data.message || 'OTP sent successfully.' };
}

export async function loginWithOtp(payload: { email?: string; mobileNumber?: string; countryCode?: string; otp: string }): Promise<LoginResponse> {
  const response = await axiosInstance.post<any>('/auth/login-otp', payload);
  const apiData = response.data.data;
  return {
    user: apiData.user,
    token: {
      accessToken: apiData.token,
      expiresIn: 3600,
    },
  };
}

export async function requestRegistrationOtpApi(payload: { mobileNumber: string; countryCode: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/request-registration-otp', payload);
  return { message: response.data.message || 'OTP sent to mobile.' };
}

export async function verifyRegistrationOtpApi(payload: { mobileNumber: string; countryCode: string; otp: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/verify-registration-otp', payload);
  return { message: response.data.message || 'Mobile number verified.' };
}

export async function requestRegistrationEmailOtpApi(payload: { email: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/request-registration-email-otp', payload);
  return { message: response.data.message || 'OTP sent to email.' };
}

export async function verifyRegistrationEmailOtpApi(payload: { email: string; otp: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/verify-registration-email-otp', payload);
  return { message: response.data.message || 'Email address verified.' };
}

export async function requestPhoneChangeOtpApi(payload: { mobileNumber: string; countryCode: string }): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/request-phone-change-otp', payload);
  return { message: response.data.message || 'OTP sent to new mobile number.' };
}

export async function verifyPhoneChangeOtpApi(otp: string): Promise<{ message: string; data?: any }> {
  const response = await axiosInstance.post<any>('/auth/verify-phone-change-otp', { otp });
  return { message: response.data.message || 'Phone number updated.', data: response.data.data };
}

export async function requestEmailChangeOtpApi(newEmail: string): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/request-email-change-otp', { newEmail });
  return { message: response.data.message || 'OTP sent to new email.' };
}

export async function verifyEmailChangeOtpApi(otp: string): Promise<{ message: string }> {
  const response = await axiosInstance.post<any>('/auth/verify-email-change-otp', { otp });
  return { message: response.data.message || 'Email updated successfully.' };
}

export async function updateUserProfile(userId: string, updates: Record<string, any>): Promise<any> {
  const response = await axiosInstance.patch<any>(`/users/${userId}`, updates);
  return response.data.data?.user || response.data.user || response.data;
}

export async function blockUserAPI(userId: string): Promise<{ message: string }> {
  const response = await axiosInstance.put<any>(`/users/${userId}/block`);
  return { message: response.data.message || 'User blocked.' };
}

export async function unblockUserAPI(userId: string): Promise<{ message: string }> {
  const response = await axiosInstance.put<any>(`/users/${userId}/unblock`);
  return { message: response.data.message || 'User unblocked.' };
}

export async function removeUser(userId: string): Promise<{ message: string }> {
  const response = await axiosInstance.delete<any>(`/users/${userId}`);
  return { message: response.data.message || 'User removed.' };
}

