// ============================================================
//  client/src/Api/auth.ts
//  Matches the exact pattern of the existing API files
// ============================================================
 
import { VITE_BASE_URL } from "@/Utils/urls";
import type { LoginPayload, SignupPayload, TokenResponse, User } from "@shared/schema";
 
export const apiLogin = async (payload: LoginPayload): Promise<TokenResponse> => {
  const res = await fetch(`${VITE_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
};
 
export const apiSignup = async (payload: SignupPayload): Promise<TokenResponse> => {
  const res = await fetch(`${VITE_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Signup failed");
  }
  return res.json();
};
 
export const apiGetMe = async (token: string): Promise<User> => {
  const res = await fetch(`${VITE_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json();
};
 