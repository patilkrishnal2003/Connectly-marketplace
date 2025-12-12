import React, { useContext, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
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
      const redirectTo = location.state?.redirectTo;
      const pendingClaimDealId = location.state?.pendingClaimDealId;
      if (pendingClaimDealId) sessionStorage.setItem("pendingClaimDealId", pendingClaimDealId);

      if (redirectTo) {
        navigate(redirectTo, { replace: true, state: location.state });
      } else if (payload.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-10 shadow-2xl space-y-6">
          <p className="text-sm uppercase tracking-wide text-white/70">Connecttly Marketplace</p>
          <h1 className="text-3xl font-bold leading-tight">Welcome back. Unlock partner perks faster.</h1>
          <p className="text-white/70 text-sm">
            Sign in to manage deals, unlock coupons, and access the admin console if you have permissions.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/80">
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Secure admin access</span>
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Curated partner perks</span>
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Lightning checkout</span>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white border border-slate-200 shadow-lg rounded-3xl p-8 space-y-6 flex flex-col justify-center"
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Log in</h2>
            <p className="text-sm text-slate-500">Access your perks and admin dashboard.</p>
          </div>
          {error && <div className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50"
              />
            </label>
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition">
            Login
          </button>
          <div className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
