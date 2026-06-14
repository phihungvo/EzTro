import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSession } from '../types';

const SESSION_KEY = 'ez_tro.auth_session';

export async function getStoredSession() {
  const rawSession =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function setStoredSession(session: AuthSession) {
  const rawSession = JSON.stringify(session);

  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, rawSession);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, rawSession);
}

export async function clearStoredSession() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
