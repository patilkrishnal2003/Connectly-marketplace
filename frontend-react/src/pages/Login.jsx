import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { AuthContext } from "../auth/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const highlights = [
    {
      title: "Secure access",
      desc: "SSO-ready authentication and admin controls.",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />
    },
    {
      title: "Faster unlocks",
      desc: "Pick up where you left off on pending deals.",
      icon: <Sparkles className="h-5 w-5 text-primary" />
    },
    {
      title: "Protected data",
      desc: "Encrypted sessions and privacy-first defaults.",
      icon: <Lock className="h-5 w-5 text-primary" />
    }
  ];

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
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-indigo-50 text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-glow">
              C
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connecttly</p>
              <p className="text-base font-semibold text-foreground">Marketplace</p>
            </div>
          </Link>
          <Link to="/register" className="text-sm font-medium text-primary hover:text-[hsl(var(--primary-dark))]">
            New here? Create an account
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Member access
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900">Log in to keep unlocking Connecttly perks</h1>
              <p className="text-base text-muted-foreground max-w-xl">
                Rejoin the marketplace experience with your saved preferences, deal progress, and admin controls in one place.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur border border-border p-4 shadow-sm">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">{item.icon}</div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              SOC2-aligned safeguards with session encryption.
            </div>
          </div>

          <form
            onSubmit={submit}
            className="relative bg-white/90 backdrop-blur border border-border shadow-lg shadow-primary/5 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Log in with your email to access deals and admin tools.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Secure login
              </div>
            </div>

            {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground" htmlFor="email">
                Email
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input mt-1"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-foreground" htmlFor="password">
                Password
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input mt-1"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            <button className="btn-primary w-full py-3 text-base font-semibold">
              Login
            </button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:text-[hsl(var(--primary-dark))]">
                Register instead
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
