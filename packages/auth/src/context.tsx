import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import type { User } from "@modulus/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (token: string, user: User) => void;
  logout: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  const login = useCallback((token: string, user: User) => {
    setState({ user, token, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

// ─── Token ref hook (for API calls without re-render) ─────────────────────────

export function useAuthToken(): React.MutableRefObject<string | null> {
  const { token } = useAuth();
  const ref = useRef<string | null>(token);
  ref.current = token;
  return ref;
}
