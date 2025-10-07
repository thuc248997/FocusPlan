import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
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
  googleRedirectUri?: string;
  googleRedirectUris?: Record<string, string | undefined> & {
    local?: string;
    production?: string;
  };
};

const scopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.events'
];

const sanitize = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const extractExtraConfig = (): ExtraConfig => {
  const fromExpoConfig = Constants.expoConfig?.extra;
  if (fromExpoConfig && typeof fromExpoConfig === 'object') {
    return fromExpoConfig as ExtraConfig;
  }
  const manifest = Constants.manifest;
  if (manifest && typeof manifest === 'object' && 'extra' in manifest) {
    return (manifest as { extra?: ExtraConfig }).extra ?? {};
  }
  if (typeof manifest === 'string') {
    try {
      const parsed = JSON.parse(manifest);
      if (parsed && typeof parsed === 'object' && 'extra' in parsed) {
        return (parsed.extra as ExtraConfig) ?? {};
      }
    } catch (error) {
      console.warn('Failed to parse Constants.manifest while resolving extra config', error);
    }
  }
  return {};
};

export const useGoogleAuth = () => {
  const extra = extractExtraConfig();
  const env =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

  const envClientIds = useMemo(
    () => ({
      expo: sanitize(env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? env.GOOGLE_EXPO_CLIENT_ID),
      web: sanitize(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? env.GOOGLE_WEB_CLIENT_ID),
      ios: sanitize(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? env.GOOGLE_IOS_CLIENT_ID),
      android: sanitize(env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? env.GOOGLE_ANDROID_CLIENT_ID)
    }),
    [
      env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      env.GOOGLE_ANDROID_CLIENT_ID,
      env.GOOGLE_EXPO_CLIENT_ID,
      env.GOOGLE_IOS_CLIENT_ID,
      env.GOOGLE_WEB_CLIENT_ID
    ]
  );

  const clientIds = useMemo(
    () => ({
      expo: sanitize(extra.googleExpoClientId) ?? envClientIds.expo,
      web: sanitize(extra.googleWebClientId) ?? envClientIds.web,
      ios: sanitize(extra.googleIOSClientId) ?? envClientIds.ios,
      android: sanitize(extra.googleAndroidClientId) ?? envClientIds.android
    }),
    [
      envClientIds.android,
      envClientIds.expo,
      envClientIds.ios,
      envClientIds.web,
      extra.googleAndroidClientId,
      extra.googleExpoClientId,
      extra.googleIOSClientId,
      extra.googleWebClientId
    ]
  );

  const useProxy = Platform.select({ web: false, default: true }) ?? true;
  const redirectUri = useMemo(() => {
    const prefer = (...values: (string | undefined)[]) =>
      values
        .map((value) => value?.trim())
        .find((value): value is string => Boolean(value));
    const redirectCandidates = Object.values(extra.googleRedirectUris ?? {}) as (
      | string
      | undefined
    )[];
    const candidate = prefer(
      extra.googleRedirectUri,
      extra.googleRedirectUris?.production,
      extra.googleRedirectUris?.local,
      ...redirectCandidates
    );
    return candidate ?? makeRedirectUri({ preferLocalhost: true, scheme: 'focusplan' });
  }, [extra.googleRedirectUri, extra.googleRedirectUris]);

  const { web: webClientId, expo: expoClientId, ios: iosClientId, android: androidClientId } = clientIds;

  useEffect(() => {
    console.debug('Resolved Google client IDs', {
      extra,
      envClientIds,
      clientIds
    });
  }, [clientIds, envClientIds, extra]);

  const fallbackClientId = useMemo(
    () => webClientId ?? expoClientId ?? iosClientId ?? androidClientId ?? 'missing-client-id',
    [androidClientId, expoClientId, iosClientId, webClientId]
  );

  const missingClientConfig = fallbackClientId === 'missing-client-id';

  useEffect(() => {
    if (missingClientConfig) {
      console.error(
        'Google OAuth client ID missing. Set GOOGLE_WEB_CLIENT_ID (or the platform-specific variant) in your app config.'
      );
    } else if (Platform.OS === 'web' && !webClientId) {
      console.warn(
        'Google web client ID is not configured. Falling back to a different client ID, which may fail at runtime.'
      );
    }
  }, [missingClientConfig, webClientId]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: fallbackClientId,
    expoClientId,
    webClientId: webClientId ?? fallbackClientId,
    iosClientId,
    androidClientId,
    redirectUri,
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
    if (response?.type !== 'success') {
      return;
    }
    const auth = response.authentication;
    const params = response.params ?? {};
    const accessToken =
      auth?.accessToken ?? (typeof params.access_token === 'string' ? params.access_token : undefined);
    if (!accessToken) {
      return;
    }
    const expiresInSource = auth?.expiresIn ?? Number(params.expires_in ?? NaN);
    const issuedAtSource = auth?.issuedAt ?? Date.now();
    const issuedAt = issuedAtSource > 1e12 ? issuedAtSource : issuedAtSource * 1000;
    const payload: TokenBundle = {
      accessToken,
      expiresIn: Number.isFinite(expiresInSource) ? Number(expiresInSource) : 3600,
      issuedAt,
      scope: auth?.scope ?? params.scope,
      tokenType: auth?.tokenType ?? params.token_type
    };
    setToken(payload);
    saveToken(payload).catch((error) =>
      console.warn('Failed to persist Google token', error)
    );
    WebBrowser.dismissBrowser?.();
  }, [response]);

  const connect = useCallback(async () => {
    if (missingClientConfig) {
      throw new Error(
        'Google OAuth client ID missing. Set GOOGLE_WEB_CLIENT_ID (or a platform-specific equivalent) before trying to connect.'
      );
    }
    if (!request) {
      throw new Error('Google authentication is not ready yet. Try again.');
    }
    const result = await promptAsync({
      showInRecents: true
    });
    if (result?.type !== 'success') {
      throw new Error('Google sign-in was cancelled.');
    }
  }, [missingClientConfig, promptAsync, request]);

  const waitForFreshToken = useCallback(async () => {
    const ATTEMPTS = 10;
    for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
      const updated = await retrieveToken();
      if (updated && !isTokenExpired(updated)) {
        setToken(updated);
        return updated;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return null;
  }, []);

  const ensureAuthenticated = useCallback(async () => {
    // Check current token in state
    if (token && !isTokenExpired(token)) {
      console.log('Using existing valid token from state');
      return token;
    }
    
    // Check stored token
    const stored = await retrieveToken();
    if (stored && !isTokenExpired(stored)) {
      console.log('Using valid token from storage');
      setToken(stored);
      return stored;
    }
    
    // Token expired or missing - need to re-authenticate
    console.log('Token expired or missing, initiating OAuth flow');
    await connect();
    
    // Wait for new token
    const updated = await waitForFreshToken();
    if (!updated || isTokenExpired(updated)) {
      throw new Error('Unable to obtain Google credentials. Please try signing in again.');
    }
    
    console.log('Successfully obtained fresh Google token');
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
      disconnect,
      missingClientConfig
    }),
    [connect, disconnect, ensureAuthenticated, initializing, missingClientConfig, token]
  );

  return value;
};
