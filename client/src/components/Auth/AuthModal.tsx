// ============================================================
//  client/src/components/Auth/AuthModal.tsx
//  Single modal that toggles between Login and Signup
//  Uses shadcn Dialog + your existing Tailwind classes
// ============================================================

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { LoginPayload, SignupPayload } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);

  // ── Login form state ────────────────────────────────────────
  const [loginForm, setLoginForm] = useState<LoginPayload>({
    email: "", password: "",
  });

  // ── Signup form state ───────────────────────────────────────
  const [signupForm, setSignupForm] = useState<SignupPayload>({
    full_name: "", email: "", phone: "",
    password: "", role: "buyer", consent: false,
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      toast({ title: "Welcome back!", description: "You are now logged in." });
      onClose();
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.consent) {
      toast({ title: "Please accept the terms", variant: "destructive" });
      return;
    }
    try {
      await signup(signupForm);
      toast({ title: "Account created!", description: "You are now logged in." });
      onClose();
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {tab === "login" ? "Sign in to PropClue" : "Create your account"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              tab === "login"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("login")}
          >
            Log in
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              tab === "signup"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signup")}
          >
            Sign up
          </button>
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setTab("signup")}
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                placeholder="John Doe"
                value={signupForm.full_name}
                onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-phone">Phone (optional)</Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={signupForm.phone ?? ""}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {/* Role selector */}
            <div className="space-y-1">
              <Label>I am a</Label>
              <div className="flex gap-2">
                {(["buyer", "seller", "both"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, role: r })}
                    className={`flex-1 py-1.5 rounded-md text-sm border transition-colors capitalize ${
                      signupForm.role === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={signupForm.consent}
                onChange={(e) => setSignupForm({ ...signupForm, consent: e.target.checked })}
              />
              <span className="text-sm text-muted-foreground">
                I agree to the{" "}
                <a href="/terms" className="text-primary underline" target="_blank">
                  Terms of Service
                </a>{" "}
                and consent to data processing
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setTab("login")}
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}