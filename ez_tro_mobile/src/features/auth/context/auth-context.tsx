import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { login as loginRequest, logout as logoutRequest } from '../api/auth-service';
import { clearStoredSession, getStoredSession, setStoredSession } from '../storage/token-storage';
import type { AuthSession, LoginPayload } from '../types';

type AuthContextValue = {
  errorMessage: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  session: AuthSession | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getStoredSession()
      .then((storedSession) => {
        if (mounted) {
          setSession(storedSession);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const nextSession = await loginRequest(payload);
      await setStoredSession(nextSession);
      setSession(nextSession);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;
    setSession(null);
    await clearStoredSession();

    if (token) {
      logoutRequest(token).catch(() => undefined);
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      errorMessage,
      isLoading,
      isSubmitting,
      login,
      logout,
      session,
    }),
    [errorMessage, isLoading, isSubmitting, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
