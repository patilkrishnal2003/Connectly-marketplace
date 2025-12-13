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
  const [claimResult, setClaimResult] = useState(null);
  const [claiming, setClaiming] = useState(false);
<<<<<<< HEAD
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [planModal, setPlanModal] = useState({ open: false, reason: "", message: "", currentPlan: "", requiredPlan: "" });
  const [sendingPlanId, setSendingPlanId] = useState("");
  const [couponRevealed, setCouponRevealed] = useState(false);

  useEffect(() => {
    if (claimResult) setShowClaimModal(true);
  }, [claimResult]);
=======
  const [modalContent, setModalContent] = useState(null);
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83

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

  const planOptions = [
    {
      id: "starter",
      planId: "standard",
      name: "Starter",
      price: "$99",
      cadence: "per month",
      tone: "from-emerald-600/90 to-teal-600/90",
      text: "Start with curated perks mapped to Starter deals.",
      features: ["Unlock Starter-tier deals", "Up to $5,000 in partner value", "Email support"],
      cta: "Choose Starter"
    },
    {
      id: "professional",
      planId: "professional",
      name: "Professional",
      price: "$199",
      cadence: "per month",
      tone: "from-indigo-700/90 to-purple-700/90",
      text: "Upgrade for Professional-only perks and faster support.",
      features: ["Everything in Starter", "Exclusive Professional-tier deals", "Priority partner support", "Early access to new perks"],
      cta: "Upgrade to Professional"
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (claimResult?.status === "success") {
      setCouponRevealed(false);
    }
  }, [claimResult]);

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

  const normalizePlanLabel = (sub) => {
    const idText = (sub?.serviceId || sub?.service_id || "").toLowerCase();
    const titleText = (sub?.title || "").toLowerCase();
    if (idText.includes("pro") || titleText.includes("pro")) return "Professional";
    if (idText.includes("starter") || idText.includes("basic") || idText.includes("standard") || titleText.includes("starter"))
      return "Starter";
    if (titleText) return sub.title;
    if (idText) return sub.serviceId || sub.service_id;
    return "";
  };

  const isStarterLabel = (label) => {
    const lower = (label || "").toLowerCase();
    return lower.includes("starter") || lower.includes("standard") || lower.includes("basic");
  };

  const requiredPlanForDeal = () => ((deal?.tier || "").toLowerCase() === "professional" ? "Professional" : "Starter");

  async function checkSubscriptionStatus() {
    if (!user?.email) return undefined;
    setCheckingSubscription(true);
    try {
      const res = await authFetch("/api/auth/claim-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "subscription_check_failed");
      setSubscription(data.subscription || null);
      return data.subscription || null;
    } catch (err) {
      console.error("subscription check failed", err);
      return undefined;
    } finally {
      setCheckingSubscription(false);
    }
  }

  function openPlanSelection(reason, opts = {}) {
    const requiredPlan = opts.requiredPlan || requiredPlanForDeal();
    setPlanModal({
      open: true,
      reason,
      message:
        opts.message ||
        (reason === "no_subscription"
          ? "You need an active plan to claim this deal. Pick a plan below to continue."
          : `You have a lower plan active. Move to ${requiredPlan} to claim this deal.`),
      currentPlan: opts.currentPlan || normalizePlanLabel(subscription || {}),
      requiredPlan
    });
    setShowClaimModal(false);
  }

  async function sendPlanSelection(planId) {
    if (!planId) return;
    setSendingPlanId(planId);
    const target = `${paymentGatewayBase}?planId=${encodeURIComponent(planId)}`;
    navigate(target);
    setTimeout(() => setSendingPlanId(""), 300);
  }

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
<<<<<<< HEAD
      setShowClaimModal(true);
=======
      const link = getRedemptionLink({ ...(deal || {}), isUnlocked: true });
      setModalContent({
        type: "success",
        title: "Deal claimed successfully",
        message: "You can redeem this offer right away.",
        primaryAction: link
          ? () => {
              window.open(link, "_blank", "noreferrer");
              setModalContent(null);
            }
          : null,
        primaryLabel: link ? "Redeem offer" : null,
        secondaryLabel: "Close",
        secondaryAction: () => setModalContent(null)
      });
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
      return;
    }

    setClaiming(true);
    setClaimResult(null);

    // Pre-check subscription for logged-in users; only proceed to claim if their plan is valid
    const activeSub = await checkSubscriptionStatus();
    const requiredPlan = requiredPlanForDeal();
    const currentPlanLabel = normalizePlanLabel(activeSub);
    const needsProfessional = requiredPlan.toLowerCase() === "professional";
    const hasStarterPlan = isStarterLabel(currentPlanLabel);

    if (activeSub === null) {
      openPlanSelection("no_subscription", { requiredPlan });
      setClaiming(false);
      return;
    }

    if (activeSub && needsProfessional && hasStarterPlan) {
      openPlanSelection("plan_mismatch", {
        requiredPlan: "Professional",
        currentPlan: currentPlanLabel || "Starter",
        message: `${currentPlanLabel || "Starter"} is active. This deal requires the Professional plan.`
      });
      setClaiming(false);
      return;
    }

    try {
      const res = await authFetch(`/api/deals/${id}/claim`, { method: "POST" });
      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn("Failed to parse claim response", parseErr);
        data = {};
      }

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (res.status === 403) {
        const currentPlan = normalizePlanLabel(subscription || activeSub);
        const requiredPlanName = data.reason === "plan_mismatch" ? "Professional" : requiredPlan;
        openPlanSelection(data.reason === "plan_mismatch" ? "plan_mismatch" : "no_subscription", {
          currentPlan,
          requiredPlan: requiredPlanName,
          message:
            data.reason === "plan_mismatch"
              ? `${currentPlan || "Starter"} is active. This deal requires the ${requiredPlanName} plan.`
              : "Choose a plan below to continue."
        });
<<<<<<< HEAD
        setClaiming(false);
=======
        if (data.reason === "no_subscription") {
          setModalContent({
            type: "blocked",
            title: "Subscription required",
            message: "You need an active subscription to claim this deal.",
            subtext: "You need an active subscription. Visit your plans page to upgrade.",
            primaryLabel: "Visit plans",
            primaryAction: () => {
              setModalContent(null);
              navigate("/#plans");
            },
            secondaryLabel: "Close",
            secondaryAction: () => setModalContent(null)
          });
        } else if (data.reason === "plan_mismatch") {
          setModalContent({
            type: "blocked",
            title: "Upgrade required",
            message: "This perk is mapped to a higher plan.",
            subtext: "Upgrade your subscription to continue.",
            primaryLabel: "Visit plans",
            primaryAction: () => {
              setModalContent(null);
              navigate("/#plans");
            },
            secondaryLabel: "Close",
            secondaryAction: () => setModalContent(null)
          });
        } else {
          setModalContent({
            type: "blocked",
            title: "Unable to claim deal",
            message: data.message || "We couldn't claim this deal right now.",
            primaryLabel: "Close",
            primaryAction: () => setModalContent(null)
          });
        }
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
        return;
      }

      if (!res.ok || data.ok === false) {
        const backendMessage = data.message || data.error;
        throw new Error(backendMessage || "claim_failed");
      }

      setDeal((prev) => ({ ...(prev || {}), ...(data.deal || {}), isUnlocked: true }));
      setClaimResult({
        status: "success",
        reason: data.claim?.reason || "ok",
        message: data.message || "Deal claimed successfully."
      });
<<<<<<< HEAD
      setShowClaimModal(true);
=======
      const link = getRedemptionLink({ ...(deal || {}), ...(data.deal || {}), isUnlocked: true });
      setModalContent({
        type: "success",
        title: "Deal claimed successfully",
        message: "You can now redeem this offer and enjoy the perks.",
        primaryLabel: link ? "Redeem offer" : null,
        primaryAction: link
          ? () => {
              window.open(link, "_blank", "noreferrer");
              setModalContent(null);
            }
          : null,
        secondaryLabel: "Close",
        secondaryAction: () => setModalContent(null)
      });
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
    } catch (err) {
      console.error(err);
      setClaimResult({
        status: "error",
        message: err?.message || "Could not claim this deal. Please try again."
      });
<<<<<<< HEAD
      setShowClaimModal(true);
=======
      setModalContent({
        type: "error",
        title: "Could not claim deal",
        message: err?.message || "Please try again.",
        primaryLabel: "Close",
        primaryAction: () => setModalContent(null)
      });
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
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

  const claimDisabled = claiming || loading || !deal || checkingSubscription;

  const maskedCoupon = (code) => {
    if (!code) return "";
    if (code.length <= 2) return "*".repeat(code.length);
    return `${code[0]}${"*".repeat(Math.max(1, code.length - 2))}${code[code.length - 1]}`;
  };

  const handleRevealCoupon = () => {
    if (!deal?.coupon_code) return;
    if (!hasAccess) {
      openPlanSelection("plan_mismatch", { requiredPlan: requiredPlanForDeal(), currentPlan: normalizePlanLabel(subscription || {}) });
      return;
    }
    setCouponRevealed(true);
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-b ${pageBg} text-slate-900`}>
        <header className={`bg-gradient-to-br ${heroGradient} text-white pb-16 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
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
                  {deal?.coupon_code && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRevealCoupon}
                        className={`px-5 py-3 rounded-xl border font-semibold shadow-sm ${
                          couponRevealed ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-indigo-900 border-white/30"
                        }`}
                      >
                        {couponRevealed ? deal.coupon_code : `Coupon: ${maskedCoupon(deal.coupon_code) || "*****"}`}
                      </button>
                    </div>
                  )}
                </div>
<<<<<<< HEAD
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
                      <div className="text-xs mt-2 text-amber-700">
                        You need an active subscription. Choose a plan to claim this deal.
                      </div>
                    )}
                    {claimResult.status === "blocked" && claimResult.reason === "plan_mismatch" && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-amber-700">
                        <span>This perk is mapped to a higher plan. Upgrade to continue.</span>
                        <span className="text-[11px] text-amber-800">
                          Starter plan detected? Move to Professional to unlock this perk.
                        </span>
                      </div>
                    )}
                  </div>
                )}
=======
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
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

<<<<<<< HEAD
        {planModal?.open && user && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Subscription</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {planModal.reason === "plan_mismatch" ? "Upgrade required" : "Choose a plan to continue"}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1">{planModal.message}</p>
                  {planModal.currentPlan && (
                    <p className="text-xs text-slate-500 mt-2">Current plan: {planModal.currentPlan}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800"
                  onClick={() => setPlanModal({ open: false, reason: "", message: "", currentPlan: "", requiredPlan: "" })}
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planOptions
                  .filter((plan) => {
                    const upgradeMode =
                      planModal.reason === "plan_mismatch" && isStarterLabel(planModal.currentPlan || "");
                    if (upgradeMode) return plan.id === "professional";
                    return true;
                  })
                  .map((plan) => {
                    const highlight = (planModal.requiredPlan || "").toLowerCase() === plan.name.toLowerCase();
                  return (
                    <div
                      key={plan.id}
                      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm ${
                        highlight ? "border-indigo-200 shadow-md" : "border-slate-200"
                      }`}
                    >
                      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${plan.tone}`} aria-hidden="true" />
                      <div className="relative p-5 space-y-3 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">{plan.name} plan</p>
                            <p className="text-xl font-semibold text-slate-900">{plan.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-slate-900">{plan.price}</div>
                            <div className="text-xs text-slate-500">{plan.cadence}</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{plan.text}</p>
                        <ul className="space-y-2 text-sm text-slate-700 flex-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
                          onClick={() => sendPlanSelection(plan.planId || plan.id)}
                          disabled={sendingPlanId === (plan.planId || plan.id)}
                        >
                          {sendingPlanId === (plan.planId || plan.id) ? "Sending..." : plan.cta}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500">
                You will be redirected to the payment gateway to complete the purchase.
              </div>
            </div>
          </div>
        )}

        {claimResult && showClaimModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Deal claim</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {claimResult.status === "success"
                      ? "Deal confirmed"
                      : claimResult.status === "blocked"
                      ? "Subscription required"
                      : "Please try again"}
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800"
                  onClick={() => setShowClaimModal(false)}
                >
                  Close
                </button>
              </div>

              <div
                className={`text-sm ${
                  claimResult.status === "success"
                    ? "text-emerald-700"
                    : claimResult.status === "blocked"
                    ? "text-amber-800"
                    : "text-rose-700"
                }`}
              >
                {claimResult.message}
              </div>

              {claimResult.status === "blocked" && (
                <div className="space-y-2">
                  <div className="text-xs text-amber-700">You need an active subscription to claim this deal.</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:shadow-md"
                      onClick={() => {
                        openPlanSelection(claimResult.reason === "plan_mismatch" ? "plan_mismatch" : "no_subscription", {
                          currentPlan: normalizePlanLabel(subscription || {}),
                          requiredPlan: requiredPlanForDeal()
                        });
                      }}
                    >
                      View plans
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowClaimModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {claimResult.status === "success" && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-700">
                    Your subscription is active. Confirm to start using this deal.
                  </div>
                  <div className="flex gap-2">
                    {hasAccess && redemptionLink && (
                      <a
                        href={redemptionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700"
                        onClick={() => setShowClaimModal(false)}
                      >
                        Redeem now
                      </a>
                    )}
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowClaimModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {claimResult.status === "error" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowClaimModal(false)}
                  >
                    Close
                  </button>
                </div>
              )}
=======
        {modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {modalContent.type === "success"
                      ? "Deal ready"
                      : modalContent.type === "blocked"
                      ? "Subscription"
                      : "Status"}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{modalContent.title}</h3>
                </div>
                <button
                  onClick={() => setModalContent(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close dialog"
                >
                  <span aria-hidden>×</span>
                </button>
              </div>
              <div className="mt-4 space-y-2 text-slate-600">
                <p>{modalContent.message}</p>
                {modalContent.subtext && <p className="text-sm text-slate-500">{modalContent.subtext}</p>}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                {modalContent.secondaryAction && modalContent.secondaryLabel && (
                  <button
                    onClick={modalContent.secondaryAction}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {modalContent.secondaryLabel}
                  </button>
                )}
                {modalContent.primaryAction && modalContent.primaryLabel && (
                  <button
                    onClick={modalContent.primaryAction}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow ${
                      modalContent.type === "success"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : modalContent.type === "blocked"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {modalContent.primaryLabel}
                  </button>
                )}
              </div>
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
            </div>
          </div>
        )}

<<<<<<< HEAD
      <footer className={`bg-gradient-to-r ${footerGradient} text-white transition-colors`}>
=======
        <footer className={`bg-gradient-to-r ${footerGradient} text-white transition-colors`}>
>>>>>>> be61a5da9932e7e359ba8fabdf3d280c6d264e83
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
