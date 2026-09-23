import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';
import { tokenStore } from '../api/apiClient.js';
import { STORAGE_KEYS } from '../utils/constants.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(true);

  const persist = useCallback((nextUser, tokens) => {
    if (tokens) tokenStore.set(tokens);
    if (nextUser) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!tokenStore.access) {
        setInitializing(false);
        return;
      }
      try {
        const current = await authApi.getCurrentUser();
        if (active) persist(current);
      } catch {
        if (active) logout();
      } finally {
        if (active) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [persist, logout]);

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener('pdm:session-expired', onExpired);
    return () => window.removeEventListener('pdm:session-expired', onExpired);
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      const { user: nextUser, access, refresh } = await authApi.login(credentials);
      persist(nextUser, { access, refresh });
      return nextUser;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const { user: nextUser, access, refresh } = await authApi.register(payload);
      persist(nextUser, { access, refresh });
      return nextUser;
    },
    [persist]
  );

  const getCurrentUser = useCallback(async () => {
    const current = await authApi.getCurrentUser();
    persist(current);
    return current;
  }, [persist]);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), initializing, login, register, logout, getCurrentUser }),
    [user, initializing, login, register, logout, getCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
