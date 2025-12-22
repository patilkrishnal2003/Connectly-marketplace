import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Users, Mail, Lock } from "lucide-react";
import { AuthContext } from "../auth/AuthProvider";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const perks = [
    {
      title: "Curated savings",
      desc: "Hand-picked partner perks aligned to your business stage.",
      icon: <Sparkles className="h-5 w-5 text-primary" />
    },
    {
      title: "Team ready",
      desc: "Invite teammates and manage roles from day one.",
      icon: <Users className="h-5 w-5 text-primary" />
    },
    {
      title: "Protected access",
      desc: "SSO-friendly authentication with encrypted sessions.",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />
    }
  ];

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, name, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || data.message || "Registration failed");
      if (!data.token) return setError("Registration succeeded but no token received.");
      setToken(data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Registration error, see console");
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-indigo-50 text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
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
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-ghost text-sm font-medium px-3 py-2">
              Home
            </Link>
            <Link to="/login" className="text-sm font-medium text-primary hover:text-[hsl(var(--primary-dark))]">
              Already a member? Log in
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Get started in minutes
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900">Create your Connecttly account</h1>
              <p className="text-base text-muted-foreground max-w-xl">
                Unlock partner deals, manage your team, and track the perks that fuel your next milestones.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {perks.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur border border-border p-4 shadow-sm">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">{item.icon}</div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="relative bg-white/90 backdrop-blur border border-border shadow-lg shadow-primary/5 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Create account</h2>
                <p className="text-sm text-muted-foreground">Use your work email to get personalized deals.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Secure signup
              </div>
            </div>

            {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground" htmlFor="name">
                Full name
                <div className="relative mt-1">
                  <input
                    id="name"
                    className="admin-input ps-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Taylor Patel"
                    autoComplete="name"
                    required
                  />
                  <Sparkles className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </label>
              <label className="block text-sm font-medium text-foreground" htmlFor="email">
                Work email
                <div className="relative mt-1">
                  <input
                    id="email"
                    className="admin-input ps-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
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
                    className="admin-input ps-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </label>
            </div>

            <button className="btn-primary w-full py-3 text-base font-semibold">Create account</button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:text-[hsl(var(--primary-dark))]">
                Log in instead
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
