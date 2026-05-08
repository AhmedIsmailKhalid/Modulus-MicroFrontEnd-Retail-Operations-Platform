import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@modulus/ui";

import { useAuthStore } from "../store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<FormState & { general: string }>;

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate  = useNavigate();
  const login     = useAuthStore((s) => s.login);

  const [form, setForm]     = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.email.trim())    next.email    = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setErrors({ general: data.error ?? "Login failed. Please try again." });
        return;
      }

      const data = await res.json() as { token: string; user: Parameters<typeof login>[1] };
      login(data.token, data.user);
      void navigate("/inventory");
    } catch {
      setErrors({ general: "Unable to connect. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 px-4"
      data-testid="login-page"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Modulus</h1>
          <p className="mt-1 text-sm text-slate-400">Retail Operations Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-lg font-semibold text-white">Sign in to your account</h2>

          <form onSubmit={(e) => { void handleSubmit(e); }} data-testid="login-form" noValidate>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); }}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ops@modulus.com"
                  data-testid="login-email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); }}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                  data-testid="login-password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {errors.general && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="mt-2 w-full"
                data-testid="login-submit"
              >
                Sign in
              </Button>
            </div>
          </form>

          {/* Dev credentials hint */}
          <div className="mt-6 rounded-lg border border-slate-600 bg-slate-700/50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-400">Demo credentials</p>
            <div className="flex flex-col gap-1 text-xs text-slate-300">
              <span>ops@modulus.com · password123</span>
              <span>inventory@modulus.com · password123</span>
              <span>orders@modulus.com · password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
