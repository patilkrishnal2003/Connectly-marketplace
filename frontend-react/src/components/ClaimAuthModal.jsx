import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/auth/AuthProvider";

const API_PATHS = {
  login: "/api/auth/login",
  register: "/api/auth/register"
};

export default function ClaimAuthModal({ isOpen, initialMode = "login", onClose, onAuthenticated }) {
  const { setToken } = useContext(AuthContext);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setForm({ email: "", password: "", name: "" });
      setError("");
      setSuccessMessage("");
    }
  }, [initialMode, isOpen]);

  const title = mode === "login" ? "Sign in to continue" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Log in to continue your action. We'll return you right where you left off."
      : "Create a Connecttly account and unlock partner perks instantly.";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password || (mode === "register" && !form.name)) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const payload =
        mode === "login"
          ? { email: form.email.trim().toLowerCase(), password: form.password }
          : { email: form.email.trim().toLowerCase(), password: form.password, name: form.name };
      const res = await fetch(API_PATHS[mode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json?.error || json?.message || "Authentication failed";
        if (mode === "login" && /not.*found|no.*account|register/i.test(message)) {
          setMode("register");
          setError("We couldn't find that email. Let us create an account for you.");
        } else {
          setError(message);
        }
        return;
      }
      if (!json?.token) {
        setError("Authentication succeeded but no token was returned.");
        return;
      }
      setToken(json.token);
      setSuccessMessage("You are logged in. Redirecting...");
      onAuthenticated?.();
    } catch (err) {
      console.error("Auth modal error", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  };

  const memoizedModeLabel = useMemo(() => (mode === "login" ? "Create account" : "Already have an account?"), [mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
          onClick={onClose}
        >
          Close
        </button>
        <div className="px-8 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connecttly</p>
            <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Your team or personal name"
                  required
                />
              </label>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="team@startup.com"
                type="email"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="••••••••"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#5f3dc4] to-[#a855f7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {mode === "login" ? (loading ? "Signing in..." : "Sign in") : loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="text-center text-sm text-slate-500">
            <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-700" onClick={toggleMode}>
              {memoizedModeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
