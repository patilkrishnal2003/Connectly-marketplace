import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-10 shadow-2xl space-y-6">
          <p className="text-sm uppercase tracking-wide text-white/70">Connecttly Marketplace</p>
          <h1 className="text-3xl font-bold leading-tight">Join the marketplace and unlock perks.</h1>
          <p className="text-white/70 text-sm">
            Create your account to access partner coupons and request new deals for your team.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/80">
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Curated partner perks</span>
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Admin-ready access</span>
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Secure onboarding</span>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white border border-slate-200 shadow-lg rounded-3xl p-8 space-y-6 flex flex-col justify-center"
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Create account</h2>
            <p className="text-sm text-slate-500">Start using partner deals in minutes.</p>
          </div>
          {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition">
            Register
          </button>
          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
