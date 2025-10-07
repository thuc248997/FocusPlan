import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type TokenBundle = {
  accessToken: string;
  expiresIn: number;
  issuedAt: number;
  scope?: string;
  tokenType?: string;
};

const TOKEN_KEY = 'focusplan.google-token';

const isSecureStoreSupported = () =>
  Platform.OS !== 'web' &&
  typeof SecureStore?.setItemAsync === 'function' &&
  typeof SecureStore?.getItemAsync === 'function' &&
  typeof SecureStore?.deleteItemAsync === 'function';

const isSecureStoreUnavailableError = (error: unknown) => {
  if (!error) {
    return false;
  }
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('ExpoSecureStore') || message.includes('getValueWithKeyAsync');
};

const memoryStore = new Map<string, string>();

const createLocalStorageAdapter = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      setItem: async (key, value) => {
        memoryStore.set(key, value);
      },
      getItem: async (key) => memoryStore.get(key) ?? null,
      deleteItem: async (key) => {
        memoryStore.delete(key);
      }
    };
  }
  return {
    setItem: async (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Failed to persist token to localStorage', error);
      }
    },
    getItem: async (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.warn('Failed to read token from localStorage', error);
        return null;
      }
    },
    deleteItem: async (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to clear token from localStorage', error);
      }
    }
  };
};

type StorageAdapter = ReturnType<typeof createLocalStorageAdapter>;

const localStorageAdapter = (): StorageAdapter => createLocalStorageAdapter();

const secureStoreAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      if (isSecureStoreUnavailableError(error)) {
        throw new SecureStoreUnavailableError(error);
      }
      throw error;
    }
  },
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (isSecureStoreUnavailableError(error)) {
        throw new SecureStoreUnavailableError(error);
      }
      throw error;
    }
  },
  deleteItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (isSecureStoreUnavailableError(error)) {
        throw new SecureStoreUnavailableError(error);
      }
      throw error;
    }
  }
};

class SecureStoreUnavailableError extends Error {
  constructor(cause: unknown) {
    super('SecureStore is not available on this platform.');
    this.name = 'SecureStoreUnavailableError';
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

const getStorage = (): StorageAdapter => {
  if (isSecureStoreSupported()) {
    return secureStoreAdapter;
  }
  return localStorageAdapter();
};

const storage = getStorage();

export const saveToken = async (token: TokenBundle): Promise<void> => {
  const serialized = JSON.stringify(token);
  try {
    await storage.setItem(TOKEN_KEY, serialized);
  } catch (error) {
    if (error instanceof SecureStoreUnavailableError) {
      await localStorageAdapter().setItem(TOKEN_KEY, serialized);
      return;
    }
    throw error;
  }
};

export const retrieveToken = async (): Promise<TokenBundle | null> => {
  let raw: string | null = null;
  try {
    raw = await storage.getItem(TOKEN_KEY);
  } catch (error) {
    if (error instanceof SecureStoreUnavailableError) {
      raw = await localStorageAdapter().getItem(TOKEN_KEY);
    } else {
      throw error;
    }
  }
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as TokenBundle;
  } catch (error) {
    console.warn('Failed to parse token bundle', error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await storage.deleteItem(TOKEN_KEY);
  } catch (error) {
    if (error instanceof SecureStoreUnavailableError) {
      await localStorageAdapter().deleteItem(TOKEN_KEY);
    } else {
      throw error;
    }
  }
};

export const isTokenExpired = (token: TokenBundle | null): boolean => {
  if (!token) {
    return true;
  }
  const expirationMs = token.issuedAt + token.expiresIn * 1000 - 60 * 1000;
  return Date.now() >= expirationMs;
};

export type { TokenBundle };
