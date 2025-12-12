import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthProvider";
import DealCard from "./component/DealCard";

const FEATURED_CATALOG = [
  {
    id: "bf-notion",
    title: "Notion for Startups",
    partner: "Notion",
    subtitle: "Docs, wiki, and projects in one workspace",
    discount: "$1k credits + free 6 months",
    description: "Organize your team with docs, databases, and projects powered by Notion's unified workspace.",
    logo: "https://cdn.worldvectorlogo.com/logos/notion-logo-1.svg",
    category: "Productivity",
    isUnlocked: true,
    featured: true
  },
  {
    id: "bf-stripe",
    title: "Stripe Atlas",
    partner: "Stripe",
    subtitle: "Company formation and payments",
    discount: "$500 fee waived + discounts",
    description: "Incorporate, open a bank account, and start accepting payments globally with Stripe Atlas.",
    logo: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg",
    category: "Finance",
    isUnlocked: true,
    featured: true
  },
  {
    id: "bf-brevo",
    title: "Brevo (Sendinblue)",
    partner: "Brevo",
    subtitle: "Email, SMS, and marketing automation",
    discount: "12 months on Business plan",
    description: "Engage customers with omnichannel marketing automation, transactional email, and SMS.",
    logo: "https://seeklogo.com/images/S/sendinblue-logo-A3F9C3D160-seeklogo.com.png",
    category: "Marketing",
    isUnlocked: true
  },
  {
    id: "bf-linear",
    title: "Linear",
    partner: "Linear",
    subtitle: "Issue tracking built for modern teams",
    discount: "Exclusive startup credits",
    description: "Ship faster with streamlined issue tracking, product roadmaps, and lightning-fast UI.",
    logo: "https://assets-global.website-files.com/5f0a720cd4e6e217c0c08c5d/5f1a5238ba4ee726c2c65f00_linear-logo.svg",
    category: "Productivity",
    isUnlocked: true
  },
  {
    id: "bf-postman",
    title: "Postman",
    partner: "Postman",
    subtitle: "API collaboration platform",
    discount: "Enterprise trial + credits",
    description: "Design, mock, document, and test APIs with the collaboration platform used by 25M developers.",
    logo: "https://cdn.worldvectorlogo.com/logos/postman.svg",
    category: "DevTools",
    isUnlocked: true
  },
  {
    id: "bf-miro",
    title: "Miro",
    partner: "Miro",
    subtitle: "Visual collaboration whiteboard",
    discount: "Startup plan credits",
    description: "Run workshops, brainstorm, and align teams on an infinite canvas with templates for every workflow.",
    logo: "https://connecttly.com/wp-content/uploads/2023/06/miro-logo.png",
    category: "Productivity",
    isUnlocked: true
  },
  {
    id: "bf-digitalocean",
    title: "DigitalOcean",
    partner: "DigitalOcean",
    subtitle: "Cloud infrastructure for builders",
    discount: "$1k infrastructure credits",
    description: "Spin up droplets, managed databases, and Kubernetes with predictable pricing and simple UX.",
    logo: "https://cdn.worldvectorlogo.com/logos/digitalocean-logo-1.svg",
    category: "DevTools",
    isUnlocked: true
  },
  {
    id: "bf-mixpanel",
    title: "Mixpanel",
    partner: "Mixpanel",
    subtitle: "Product analytics for growth teams",
    discount: "$50k in event credits",
    description: "Answer your product questions instantly with self-serve funnels, retention, and engagement analysis.",
    logo: "https://cdn.worldvectorlogo.com/logos/mixpanel-1.svg",
    category: "Analytics",
    isUnlocked: true
  },
  {
    id: "bf-canva",
    title: "Canva Pro",
    partner: "Canva",
    subtitle: "Design anything, fast",
    discount: "Free Pro for 1 year",
    description: "Create marketing assets, social posts, and pitch decks with templates and brand kits.",
    logo: "https://cdn.worldvectorlogo.com/logos/canva-1.svg",
    category: "Design",
    isUnlocked: true
  }
];

export default function App() {
  const { user, logout, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
  const heroGradient = user
    ? "from-emerald-900 via-teal-900 to-sky-900"
    : "from-slate-900 via-indigo-900 to-purple-800";
  const pageBg = user ? "from-emerald-50 via-teal-50 to-sky-50" : "from-sky-50 via-slate-50 to-white";
  const footerGradient = user ? "from-emerald-900 via-teal-900 to-sky-900" : "from-slate-900 via-indigo-900 to-purple-800";
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDealId, setSelectedDealId] = useState(null);

  const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const res = await authFetch(`/api/deals${userQuery}`);
        const json = await res.json();
        setDeals(json.deals || []);
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, [user, authFetch, userQuery]);

  const featuredMap = useMemo(() => {
    const map = {};
    FEATURED_CATALOG.forEach((item) => {
      if (item.title) map[item.title.toLowerCase()] = item;
    });
    return map;
  }, []);

  const mergedDeals = useMemo(() => {
    const withMeta = deals.map((deal) => {
      const meta = deal.title ? featuredMap[deal.title.toLowerCase()] || {} : {};
      return {
        ...meta,
        ...deal,
        featured: deal.featured || meta.featured,
        isUnlocked:
          typeof deal.isUnlocked === "boolean"
            ? deal.isUnlocked
            : typeof meta.isUnlocked === "boolean"
            ? meta.isUnlocked
            : false
      };
    });
    return withMeta;
  }, [deals, featuredMap]);

  const recentDeals = useMemo(
    () => [...mergedDeals].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4),
    [mergedDeals]
  );
  const popularDeals = useMemo(() => mergedDeals.filter((d) => d.featured), [mergedDeals]);
  const standardDeals = useMemo(() => mergedDeals.filter((d) => d.tier === "standard"), [mergedDeals]);
  const professionalDeals = useMemo(() => mergedDeals.filter((d) => d.tier === "professional"), [mergedDeals]);

  const filteredDeals = mergedDeals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      deal.partner.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unlocked" && deal.isUnlocked) ||
      (statusFilter === "locked" && !deal.isUnlocked);
    const matchesCategory = categoryFilter === "all" || (deal.category && deal.category.toLowerCase() === categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewDetails = (deal) => {
    setSelectedDealId(deal.id);
    navigate(`/deal/${deal.id}`, { state: { deal } });
  };

  async function sendPlanConfirmation(planId) {
    const suggested = (user?.email || "").toLowerCase();
    const email = window.prompt("Enter your email to confirm this plan:", suggested);
    if (!email) return false;
    const trimmed = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/api/plan/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, planId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not send confirmation email. Please try again.");
        return false;
      }
      alert("Confirmation email sent! Check your inbox.");
      return true;
    } catch (err) {
      console.error("plan confirm failed", err);
      alert("We couldn't send the confirmation. Please try again.");
      return false;
    }
  }

  const renderSection = (title, list) => {
    if (!list || list.length === 0) return null;
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">{title}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onViewDetails={handleViewDetails}
              isSelected={selectedDealId === deal.id}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${pageBg} text-slate-900`}>
      <section className={`relative overflow-hidden bg-gradient-to-br ${heroGradient} text-white transition-colors`}>
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-24 -left-10 h-72 w-72 bg-indigo-500 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute -bottom-20 -right-16 h-80 w-80 bg-purple-500 rounded-full mix-blend-overlay blur-3xl"></div>
        </div>

        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">
              C
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Connecttly</p>
              <p className="text-xl font-semibold leading-none">Marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">
                  {user.email} ({user.role})
                </span>
                <Link to="/my-deals" className="btn-bubble btn-bubble--outline">
                  My deals
                </Link>
                <button className="btn-bubble btn-bubble--white text-indigo-900" onClick={logout}>
                  Logout
                </button>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn-bubble btn-bubble--outline">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="btn-bubble btn-bubble--outline"
              >
                Login to unlock more
              </Link>
            )}
            <a
              href="https://connecttly.com/"
              target="_blank"
              rel="noreferrer"
              className="btn-bubble btn-bubble--white text-indigo-900"
            >
              Connecttly.com
            </a>
          </div>
        </nav>

        <header className="relative z-10 max-w-6xl mx-auto px-6 pb-20 pt-10 md:pt-16">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {user ? "Your perks are active" : "Partner perks updated live"}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {user ? "Welcome back—see what's unlocked for you." : "Unlock curated partner deals for your startup community."}
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                {user
                  ? "Jump into your active perks, browse new offers, and unlock more value with your account."
                  : "Browse featured offers, see what is unlocked for your account, and jump straight into the perks you can use today. Admins can add new partners from the control panel."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#deals" className="btn-bubble btn-bubble--emerald">
                  {user ? "View your perks" : "Get deal"}
                </a>
                {user ? (
                  <Link to="/my-deals" className="btn-bubble btn-bubble--ghost">
                    Continue exploring →
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn-bubble btn-bubble--ghost"
                  >
                    Sign in to claim ->
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">{user ? "Unlocked for you" : "All partner deals"}</span>
                <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">
                  {user ? "See your active + new offers" : "Locked vs unlocked at a glance"}
                </span>
                <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">Click to view coupon details</span>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center md:justify-end">
              <div className="relative h-full flex items-center">
                <div className="h-72 w-40 md:w-48 rounded-3xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur flex items-center justify-center overflow-hidden">
                  <img
                    src="https://connecttly.com/wp-content/uploads/2023/08/Connecttly-Logo-Vertical.png"
                    alt="Connecttly logo"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl bg-white/5">
                    Connecttly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </section>

      <main id="deals" className="max-w-6xl mx-auto px-6 pb-16 pt-12 space-y-8">
        <section
          id="filters"
          className="border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4"
          style={{
            background: user
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(14, 165, 233, 0.08))"
              : "#ffffff"
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Marketplace</p>
              <h2 className="text-2xl font-semibold text-slate-900">Find the right partner deal</h2>
              <p className="text-sm text-slate-500">Search, filter by lock state, and browse categories in one place.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals or partners"
                className="w-full pl-11 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Productivity", "DevTools", "Marketing", "Analytics", "Finance", "Design"].map((label) => {
              const value = label.toLowerCase();
              const active = categoryFilter === value;
              return (
                <button
                  key={label}
                  onClick={() => setCategoryFilter(value)}
                  className={`px-4 py-2 rounded-full border transition text-sm ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-800 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="text-slate-600">Loading deals...</div>
        ) : (
          <div className="space-y-10">
            {renderSection("Recently added", recentDeals)}
            {renderSection("Most popular", popularDeals)}
            {renderSection("Standard deals", standardDeals)}
            {renderSection("Professional deals", professionalDeals)}
          </div>
        )}

        {loading ? (
          <div className="text-slate-600">Loading deals...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDeals.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 border border-dashed border-slate-200 rounded-xl bg-white">
                  No deals match your filters yet.
                </div>
              ) : (
                filteredDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onViewDetails={handleViewDetails}
                    isSelected={selectedDealId === deal.id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 md:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Plans</p>
              <h2 className="text-3xl font-semibold text-slate-900">Choose the access that fits you</h2>
              <p className="text-sm text-slate-600">
                Compare the Standard and Professional plans to unlock more partner perks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "standard",
                name: "Standard",
                price: "$99",
                cadence: "per month",
                tone: "from-slate-900/90 to-slate-800/90",
                text: "Access curated partner perks to get started.",
                features: [
                  "Unlock all Standard-tier deals",
                  "Up to $5,000 in partner value",
                  "Email support"
                ],
                cta: "Choose Standard"
              },
              {
                id: "professional",
                name: "Professional",
                price: "$199",
                cadence: "per month",
                tone: "from-indigo-700/90 to-purple-700/90",
                text: "Expanded perks and premium access for teams ready to scale.",
                features: [
                  "Everything in Standard",
                  "Exclusive Professional-tier deals",
                  "Priority partner support",
                  "Early access to new perks"
                ],
                cta: "Choose Professional"
              }
            ].map((plan) => (
              <div
                key={plan.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
              >
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${plan.tone}`} aria-hidden="true" />
                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">{plan.name} plan</p>
                      <p className="text-3xl font-semibold text-slate-900">{plan.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-slate-900">{plan.price}</div>
                      <div className="text-xs text-slate-500">{plan.cadence}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">{plan.text}</p>

                  <hr className="my-5 border-slate-200" />

                  <ul className="space-y-3 text-slate-800 text-sm flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full btn-bubble btn-bubble--dark justify-center"
                      onClick={async () => {
                        await sendPlanConfirmation(plan.id);
                      }}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={`bg-gradient-to-r ${footerGradient} text-white mt-16 transition-colors`}>
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
              className="btn-bubble btn-bubble--white text-black px-6"
            >
              Book a demo
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div className="space-y-3">
              <h4 className="text-sm uppercase tracking-wide text-white/60">Explore</h4>
              <div className="flex flex-col gap-2 text-white/80 text-sm">
                <a href="#top" className="hover:text-white">Home</a>
                <a href="#deals" className="hover:text-white">Marketplace</a>
                <a href="#filters" className="hover:text-white">Search deals</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm uppercase tracking-wide text-white/60">Account</h4>
              <div className="flex flex-col gap-2 text-white/80 text-sm">
                <Link to="/login" className="hover:text-white">Log in</Link>
                <Link to="/register" className="hover:text-white">Register</Link>
                <Link to="/my-deals" className="hover:text-white">My deals</Link>
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
  );
}
