import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function DealDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, user } = useContext(AuthContext);
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
  const paymentGatewayBase = import.meta.env.VITE_PAYMENT_URL || "/payment";
  const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";
  const heroGradient = user ? "from-emerald-900 via-teal-900 to-sky-900" : "from-slate-900 via-indigo-900 to-purple-800";
  const pageBg = user ? "from-emerald-50 via-teal-50 to-sky-50" : "from-sky-50 via-slate-50 to-white";
  const footerGradient = user ? "from-emerald-900 via-teal-900 to-sky-900" : "from-slate-900 via-indigo-900 to-purple-800";

  const [deal, setDeal] = useState(location.state?.deal || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimStatus, setClaimStatus] = useState(null); // { status, message }
  const [claiming, setClaiming] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState("");
  const [planModal, setPlanModal] = useState({ open: false, required: "standard", message: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let ignore = false;
    async function loadDeal() {
      if (location.state?.deal) {
        setDeal(location.state.deal);
        setLoading(false);
        if (!location.state.deal.id || location.state.deal.id.startsWith("bf-")) return;
      }
      try {
        setLoading(true);
        const res = await authFetch(`/api/deals/${id}${userQuery}`);
        if (!res.ok) throw new Error("Failed to load deal");
        const data = await res.json();
        if (!ignore) {
          setDeal((prev) => ({ ...prev, ...data }));
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!ignore && !location.state?.deal) setError("Unable to load deal right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadDeal();
    return () => {
      ignore = true;
    };
  }, [id, userQuery, authFetch, location.state]);

  const defaultRedemptionLinks = {
    "bf-canva": "https://www.canva.com/",
    "canva pro": "https://www.canva.com/",
    "canva": "https://www.canva.com/"
  };
  function getRedemptionLink(d) {
    if (!d) return "";
    const idKey = (d.id || "").toLowerCase();
    const titleKey = (d.title || "").toLowerCase();
    const partnerKey = (d.partner || "").toLowerCase();
    if (d.link) return d.link;
    if (defaultRedemptionLinks[idKey]) return defaultRedemptionLinks[idKey];
    if (defaultRedemptionLinks[titleKey]) return defaultRedemptionLinks[titleKey];
    if (defaultRedemptionLinks[partnerKey]) return defaultRedemptionLinks[partnerKey];
    if (partnerKey) return `https://www.${partnerKey.replace(/\s+/g, "")}.com/`;
    return "";
  }

  const description =
    deal?.description ||
    deal?.longDescription ||
    "Access this partner service with exclusive perks for Connecttly members. Redeem to view full benefits and pricing.";

  const summaryPoints = [
    deal?.subtitle || deal?.partner || "Premium partner offer",
    "Instant redemption after unlock",
    "Support included with your plan"
  ];

  const normalizeTier = (value) => {
    const v = (value || "").toString().toLowerCase();
    if (!v) return null;
    if (["pro", "professional", "premium"].some((t) => v.includes(t))) return "professional";
    if (["standard", "basic", "starter"].some((t) => v.includes(t))) return "standard";
    return v;
  };

  const hasAccess = !!(deal?.isUnlocked || claimStatus?.status === "success");
  const redemptionLink = hasAccess ? getRedemptionLink(deal) : "";

  const maskedValue = (val = "") => {
    if (!val) return "";
    if (val.length <= 4) return "*".repeat(val.length);
    const head = val.slice(0, 3);
    const tail = val.slice(-3);
    return `${head}${"*".repeat(Math.max(1, val.length - 6))}${tail}`;
  };

  const maskedLink = (link = "") => {
    if (!link) return "";
    try {
      const u = new URL(link);
      const host = u.host;
      const path = u.pathname === "/" ? "" : u.pathname;
      return `${host}${path ? `${path.slice(0, 3)}***` : ""}`;
    } catch {
      return maskedValue(link);
    }
  };

  async function copyText(label, text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("copy failed", err);
    }
  }

  async function handleClaimClick() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!deal) {
      setClaimStatus({ status: "error", message: "Deal is still loading. Please try again." });
      return;
    }

    // Static showcase deals: unlock locally without hitting API
    if ((deal?.id || "").startsWith("bf-")) {
      setDeal((prev) => ({ ...(prev || {}), isUnlocked: true }));
      setClaimStatus({ status: "success", message: "Deal claimed successfully." });
      setShowCoupon(false);
      setShowLink(false);
      return;
    }

    // Pre-check subscription status
    try {
      const subRes = await authFetch("/api/auth/claim-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const subData = await subRes.json().catch(() => ({}));
      const activeSub = subRes.ok ? subData.subscription : null;
      const requiredTier = normalizeTier(deal?.tier || "standard");
      const userTier = normalizeTier(activeSub?.tier || activeSub?.planId || activeSub?.plan_id || activeSub?.serviceId || activeSub?.service_id);

      if (!activeSub) {
        setPlanModal({
          open: true,
          required: requiredTier || "standard",
          message: "You need an active plan to claim this deal."
        });
        return;
      }

      if (requiredTier === "professional" && userTier === "standard") {
        setPlanModal({
          open: true,
          required: "professional",
          message: "This perk requires the Professional plan."
        });
        return;
      }
    } catch (err) {
      console.error("claim-check failed", err);
      // Proceed to claim; backend will enforce again
    }

    setClaiming(true);
    setClaimStatus(null);
    try {
      const res = await authFetch(`/api/deals/${id}/claim`, { method: "POST" });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (res.status === 403) {
        if (data.reason === "plan_mismatch") {
          setPlanModal({
            open: true,
            required: "professional",
            message: "This perk needs the Professional plan."
          });
        } else {
          setPlanModal({
            open: true,
            required: normalizeTier(deal?.tier || "standard") || "standard",
            message: "You need an active plan to claim this deal."
          });
        }
        setClaimStatus(null);
        return;
      }

      if (!res.ok || data.ok === false) {
        const backendMessage = data.message || data.error;
        throw new Error(backendMessage || "claim_failed");
      }

      setDeal((prev) => ({ ...(prev || {}), ...(data.deal || {}), isUnlocked: true }));
      setClaimStatus({ status: "success", message: data.message || "Deal claimed successfully." });
      setShowCoupon(false);
      setShowLink(false);
    } catch (err) {
      console.error(err);
      setClaimStatus({ status: "error", message: err?.message || "Could not claim this deal. Please try again." });
    } finally {
      setClaiming(false);
    }
  }

  const claimDisabled = claiming || loading || !deal;

  const FieldRow = ({ label, value, revealed, onToggle, onCopy }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-mono text-sm shadow-sm hover:border-indigo-200"
            onClick={onToggle}
            title={revealed ? "Hide" : "Show"}
          >
            {revealed ? value : maskedValue(value)}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            onClick={() => onCopy(value)}
            title="Copy"
          >
            📋
          </button>
        </div>
      </div>
    );
  };

  const LinkRow = ({ label, value, revealed, onToggle, onCopy }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-mono text-sm shadow-sm hover:border-indigo-200 truncate"
            onClick={onToggle}
            title={revealed ? "Hide" : "Show"}
          >
            {revealed ? value : maskedLink(value)}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            onClick={() => onCopy(value)}
            title="Copy"
          >
            📋
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-b ${pageBg} text-slate-900`}>
        <header className={`bg-gradient-to-br ${heroGradient} text-white pb-16 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link to="/" className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold shadow hover:shadow-md">
              Marketplace
            </Link>
          </div>
          <div className="max-w-6xl mx-auto px-6">
            {loading ? (
              <div className="text-white/80">Loading deal...</div>
            ) : error ? (
              <div className="text-red-200">{error}</div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-semibold">
                    {(deal?.partner || deal?.title || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/60">Partner deal</p>
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">{deal?.title}</h1>
                    <p className="text-white/80 text-sm md:text-base">{deal?.subtitle || deal?.partner}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">
                    {hasAccess ? "Unlocked" : "Locked - claim required"}
                  </span>
                  {deal?.tier && (
                    <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">
                      Tier: {(deal.tier || "").toString().toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {!hasAccess && (
                    <button
                      type="button"
                      onClick={handleClaimClick}
                      className="px-5 py-3 rounded-xl bg-white text-indigo-900 font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                      disabled={claimDisabled}
                    >
                      {claiming ? "Claiming..." : "Claim this deal"}
                    </button>
                  )}
                  {hasAccess && (
                    <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white text-sm">
                      Deal unlocked. Use the details below.
                    </div>
                  )}
                </div>
                {claimStatus && (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      claimStatus.status === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : claimStatus.status === "blocked"
                        ? "bg-amber-50 border-amber-100 text-amber-800"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}
                  >
                    <div className="font-semibold">{claimStatus.message}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          <section
            className="border border-slate-200 rounded-3xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
            style={{
              background: user ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))" : "#ffffff"
            }}
          >
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">Overview</p>
              <h2 className="text-2xl font-semibold text-slate-900">What this deal includes</h2>
              <p className="text-slate-600">{description}</p>
              <div className="space-y-2">
                {summaryPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {hasAccess && (
                <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">Your perk details</p>
                  <FieldRow
                    label="Coupon"
                    value={deal?.coupon_code || ""}
                    revealed={showCoupon}
                    onToggle={() => setShowCoupon((v) => !v)}
                    onCopy={(val) => copyText("coupon", val)}
                  />
                  <LinkRow
                    label="Redemption link"
                    value={redemptionLink}
                    revealed={showLink}
                    onToggle={() => setShowLink((v) => !v)}
                    onCopy={(val) => copyText("link", val)}
                  />
                  {copied && <div className="text-xs text-emerald-600">Copied {copied} to clipboard.</div>}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm uppercase tracking-wide text-slate-500">Status</p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  hasAccess ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {hasAccess ? "Unlocked" : "Locked"}
              </span>
              <div className="text-sm text-slate-600">{hasAccess ? "Use the coupon or link below." : "Claim to unlock your plan’s perks."}</div>
              {deal?.tier && <div className="text-sm text-slate-600">Tier required: {deal.tier}</div>}
            </div>
          </section>
        </main>

        {planModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Subscription required</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {planModal.required === "professional" ? "Upgrade to Professional" : "Choose a plan to continue"}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1">{planModal.message || "Select a plan to unlock this perk."}</p>
                </div>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800"
                  onClick={() => setPlanModal({ open: false, required: "standard", message: "" })}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 text-left shadow-sm hover:border-indigo-200 ${
                    planModal.required === "standard" ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                  onClick={() => {
                    const target = `${paymentGatewayBase}?planId=standard`;
                    window.open(target, "_blank", "noreferrer");
                  }}
                >
                  <div className="font-semibold text-slate-900">Starter / Standard</div>
                  <div className="text-sm text-slate-600">Unlock standard-tier perks.</div>
                </button>
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 text-left shadow-sm hover:border-indigo-200 ${
                    planModal.required === "professional" ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                  onClick={() => {
                    const target = `${paymentGatewayBase}?planId=professional`;
                    window.open(target, "_blank", "noreferrer");
                  }}
                >
                  <div className="font-semibold text-slate-900">Professional</div>
                  <div className="text-sm text-slate-600">Access all perks, including professional-only deals.</div>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                You will be redirected to the payment page; your subscription activates after payment succeeds.
              </p>
            </div>
          </div>
        )}

        <footer className={`bg-gradient-to-r ${footerGradient} text-white transition-colors`}>
          <div className="max-w-6xl mx-auto px-6 py-14 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <p className="text-3xl md:text-4xl font-semibold leading-snug">Experience Connecttly for your use case</p>
                <p className="text-white/70 text-sm md:text-base max-w-xl">
                  Explore partner perks, or talk to us about curating a marketplace for your community.
                </p>
              </div>
              <a
                href="https://connecttly.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-rose-200 text-black font-semibold shadow hover:shadow-lg"
              >
                Book a demo
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wide text-white/60">Explore</h4>
                <div className="flex flex-col gap-2 text-white/80 text-sm">
                  <Link to="/" className="hover:text-white">
                    Home
                  </Link>
                  <a href="#deals" className="hover:text-white">
                    Marketplace
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wide text-white/60">Account</h4>
                <div className="flex flex-col gap-2 text-white/80 text-sm">
                  <Link to="/login" className="hover:text-white">
                    Log in
                  </Link>
                  <Link to="/register" className="hover:text-white">
                    Register
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wide text-white/60">Company</h4>
                <div className="flex flex-col gap-2 text-white/80 text-sm">
                  <a href="https://connecttly.com/privacy" target="_blank" rel="noreferrer" className="hover:text-white">
                    Privacy Policy
                  </a>
                  <a href="https://connecttly.com/terms" target="_blank" rel="noreferrer" className="hover:text-white">
                    Terms &amp; Conditions
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-white/60 text-sm border-t border-white/10 pt-6">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold">C</span>
                <span>Connecttly Marketplace</span>
              </div>
              <span className="text-white/50">Built for startup perks and partner offers</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
