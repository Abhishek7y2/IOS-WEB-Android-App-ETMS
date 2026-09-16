import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const memoryStore: Record<string, string> = {};

/**
 * Storage Abstraction:
 * - Sensitive authentication credentials (JWT auth_token) are stored in hardware-backed SecureStore.
 * - Non-sensitive metadata (user profile JSON) resides in AsyncStorage.
 * - Passwords, OTPs, Gemini secrets, and API keys are NEVER persisted.
 */
export const secureStorage = {
  // Sensitive token retrieval via SecureStore
  getToken: async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) return token;
    } catch {
      // SecureStore fallback if native keychain unlinked or in web preview
    }
    return memoryStore['auth_token'] || null;
  },

  // Sensitive token persistence via SecureStore
  setToken: async (token: string): Promise<void> => {
    memoryStore['auth_token'] = token;
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch {
      // Memory store fallback
    }
  },

  // Sensitive token clearance via SecureStore
  removeToken: async (): Promise<void> => {
    delete memoryStore['auth_token'];
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch {
      // Ignore fallback
    }
  },
};

export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (key === 'auth_token') {
      return secureStorage.getToken();
    }
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fallback
    }
    return memoryStore[key] || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (key === 'auth_token') {
      return secureStorage.setToken(value);
    }
    memoryStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Fallback
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (key === 'auth_token') {
      return secureStorage.removeToken();
    }
    delete memoryStore[key];
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fallback
    }
  },
};

export const getItem = safeStorage.getItem;
export const setItem = safeStorage.setItem;
export const removeItem = safeStorage.removeItem;
