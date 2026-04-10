// client/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { VITE_BASE_URL } from "@/Utils/urls";
import type { User, TokenResponse, SignupPayload, LoginPayload } from "@shared/schema";

const LS_TOKEN_KEY = "propclue_token";
const LS_USER_KEY  = "propclue_user";

interface AuthContextValue {
  user:           User | null;
  token:          string | null;
  isLoggedIn:     boolean;
  isLoading:      boolean;
  authModalOpen:  boolean;
  openAuthModal:  () => void;
  closeAuthModal: () => void;
  login:          (payload: LoginPayload)  => Promise<void>;
  signup:         (payload: SignupPayload) => Promise<void>;
  logout:         () => void;
  authHeader:     () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, isLoggedIn: false, isLoading: false,
  authModalOpen: false, openAuthModal: () => {}, closeAuthModal: () => {},
  login: async () => {}, signup: async () => {}, logout: () => {}, authHeader: () => ({}),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token,         setToken]         = useState<string | null>(() => localStorage.getItem(LS_TOKEN_KEY));
  const [user,          setUser]          = useState<User | null>(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading,     setIsLoading]     = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isLoggedIn    = !!token && !!user;
  const openAuthModal  = useCallback(() => setAuthModalOpen(true),  []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  const authHeader     = useCallback(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  const persist = useCallback((tok: string, u: User) => {
    localStorage.setItem(LS_TOKEN_KEY, tok);
    localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
    setToken(tok);
    setUser(u);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${VITE_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: User) => { setUser(data); localStorage.setItem(LS_USER_KEY, JSON.stringify(data)); })
      .catch(() => {
        localStorage.removeItem(LS_TOKEN_KEY);
        localStorage.removeItem(LS_USER_KEY);
        setToken(null); setUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${VITE_BASE_URL}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Login failed"); }
      const data: TokenResponse = await res.json();
      persist(data.access_token, { id: data.user_id, full_name: data.full_name, email: payload.email, role: data.role as User["role"] });
    } finally { setIsLoading(false); }
  }, [persist]);

  const signup = useCallback(async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${VITE_BASE_URL}/api/auth/signup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Signup failed"); }
      const data: TokenResponse = await res.json();
      persist(data.access_token, { id: data.user_id, full_name: data.full_name, email: payload.email, role: data.role as User["role"] });
    } finally { setIsLoading(false); }
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setToken(null); setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoggedIn, isLoading,
      authModalOpen, openAuthModal, closeAuthModal,
      login, signup, logout, authHeader,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }