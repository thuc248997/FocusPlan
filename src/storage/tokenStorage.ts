import * as SecureStore from 'expo-secure-store';

type TokenBundle = {
  accessToken: string;
  expiresIn: number;
  issuedAt: number;
  scope?: string;
  tokenType?: string;
};

const TOKEN_KEY = 'focusplan.google-token';

export const saveToken = async (token: TokenBundle): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(token));
};

export const retrieveToken = async (): Promise<TokenBundle | null> => {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
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
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const isTokenExpired = (token: TokenBundle | null): boolean => {
  if (!token) {
    return true;
  }
  const expirationMs = token.issuedAt + token.expiresIn * 1000 - 60 * 1000;
  return Date.now() >= expirationMs;
};

export type { TokenBundle };
