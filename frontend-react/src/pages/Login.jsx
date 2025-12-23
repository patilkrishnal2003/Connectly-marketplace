import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { AuthContext } from "../auth/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error || "login_failed");
      setToken(json.token);
      // redirect to admin if admin, else homepage
      const payload = JSON.parse(atob(json.token.split(".")[1]));
      if (payload.role === "admin") navigate("/admin");
      else navigate("/");
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-white text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-sm">
              C
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connecttly</p>
              <p className="text-sm font-semibold text-foreground">Marketplace</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-foreground border border-border rounded-lg px-3 py-2 hover:border-primary/50 hover:text-primary"
            >
              Home
            </Link>
            <Link to="/register" className="text-sm font-medium text-primary hover:text-[hsl(var(--primary-dark))]">
              Create account
            </Link>
          </div>
        </header>

        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Secure login
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in with your email to continue.</p>
          </div>

          {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-foreground" htmlFor="email">
              Email
              <div className="relative mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input ps-10"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </label>
            <label className="block text-sm font-medium text-foreground" htmlFor="password">
              Password
              <div className="relative mt-1">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input ps-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </label>

            <button className="btn-primary w-full py-3 text-base font-semibold">Login</button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:text-[hsl(var(--primary-dark))]">
              Register instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
