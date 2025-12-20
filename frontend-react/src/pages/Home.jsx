import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import StatsCard from "../components/StatsCard";
import DealsSection from "../components/DealsSection";
import ClaimAuthModal from "../components/ClaimAuthModal";
import Navbar from "../components/Navbar";
import { Sparkles, TrendingUp, Users, Layers } from "lucide-react";
const SettingToggle = ({ label, desc, checked, onChange }) => (
  <label className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-100">
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
    </div>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4" />
  </label>
);

export default function Home() {
  const { user, logout, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const paymentGatewayBase = import.meta.env.VITE_PAYMENT_URL || "/payment";
  const [hasSubscription, setHasSubscription] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingDealId, setPendingDealId] = useState(null);
  const [pendingPlanId, setPendingPlanId] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    productUpdates: true,
    darkMode: false,
    twoFactor: false,
    language: "en"
  });

  const isDark = settings.darkMode;
  const pageBg = isDark ? "from-slate-950 via-slate-900 to-slate-800" : "from-[#f4f6fb] via-[#f7f7fb] to-white";

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user) {
        setHasSubscription(false);
        return;
      }
      try {
        const purchaseRes = await authFetch(`/api/admin/purchases?limit=1`);
        if (purchaseRes && purchaseRes.ok) {
          const purchaseJson = await purchaseRes.json();
          setHasSubscription((purchaseJson.purchases || []).some((p) => p.status === "completed"));
        } else {
          setHasSubscription(false);
        }
      } catch (err) {
        console.error("Failed to load purchases", err);
        setHasSubscription(false);
      }
    }

    fetchSubscriptionStatus();
  }, [authFetch, user]);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setDealsLoading(true);
        const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";
        const res = await authFetch(`/api/deals${userQuery}`);
        if (!res.ok) throw new Error("Failed to fetch deals");
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (err) {
        console.error("Failed to load deals", err);
        setDeals([]);
      } finally {
        setDealsLoading(false);
      }
    }

    fetchDeals();
  }, [authFetch, user?.userId]);

  const heroStats = [
    {
      title: "Curated partner perks",
      value: "100+",
      subtitle: "Deals reviewed weekly",
      icon: <Sparkles className="h-5 w-5 text-primary" />
    },
    {
      title: "Unlocked deals for you",
      value: "24/7",
      subtitle: "On-demand savings",
      icon: <Users className="h-5 w-5 text-emerald-500" />
    },
    {
      title: "Partner networks",
      value: "40+",
      subtitle: "Trusted programs",
      icon: <TrendingUp className="h-5 w-5 text-amber-500" />
    },
    {
      title: "Categories covered",
      value: "12",
      subtitle: "Vertical focus",
      icon: <Layers className="h-5 w-5 text-violet-500" />
    }
  ];
  const PLAN_OPTIONS = [
    {
      id: "standard",
      label: "Starter",
      name: "Standard",
      price: "$99",
      cadence: "per month",
      tone: "from-white/50 to-white/20",
      accent: "from-slate-200 to-slate-100",
      text: "Access curated partner perks as you prepare for launch.",
      features: [
        "Unlock all Standard-tier deals",
        "Up to $5,000 in partner value",
        "Email support"
      ],
      cta: "Get started",
      buttonClass: "bg-slate-900 text-white hover:bg-slate-800",
      badge: "Starter"
    },
    {
      id: "professional",
      label: "Professional",
      name: "Professional",
      price: "$199",
      cadence: "per month",
      tone: "from-slate-950/95 to-slate-900/90",
      accent: "from-white/60 to-white/30",
      text: "Premium access for teams ready to scale with members.",
      features: [
        "Everything in Standard",
        "Exclusive Professional-tier deals",
        "Priority partner support",
        "Early access to new perks"
      ],
      cta: "Get started",
      buttonClass: "bg-white text-slate-900 hover:bg-slate-100 border border-white/30 shadow-sm",
      badge: "Most loved",
      dark: true
    },
    {
      id: "enterprise",
      label: "",
      name: "Custom Enterprise",
    price: "",
      cadence: "per team",
      tone: "from-white/70 to-white/50",
      accent: "from-purple-500/80 to-fuchsia-500/80",
      text: "Concierge perks, integrations, and deal orchestration for accelerators.",
      features: [
        "Everything in Professional",
        "Team management controls",
        "Custom deal negotiation",
        "API access & SSO",
        "Dedicated account manager",
        "Custom integrations"
      ],
      cta: "Contact sales",
      buttonClass: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg hover:opacity-90",
      badge: "Enterprise"
    }
  ];

  const handleClaimDeal = (dealId) => {
    if (!dealId) return;
    if (!user?.userId) {
      setPendingDealId(dealId);
      setAuthModalOpen(true);
      return;
    }
    navigate(`/deal/${dealId}`);
  };

  useEffect(() => {
    if (!user || (!pendingDealId && !pendingPlanId)) return;
    setAuthModalOpen(false);
    if (pendingDealId) {
      navigate(`/deal/${pendingDealId}`);
      setPendingDealId(null);
    }
    if (pendingPlanId) {
      const target = `${paymentGatewayBase}?planId=${encodeURIComponent(pendingPlanId)}`;
      navigate(target);
      setPendingPlanId(null);
    }
  }, [user, pendingDealId, pendingPlanId, navigate, paymentGatewayBase]);

  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#e2e8f0";
    } else {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  }, [isDark]);

  const sendPlanConfirmation = useCallback((planId) => {
    if (!planId) return false;
    const target = `${paymentGatewayBase}?planId=${encodeURIComponent(planId)}`;
    navigate(target);
    return true;
  }, [navigate, paymentGatewayBase]);

  const handlePlanSelection = (planId) => {
    if (!planId) return;
    if (!user?.userId) {
      setPendingPlanId(planId);
      setAuthModalOpen(true);
      return;
    }
    sendPlanConfirmation(planId);
  };

  const navbarUser = user
    ? {
        name: user?.name || user?.email || "Member",
        email: user?.email || "",
        avatar: user?.avatar || user?.avatarUrl
      }
    : undefined;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${pageBg} ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <Navbar
        isLoggedIn={!!user}
        user={navbarUser}
        onLogin={() => navigate("/login")}
        onLogout={() => logout()}
        onProfile={() => navigate("/my-deals")}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="pt-28">
        <HeroSection isLoggedIn={!!user} userName={user?.name} onGetStarted={() => user ? navigate('/my-deals') : navigate('/subscription-plans')} onWatchDemo={() => window.open('https://connecttly.com/demo', '_blank')} />

        <section className="max-w-7xl mx-auto px-6 mt-8 pb-12">
          <div className="grid gap-6 md:grid-cols-4">
            {heroStats.map((stat) => (
              <StatsCard
                key={stat.title}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
              />
            ))}
          </div>
        </section>

        {dealsLoading ? (
          <DealsSection
            loading
            onClaimDeal={handleClaimDeal}
            isSubscribed={hasSubscription}
          />
        ) : deals.length === 0 ? (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white/80 px-8 py-10 text-sm text-slate-500 shadow-lg text-center">
                We are curating new marketplace deals for you - check back soon!
              </div>
            </div>
          </section>
        ) : (
          <DealsSection
            deals={deals}
            onClaimDeal={handleClaimDeal}
            isSubscribed={hasSubscription}
          />
        )}
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
                <h3 className="text-lg font-semibold text-slate-900">Personalize your experience</h3>
              </div>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <SettingToggle
                label="Notifications"
                desc="Get alerts for new deals and updates."
                checked={settings.notifications}
                onChange={(v) => setSettings((s) => ({ ...s, notifications: v }))}
              />
              <SettingToggle
                label="Product updates"
                desc="Stay in the loop about new perks and releases."
                checked={settings.productUpdates}
                onChange={(v) => setSettings((s) => ({ ...s, productUpdates: v }))}
              />
              <SettingToggle
                label="Two-factor authentication"
                desc="Add an extra layer of security to your account."
                checked={settings.twoFactor}
                onChange={(v) => setSettings((s) => ({ ...s, twoFactor: v }))}
              />
              <SettingToggle
                label="Dark mode"
                desc="Switch between light and dark themes."
                checked={settings.darkMode}
                onChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))}
              />
              <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white">
                <p className="text-sm font-semibold text-slate-900">Language</p>
                <p className="text-xs text-slate-500 mb-2">Choose your preferred language.</p>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={settings.language}
                  onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-white"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
                onClick={() => setSettingsOpen(false)}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasSubscription && (
        <section id="plans" className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-border rounded-3xl p-8 md:p-10 space-y-10 shadow-none">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold text-foreground mb-2">Choose the access that fits you</h2>
              <p className="text-sm text-muted-foreground">
                Compare clean, minimal plans to unlock the partner perks you need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLAN_OPTIONS.map((plan) => (
                <article
                  key={plan.id}
                  className={`rounded-2xl border p-6 space-y-4 bg-white transition-all duration-300 ${
                    plan.dark
                      ? "border-primary bg-[#061437] shadow-[0_25px_60px_rgba(15,23,42,0.2)] text-white"
                      : "border-border hover:shadow-[0_20px_45px_rgba(51,105,253,0.15)] hover:-translate-y-1"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {plan.label && (
                        <p className={`text-xs uppercase tracking-[0.3em] ${plan.dark ? "text-blue-100" : "text-slate-500"}`}>{plan.label} plan</p>
                      )}
                      <p className={`text-2xl font-bold ${plan.dark ? "text-white" : "text-foreground"}`}>{plan.name}</p>
                    </div>
                    <div className="text-right">
                      {plan.price && <p className={`text-3xl font-bold ${plan.dark ? "text-white" : "text-foreground"}`}>{plan.price}</p>}
                      <p className={`text-xs ${plan.dark ? "text-blue-100" : "text-muted-foreground"}`}>{plan.cadence}</p>
                    </div>
                  </div>
                  <p className={`text-sm ${plan.dark ? "text-blue-100" : "text-muted-foreground"}`}>{plan.text}</p>
                    <ul className={`text-sm space-y-2 ${plan.dark ? "text-blue-100" : "text-muted-foreground"}`}>
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`w-full rounded-2xl border py-3 text-sm font-semibold transition ${
                        plan.dark
                          ? "border-transparent bg-gradient-to-r from-[#1d2b65] to-[#334fff] text-white shadow-lg hover:opacity-90"
                          : "border-border text-foreground hover:border-primary hover:text-primary"
                      }`}
                      onClick={() => {
                        handlePlanSelection(plan.id);
                      }}
                    >
                      {plan.cta}
                    </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <ClaimAuthModal
        isOpen={authModalOpen}
        initialMode="login"
        onClose={() => {
          setAuthModalOpen(false);
          setPendingDealId(null);
          setPendingPlanId(null);
        }}
        onAuthenticated={() => setAuthModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
