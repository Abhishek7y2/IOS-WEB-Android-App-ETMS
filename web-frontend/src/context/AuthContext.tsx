'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  forgotPassword as forgotPasswordApi,
  loginUser,
  registerUser,
  resetPassword as resetPasswordApi,
  updateUserProfile,
  removeUser,
  logoutUser,
  verifyResetOtp as verifyResetOtpApi,
  requestPhoneChangeOtpApi,
  verifyPhoneChangeOtpApi,
  requestEmailChangeOtpApi,
  verifyEmailChangeOtpApi,
} from '../api/auth';
import {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<string>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<string>;
  persistAuth: (authUser: AuthUser, authToken: string) => void;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  verifyResetOtp: (otp: string) => Promise<void>;
  requestPhoneChangeOtp: (mobileNumber: string, countryCode: string) => Promise<string>;
  verifyPhoneChangeOtp: (otp: string) => Promise<void>;
  requestEmailChangeOtp: (email: string) => Promise<string>;
  verifyEmailChangeOtp: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  user: 'auth_user',
  token: 'auth_token',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitializing(false);
      return;
    }

    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEYS.user);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // We no longer read the token from localStorage; we rely on the HttpOnly cookie.
        // For backwards compatibility in this context state, we just set a dummy token 
        // to indicate 'isAuthenticated' is true since we have a user.
        setToken('cookie_managed');
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      }
    }

    setInitializing(false);
  }, []);

  const persistAuth = useCallback((authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken('cookie_managed'); // Backend set the real token via HttpOnly cookie
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(authUser));
    // Removing the token from localStorage
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await loginUser(credentials);
      persistAuth(response.user, response.token.accessToken);
      router.push('/');
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [persistAuth, router]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: RegisterResponse = await registerUser(data);
      return response;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forgotPasswordApi(payload);
      return response.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await resetPasswordApi(payload);
      return response.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout API failed:', e);
    }
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  const updateUser = useCallback(
    async (updates: Partial<AuthUser>) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const updatedUser = await updateUserProfile(user.id, updates);
        setUser(updatedUser);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(updatedUser));
      } catch (apiError) {
        setError(getFriendlyErrorMessage(apiError));
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await removeUser(user.id);
      clearAuth();
      router.push('/login');
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user, clearAuth, router]);

  const verifyResetOtp = useCallback(async (otp: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await verifyResetOtpApi(user.email, otp);
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requestPhoneChangeOtp = useCallback(async (mobileNumber: string, countryCode: string) => {
    if (!user) return '';
    setLoading(true);
    setError(null);
    try {
      const res = await requestPhoneChangeOtpApi({ mobileNumber, countryCode });
      return res.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyPhoneChangeOtp = useCallback(async (otp: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyPhoneChangeOtpApi(otp);
      // Update local user state
      if (res.data) {
        const updatedUser = { ...user, mobileNumber: res.data.mobileNumber, countryCode: res.data.countryCode };
        setUser(updatedUser);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(updatedUser));
      }
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user]);


  const requestEmailChangeOtp = useCallback(async (email: string) => {
    if (!user) return '';
    setLoading(true);
    setError(null);
    try {
      const response = await requestEmailChangeOtpApi(email);
      return response.message;
    } catch (apiError) {
      setError((apiError as any)?.message || 'Failed to request email change OTP');
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyEmailChangeOtp = useCallback(async (otp: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await verifyEmailChangeOtpApi(otp);
      // We can also trigger a profile fetch here if we had one, but typically updateUser handles state sync if we manually update it
    } catch (apiError) {
      setError((apiError as any)?.message || 'Failed to verify email change OTP');
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        initializing,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        persistAuth,
        updateUser,
        deleteAccount,
        verifyResetOtp,
        requestPhoneChangeOtp,
        verifyPhoneChangeOtp,
    requestEmailChangeOtp,
    verifyEmailChangeOtp,
      }}
    >
      {children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorWithStatus = error as Error & { status?: number };
    // If the error message is a specific message from the server, use it
    if (error.message && error.message !== 'An unexpected error occurred. Please try again.') {
      return error.message;
    }
    if (typeof errorWithStatus.status === 'number') {
      switch (errorWithStatus.status) {
        case 400:
          return error.message;
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Forbidden. You do not have access.';
        case 404:
          return 'Server resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.message;
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
