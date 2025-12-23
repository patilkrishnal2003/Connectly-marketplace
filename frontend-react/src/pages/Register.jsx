import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Sparkles } from "lucide-react";
import { AuthContext } from "../auth/AuthProvider";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
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
          <Link to="/login" className="text-sm font-medium text-primary hover:text-[hsl(var(--primary-dark))]">
            Back to login
          </Link>
        </header>

        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              Quick signup
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
            <p className="text-sm text-muted-foreground">Just the essentials to get started.</p>
          </div>

          {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
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

            <button className="btn-primary w-full py-3 text-base font-semibold">Create account</button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:text-[hsl(var(--primary-dark))]">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
