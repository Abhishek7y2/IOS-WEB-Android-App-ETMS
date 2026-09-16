import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { safeStorage } from '../services/storage';
import { AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import { loginUser, registerUser, logoutUserApi } from '../services/authApi';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/axios';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithMock: (customEmail?: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  persistAuth: (authUser: AuthUser, authToken: string) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore stored session on mobile app mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await safeStorage.getItem(USER_STORAGE_KEY);
        const storedToken = await safeStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch {
        // Clear corrupted session
        await safeStorage.removeItem(USER_STORAGE_KEY);
        await safeStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const persistAuth = useCallback(async (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    await safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    await safeStorage.setItem(TOKEN_STORAGE_KEY, authToken);
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  const clearAuth = useCallback(async () => {
    setUser(null);
    setToken(null);
    await safeStorage.removeItem(USER_STORAGE_KEY);
    await safeStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(credentials);
      await persistAuth(res.user, res.token.accessToken);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      if (res.token?.accessToken) {
        await persistAuth(res.user, res.token.accessToken);
      } else {
        // Attempt automatic login after registration
        if (data.email && data.password) {
          await login({ email: data.email, password: data.password });
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistAuth, login]);

  const loginWithMock = useCallback(async (customEmail?: string) => {
    setLoading(true);
    setError(null);
    const mockUser: AuthUser = {
      id: 'usr_demo_101',
      name: 'Abhishek Sharma',
      email: customEmail || 'abhishek7y2@gmail.com',
      role: 'admin',
      designation: 'Senior Developer',
      mobileNumber: '9876543210',
      countryCode: '+91',
    };
    await persistAuth(mockUser, 'mock_token_mobile');
    setLoading(false);
  }, [persistAuth]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUserApi();
    } catch {
      // Ignore API logout error
    } finally {
      await clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  const clearError = useCallback(() => setError(null), []);

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
        loginWithMock,
        register,
        logout,
        clearError,
        persistAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
