import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { derivePlanStatus, matchesPlan } from "@/utils/subscription";
import HeroNavbar from "../components/HeroNavbar";
import Breadcrumbs from "../components/Breadcrumbs";

const planOptions = [
  {
    id: "standard",
    planId: "standard",
    name: "Starter",
    price: "$99",
    cadence: "per month",
    highlight: "Best for early teams testing perks",
    text: "Get full access to starter-tier perks to validate what works for your company.",
    features: ["Unlock all Starter deals", "Up to $5,000 in partner value", "Email support", "Instant activation"],
    cta: "Purchase Starter"
  },
  {
    id: "professional",
    planId: "professional",
    name: "Professional",
    price: "$199",
    cadence: "per month",
    highlight: "Premium perks + fastest support",
    text: "Unlock Professional-only perks, faster support, and early drops from new partners.",
    features: [
      "Everything in Starter",
      "Exclusive Professional deals",
      "Priority partner support",
      "Early access to new perks",
      "Personalized onboarding"
    ],
    cta: "Purchase Professional"
  }
];

export default function SubscriptionPlans() {
  const { user, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const paymentGatewayBase = import.meta.env.VITE_PAYMENT_URL || "/payment";

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    let ignore = false;
    async function loadSubscription() {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await authFetch("/api/auth/claim-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        console.log("Subscription data:", data);
        if (!res.ok) throw new Error(data.error || "subscription_check_failed");
        if (!ignore) {
          setSubscription(data.subscription || null);
          setError("");
        }
      } catch (err) {
        console.error("Error loading subscription:", err);
        if (!ignore) setError("Unable to load your current plan. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadSubscription();
    return () => {
      ignore = true;
    };
  }, [authFetch, user]);

  const planStatus = useMemo(() => derivePlanStatus(subscription), [subscription]);

  const upgradeMessage = useMemo(() => {
    if (!planStatus.hasPlan) return "Choose a plan to unlock the full marketplace without interruptions.";
    if (planStatus.isPro) return "You are on Professional. Everything is unlocked and prioritized for your team.";
    return "Starter is active. Upgrade to Professional to unlock premium perks and concierge support.";
  }, [planStatus]);

  const handleCheckout = (planId) => {
    if (!planId) return;
    navigate(`${paymentGatewayBase}?planId=${encodeURIComponent(planId)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900 flex flex-col">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-10 right-10 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex justify-start">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Subscription Plans" }]} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr,auto] gap-6 items-start">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Subscription</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
                {planStatus.hasPlan ? "Manage your access" : "Unlock the full marketplace"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">{upgradeMessage}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-95"
                >
                  Back to marketplace
                </Link>
                <Link
                  to="/my-deals"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/90 px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-white transition"
                >
                  View my deals
                </Link>
              </div>
            </div>
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/90 shadow-lg p-5 space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? "Checking..." : subscription ? `${planStatus.label} (${subscription.status})` : "No plan active"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription?.status === "active"
                  ? planStatus.isPro
                    ? "Professional perks unlocked and prioritized support."
                    : planStatus.isStarter
                    ? "Starter perks unlocked. Professional perks locked until you upgrade."
                    : "Activate a plan to unlock partner deals instantly."
                  : subscription
                  ? "Your plan is not active. Renew to unlock perks."
                  : "Activate a plan to unlock partner deals instantly."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-5 space-y-2 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Value unlocked</p>
              <p className="text-xl font-semibold text-slate-900">{planStatus.isPro ? "Premium + Starter" : planStatus.hasPlan ? "Starter tier" : "Preview only"}</p>
              <p className="text-sm text-muted-foreground">Use your plan to claim deals in a single click across the marketplace.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-5 space-y-2 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Advice</p>
              <p className="text-xl font-semibold text-slate-900">{planStatus.isPro ? "You are set" : "Upgrade recommended"}</p>
              <p className="text-sm text-muted-foreground">
                {planStatus.isPro ? "Enjoy faster access and pro-only perks." : "Move to Professional for early drops, white-glove help, and pro-only perks."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-5 space-y-2 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Support</p>
              <p className="text-xl font-semibold text-slate-900">{planStatus.isPro ? "Priority responses" : "Standard turnaround"}</p>
              <p className="text-sm text-muted-foreground">
                {planStatus.isPro ? "Pro plans route to our fastest queue for activation help." : "Upgrade to jump the line and get guided onboarding for each perk."}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8 w-full">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm uppercase tracking-wide text-slate-500">Plans</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planOptions.map((plan) => {
                const active =
                  planStatus.hasPlan &&
                  (plan.planId === "standard"
                    ? planStatus.isStarter
                    : plan.planId === "professional"
                    ? planStatus.isPro
                    : matchesPlan(subscription, plan.planId));
                const upgradeRecommended = !active && plan.planId === "professional" && planStatus.isStarter;
                const actionLabel = active ? "Plan active" : upgradeRecommended ? "Upgrade" : plan.cta;
                return (
                  <div
                    key={plan.id}
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition"
                  >
                    <div className="relative p-6 space-y-4 h-full flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">{plan.name} plan</p>
                          <p className="text-3xl font-semibold text-slate-900">{plan.price}</p>
                          <p className="text-xs text-slate-500">{plan.cadence}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            active
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : upgradeRecommended
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {active ? "Unlocked" : upgradeRecommended ? "Upgrade" : "Preview"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2 w-fit">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        {plan.highlight}
                      </div>

                      <p className="text-sm text-slate-600">{plan.text}</p>

                      <ul className="space-y-2 text-sm text-slate-800 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className={`w-full btn-bubble ${active ? "btn-bubble--ghost text-slate-800" : "btn-bubble--dark"} justify-center`}
                        onClick={() => handleCheckout(plan.planId)}
                        disabled={active}
                      >
                        {actionLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-slate-500">Why Professional</p>
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                Market trend picks
              </div>
              <p className="text-sm text-indigo-900">
                Pro members see early partner drops, access higher-value perks, and get faster help from the marketplace team.
              </p>
              <ul className="space-y-2 text-sm text-indigo-900/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                  Exclusive pro-only partner perks curated for scale-stage teams.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                  Priority partner introductions and support to activate perks faster.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                  Early access to new drops with guided onboarding from our team.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-white p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-slate-900">How it works</p>
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                <li>Pick your plan and complete checkout in seconds.</li>
                <li>Return to the marketplace; your perks unlock instantly.</li>
                <li>Claim deals with one click—no extra verification needed.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Need help deciding?</p>
              <h2 className="text-xl font-semibold text-slate-900">Talk to us about the right plan</h2>
              <p className="text-sm text-slate-600">We can recommend the right tier based on the perks you need this quarter.</p>
            </div>
            <a
              href="https://connecttly.com/"
              target="_blank"
              rel="noreferrer"
              className="btn-bubble btn-bubble--dark"
            >
              Chat with the team
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
