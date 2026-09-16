'use client';

import axiosInstance from '../services/axios';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth';
import {
  forgotPassword as mockForgotPassword,
  loginUser as mockLoginUser,
  registerUser as mockRegisterUser,
} from './mockAuth';

function isMockAuthEnabled(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem('use_mock_auth') === 'true';
}

export async function registerUser(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  if (isMockAuthEnabled()) {
    return mockRegisterUser(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/register', payload);
    const apiData = response.data;
    return {
      message: apiData.message || 'Registration successful.',
      user: apiData.data?.user || apiData.user,
      token: apiData.data?.token
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  if (isMockAuthEnabled()) {
    return mockLoginUser(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/login', payload);
    const apiData = response.data.data;
    return {
      user: apiData.user,
      token: {
        accessToken: apiData.token, // Still parsed but not saved in localStorage anymore
        expiresIn: 3600
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function logoutUser(): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock logout successful.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/logout');
    return { message: response.data.message || 'Logout successful.' };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  if (isMockAuthEnabled()) {
    return mockForgotPassword(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/forgot-password', payload);
    return {
      message: response.data.message || 'Reset link sent successfully.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock password reset successful.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/reset-password', payload);
    return {
      message: response.data.message || 'Password has been reset successfully.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified successfully.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-otp', { email, otp });
    return {
      message: response.data.message || 'Verification successful.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function resendVerificationOtp(email: string): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock verification OTP resent.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/resend-verification-otp', { email });
    return {
      message: response.data.message || 'A new verification code has been sent.',
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function resendResetOtp(payload: { email?: string; mobileNumber?: string; countryCode?: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock reset OTP resent.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/resend-reset-otp', payload);
    return {
      message: response.data.message || 'A new reset code has been sent.',
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateUserProfile(
  id: string,
  payload: {
    role?: string; designation?: string; name?: string; profilePicture?: string; firstName?: string; lastName?: string; gender?: string; mobileNumber?: string; countryCode?: string; qualification?: string;
    country?: string;
    permanentAddress?: string;
    currentAddress?: string; alternateNumber?: string; state?: string; district?: string; documents?: string[]; termsAndConditions?: boolean
  }
): Promise<any> {
  if (isMockAuthEnabled()) {
    return { id, ...payload };
  }

  try {
    const response = await axiosInstance.put<any>(`/auth/users/${id}`, payload);
    return response.data.data.user;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function removeUser(id: string): Promise<any> {
  if (isMockAuthEnabled()) {
    return { success: true };
  }

  try {
    const response = await axiosInstance.delete<any>(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function blockUserAPI(id: string): Promise<any> {
  if (isMockAuthEnabled()) return { success: true };
  try {
    const response = await axiosInstance.post<any>(`/auth/users/${id}/block`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function unblockUserAPI(id: string): Promise<any> {
  if (isMockAuthEnabled()) return { success: true };
  try {
    const response = await axiosInstance.post<any>(`/auth/users/${id}/unblock`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}


export async function requestLoginOtp(payload: { email?: string; mobileNumber?: string; countryCode?: string }): Promise<{ message: string; email?: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock login OTP sent to your email.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/request-login-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function loginWithOtp(payload: { email?: string; mobileNumber?: string; countryCode?: string; otp: string }): Promise<LoginResponse> {
  if (isMockAuthEnabled()) {
    const email = payload.email || 'mock@example.com';
    return mockLoginUser({ email, password: '' });
  }

  try {
    const response = await axiosInstance.post<any>('/auth/login-with-otp', payload);
    const apiData = response.data.data;
    return {
      user: apiData.user,
      token: {
        accessToken: apiData.token,
        expiresIn: 3600,
      },
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyResetOtp(email: string, otp: string): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified successfully.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-reset-otp', { email, otp });
    return {
      message: response.data.message || 'Verification successful.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function requestPhoneChangeOtpApi(payload: { mobileNumber: string; countryCode: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP sent to new mobile number.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/request-phone-change-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyPhoneChangeOtpApi(otp: string): Promise<{ message: string, data: any }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified.', data: {} };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-phone-change-otp', { otp });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function normalizeApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unable to process request. Please try again later.');
}

export async function requestRegistrationOtpApi(payload: { mobileNumber: string; countryCode: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP sent to mobile number.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/request-registration-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyRegistrationOtpApi(payload: { mobileNumber: string; countryCode: string; otp: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-registration-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function requestRegistrationEmailOtpApi(payload: { email: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP sent to email.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/request-registration-email-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyRegistrationEmailOtpApi(payload: { email: string; otp: string }): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-registration-email-otp', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}


export async function requestEmailChangeOtpApi(email: string): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.post<{ message: string }>('/auth/request-email-change-otp', { email });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyEmailChangeOtpApi(otp: string): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.post<{ message: string }>('/auth/verify-email-change-otp', { otp });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
