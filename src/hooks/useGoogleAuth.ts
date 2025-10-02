import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import {
  clearToken,
  isTokenExpired,
  retrieveToken,
  saveToken,
  type TokenBundle
} from '../storage/tokenStorage';

WebBrowser.maybeCompleteAuthSession();

type ExtraConfig = {
  googleWebClientId?: string;
  googleAndroidClientId?: string;
  googleIOSClientId?: string;
  googleExpoClientId?: string;
};

const scopes = [
  'openid',
  'profile',
  'https://www.googleapis.com/auth/calendar.events'
];

export const useGoogleAuth = () => {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as ExtraConfig;

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: extra.googleExpoClientId,
    webClientId: extra.googleWebClientId,
    iosClientId: extra.googleIOSClientId,
    androidClientId: extra.googleAndroidClientId,
    scopes,
    selectAccount: true
  });

  const [token, setToken] = useState<TokenBundle | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await retrieveToken();
      if (stored && !isTokenExpired(stored)) {
        setToken(stored);
      }
      setInitializing(false);
    };
    hydrate().catch((error) => {
      console.warn('Failed to hydrate token from storage', error);
      setInitializing(false);
    });
  }, []);

  useEffect(() => {
    const auth = response?.authentication;
    if (response?.type === 'success' && auth?.accessToken) {
      const payload: TokenBundle = {
        accessToken: auth.accessToken,
        expiresIn: auth.expiresIn ?? 3600,
        issuedAt: auth.issuedAt ?? Date.now(),
        scope: auth.scope,
        tokenType: auth.tokenType
      };
      setToken(payload);
      saveToken(payload).catch((error) =>
        console.warn('Failed to persist Google token', error)
      );
    }
  }, [response]);

  const connect = useCallback(async () => {
    if (!request) {
      throw new Error('Google authentication is not ready yet. Try again.');
    }
    const result = await promptAsync({
      showInRecents: true,
      useProxy: Platform.select({ web: false, default: true })
    });
    if (result?.type !== 'success') {
      throw new Error('Google sign-in was cancelled.');
    }
  }, [promptAsync, request]);

  const waitForFreshToken = useCallback(async () => {
    const ATTEMPTS = 5;
    for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
      const updated = await retrieveToken();
      if (updated && !isTokenExpired(updated)) {
        setToken(updated);
        return updated;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return null;
  }, []);

  const ensureAuthenticated = useCallback(async () => {
    if (token && !isTokenExpired(token)) {
      return token;
    }
    const stored = await retrieveToken();
    if (stored && !isTokenExpired(stored)) {
      setToken(stored);
      return stored;
    }
    await connect();
    const updated = await waitForFreshToken();
    if (!updated || isTokenExpired(updated)) {
      throw new Error('Unable to obtain Google credentials.');
    }
    return updated;
  }, [connect, token, waitForFreshToken]);

  const disconnect = useCallback(async () => {
    await clearToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token) && !isTokenExpired(token),
      initializing,
      connect,
      ensureAuthenticated,
      disconnect
    }),
    [connect, disconnect, ensureAuthenticated, initializing, token]
  );

  return value;
};
