import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function DealDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, user } = useContext(AuthContext);
  const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";
  const heroGradient = user ? "from-emerald-900 via-teal-900 to-sky-900" : "from-slate-900 via-indigo-900 to-purple-800";
  const pageBg = user ? "from-emerald-50 via-teal-50 to-sky-50" : "from-sky-50 via-slate-50 to-white";
  const footerGradient = user ? "from-emerald-900 via-teal-900 to-sky-900" : "from-slate-900 via-indigo-900 to-purple-800";

  const [deal, setDeal] = useState(location.state?.deal || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimResult, setClaimResult] = useState(null);
  const [claiming, setClaiming] = useState(false);

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
        if (!ignore && !location.state?.deal) {
          setError("Unable to load deal right now.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadDeal();
    return () => {
      ignore = true;
    };
  }, [id, userQuery, authFetch, location.state]);

  async function handleClaimClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!deal) {
      setClaimResult({ status: "error", message: "Deal is still loading. Please try again in a moment." });
      return;
    }

    // Static Black Friday / showcase deals don't exist in the backend. Treat them as
    // instantly unlocked so the CTA works without hitting the claim API and failing
    // with a 404.
    if ((deal?.id || "").startsWith("bf-")) {
      setDeal((prev) => ({ ...(prev || {}), isUnlocked: true }));
      setClaimResult({ status: "success", reason: "exception", message: "Deal claimed successfully." });
      return;
    }

    setClaiming(true);
    setClaimResult(null);
    try {
      const res = await authFetch(`/api/deals/${id}/claim`, { method: "POST" });
      const data = await res.json();
      if (res.status === 403) {
        setClaimResult({
          status: "blocked",
          reason: data.reason,
          message:
            data.message ||
            (data.reason === "plan_mismatch"
              ? "This deal is only available on a higher plan."
              : "You need an active subscription to claim this deal.")
        });
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "claim_failed");
      }
      setDeal((prev) => ({ ...(prev || {}), ...(data.deal || {}), isUnlocked: true }));
      setClaimResult({
        status: "success",
        reason: data.claim?.reason || "ok",
        message: "Deal claimed successfully."
      });
    } catch (err) {
      console.error(err);
      setClaimResult({ status: "error", message: "Could not claim this deal. Please try again." });
    } finally {
      setClaiming(false);
    }
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

  const hasAccess = claimResult?.status === "success" || (deal?.isUnlocked && claimResult?.status !== "blocked");
  const redemptionLink = hasAccess ? getRedemptionLink(deal) : "";

  const claimDisabled = claiming || loading || !deal;

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-b ${pageBg} text-slate-900`}>
        <header className={`bg-gradient-to-br ${heroGradient} text-white pb-16 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm underline">
              Back
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold shadow hover:shadow-md"
            >
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
                  <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">Click to redeem after claim</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleClaimClick}
                    className="px-5 py-3 rounded-xl bg-white text-indigo-900 font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                    disabled={claimDisabled}
                  >
                    {claiming ? "Claiming..." : loading || !deal ? "Loading..." : "Claim this deal"}
                  </button>
                  {hasAccess && redemptionLink && (
                    <a
                      href={redemptionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600"
                    >
                      Redeem offer
                    </a>
                  )}
                </div>
                {claimResult && (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      claimResult.status === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : claimResult.status === "blocked"
                        ? "bg-amber-50 border-amber-100 text-amber-800"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}
                  >
                    <div className="font-semibold">{claimResult.message}</div>
                    {claimResult.status === "blocked" && claimResult.reason === "no_subscription" && (
                      <div className="text-xs mt-1 text-amber-700">
                        You need an active subscription. Visit your plans page to upgrade.
                      </div>
                    )}
                    {claimResult.status === "blocked" && claimResult.reason === "plan_mismatch" && (
                      <div className="text-xs mt-1 text-amber-700">
                        This perk is mapped to a higher plan. Upgrade your subscription to continue.
                      </div>
                    )}
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
              background: user
                ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))"
                : "#ffffff"
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
              {hasAccess && deal?.coupon_code && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-mono">
                  Coupon: {deal.coupon_code}
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
              <div className="text-sm text-slate-600">
                {hasAccess
                  ? "You can redeem this offer directly."
                  : "Claim the deal to let the backend verify your subscription before revealing details."}
              </div>
              <div className="text-sm text-slate-600">
                Estimated value: {deal?.discount || "Exclusive member pricing"}.
              </div>
            </div>
          </section>
        </main>

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
                  <Link to="/" className="hover:text-white">Home</Link>
                  <a href="#deals" className="hover:text-white">Marketplace</a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wide text-white/60">Account</h4>
                <div className="flex flex-col gap-2 text-white/80 text-sm">
                  <Link to="/login" className="hover:text-white">Log in</Link>
                  <Link to="/register" className="hover:text-white">Register</Link>
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
