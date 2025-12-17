import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import DealCard from "../components/DealCard";
import Footer from "../components/Footer";

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
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
  const paymentGatewayBase = import.meta.env.VITE_PAYMENT_URL || "/payment";
  const [hasSubscription, setHasSubscription] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    productUpdates: true,
    darkMode: false,
    twoFactor: false,
    language: "en"
  });
  const profileRef = useRef(null);

  const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";
  const isDark = settings.darkMode;
  const heroGradient = "from-[#f8f4ff] via-[#efe6ff] to-[#f4edff]";
  const pageBg = isDark ? "from-slate-950 via-slate-900 to-slate-800" : "from-[#f9f6ff] via-[#f5edff] to-white";
  const heroTextColor = isDark ? "text-white" : "text-slate-900";
  const footerGradient = isDark
    ? "from-black via-slate-950 to-slate-900"
    : "from-slate-900 via-indigo-900 to-purple-800";

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const res = await authFetch(`/api/deals${userQuery}`);
        const json = await res.json();
        setDeals(json.deals || []);
        const purchaseRes = user ? await authFetch(`/api/admin/purchases?limit=1`) : null;
        if (purchaseRes && purchaseRes.ok) {
          const purchaseJson = await purchaseRes.json();
          setHasSubscription((purchaseJson.purchases || []).some((p) => p.status === "completed"));
        } else {
          setHasSubscription(false);
        }
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
    const titleText = (deal.title || "").toLowerCase();
    const partnerText = (deal.partner || "").toLowerCase();
    const searchText = (search || "").toLowerCase();
    const matchesSearch =
      titleText.includes(searchText) ||
      partnerText.includes(searchText);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unlocked" && deal.isUnlocked) ||
      (statusFilter === "locked" && !deal.isUnlocked);
    const matchesCategory = categoryFilter === "all" || (deal.category && deal.category.toLowerCase() === categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const unlockedDealsCount = mergedDeals.filter((d) => d.isUnlocked).length;
  const partnerCount = new Set(mergedDeals.map((d) => d.partner).filter(Boolean)).size;
  const categoryCount = new Set(mergedDeals.map((d) => d.category).filter(Boolean)).size;
  const heroStats = [
    { label: "Curated partner perks", value: mergedDeals.length || 0 },
    { label: "Unlocked deals for you", value: unlockedDealsCount },
    { label: "Partner networks", value: partnerCount },
    { label: "Categories covered", value: categoryCount }
  ];
  const valueProps = [
    {
      title: "Live deal intelligence",
      description: "Know which partners refresh their offers, what’s driving redemption, and what your teams have unlocked.",
      accent: "from-cyan-500/60 to-slate-900/10"
    },
    {
      title: "Community-ready workflows",
      description: "Connecttly automations keep approvals and onboarding looking professional for every cohort.",
      accent: "from-emerald-400/50 to-cyan-500/20"
    },
    {
      title: "Secure, scalable access",
      description: "Perks, coupons, and SaaS seats stay in sync with enterprise policies and compliance-ready controls.",
      accent: "from-indigo-500/40 to-purple-500/10"
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

  const handleViewDetails = (deal) => {
    setSelectedDealId(deal.id);
    navigate(`/deal/${deal.id}`, { state: { deal } });
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#e2e8f0";
    } else {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  }, [isDark]);

  const userInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  async function sendPlanConfirmation(planId) {
    if (!planId) return false;
    const target = `${paymentGatewayBase}?planId=${encodeURIComponent(planId)}`;
    navigate(target);
    return true;
  }

  const renderSection = (title, list) => {
    if (!list || list.length === 0) return null;
    return (
      <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_25px_45px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{title}</p>
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
    <div className={`min-h-screen bg-gradient-to-b ${pageBg} ${isDark ? "text-slate-100" : "text-slate-900"}`}>

      <section className={`relative overflow-hidden bg-gradient-to-br ${heroGradient} ${heroTextColor}`} style={{ paddingBottom: "160px" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#a592ff]/60 to-[#f2e6ff]/40 blur-3xl"></div>
          <div className="absolute -bottom-24 left-4 h-80 w-80 rounded-full bg-gradient-to-br from-[#d6c6ff]/40 to-[#f7efff]/60 blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-10">
          <nav className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl font-semibold text-[#6b56ff] shadow-lg">
                C
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connecttly</p>
                <p className="text-lg font-semibold text-slate-900">Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://connecttly.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-slate-600 shadow-sm transition hover:-translate-y-[1px]"
              >
                Connecttly.com
              </a>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-700 transition hover:bg-white"
                  >
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6b56ff] to-[#b97bff] flex items-center justify-center font-semibold text-white uppercase">
                      {userInitial}
                    </span>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-40">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Profile</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name || "Member"}</p>
                        {user.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
                        <p className="text-[11px] text-slate-500">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/my-deals"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          My deals
                        </Link>
                        <Link
                          to="/subscription-plans"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          Subscription Plans
                        </Link>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-sm text-slate-700 text-left hover:bg-slate-50"
                          onClick={() => {
                            setProfileOpen(false);
                            setSettingsOpen(true);
                          }}
                        >
                          Settings
                        </button>
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-sm text-rose-700 text-left hover:bg-rose-50"
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-slate-600 shadow-sm hover:-translate-y-[1px]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div className="space-y-8">
              <div className="flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#6b56ff]"></span>
                  Over 200+ exclusive startup perks available
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
                  Unlock <span className="text-[#6b56ff]">Premium Perks</span> for Your Startup
                </h1>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                  Access $1M+ in exclusive deals from top SaaS providers. Join 10,000+ startups already saving.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#6b53ff] via-[#8768ff] to-[#b87bff] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                >
                  Get Started Free
                  <span className="ml-2 text-xl">→</span>
                </button>
                <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  Book a Demo
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-500 justify-center lg:justify-start">
                <span className="rounded-full border border-slate-200 px-4 py-2">Live partner sync</span>
                <span className="rounded-full border border-slate-200 px-4 py-2">Unlocked vs queued</span>
                <span className="rounded-full border border-slate-200 px-4 py-2">Click to reveal coupons</span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/40 bg-white/60 p-6 backdrop-blur shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Insights</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">What’s trending today</p>
              <p className="text-sm text-slate-600 mb-4">
                {recentDeals.length > 0 ? "New partner launches ready for your members." : "We are curating new perks every week."}
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Deals added recently</span>
                  <span className="font-semibold">{recentDeals.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Popular partner picks</span>
                  <span className="font-semibold">{popularDeals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Featured unlocks</span>
                  <span className="font-semibold">{standardDeals.length + professionalDeals.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm text-slate-900">
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-8 pb-12">
        <div className="grid gap-6 md:grid-cols-3">
          {valueProps.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200/70 bg-white shadow-lg overflow-hidden">
              <div className={"h-2 w-full bg-gradient-to-r " + item.accent} />
              <div className="px-6 py-6 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      <main id="deals" className="max-w-7xl mx-auto px-6 pb-16 space-y-8">
        <section id="filters" className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Marketplace</p>
              <h2 className="text-2xl font-semibold text-slate-900">Find the right partner deal</h2>
              <p className="text-sm text-slate-500">Search, filter by lock state, and browse categories in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "unlocked", "locked"].map((value) => {
                const active = statusFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={
                      "px-4 py-2 rounded-full border text-xs font-semibold transition " +
                      (active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300")
                    }
                  >
                    {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals or partners"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
          <div className="flex flex-wrap gap-2">
            {["All", "Productivity", "DevTools", "Marketing", "Analytics", "Finance", "Design"].map((label) => {
              const value = label.toLowerCase();
              const active = categoryFilter === value;
              return (
                <button
                  key={label}
                  onClick={() => setCategoryFilter(value)}
                  className={
                    "px-4 py-2 rounded-full border text-xs font-semibold transition " +
                    (active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white")
                  }
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
          <div className="space-y-8">
            {renderSection("Recently added", recentDeals)}
            {renderSection("Most popular", popularDeals)}
            {renderSection("Standard deals", standardDeals)}
            {renderSection("Professional deals", professionalDeals)}
          </div>
        )}
      </main>


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
          <div className="backdrop-blur bg-white/80 border border-slate-200 shadow-lg rounded-3xl p-8 md:p-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">Plans</p>
                <h2 className="text-3xl font-semibold text-slate-900">Choose the access that fits you</h2>
                <p className="text-sm text-slate-600">
                  Compare the Standard and Professional plans to unlock more partner perks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLAN_OPTIONS.map((plan) => {
                const isDark = !!plan.dark;
                const cardBorder = isDark ? "border-slate-800/60" : "border-slate-200";
                const cardBg = isDark ? "bg-slate-950" : "bg-white/90";
                const textColor = isDark ? "text-white" : "text-slate-900";
                const labelColor = isDark ? "text-white/70" : "text-slate-700";
                const descColor = isDark ? "text-white/70" : "text-slate-600";
                const cadenceColor = isDark ? "text-white/60" : "text-slate-500";
                const featureColor = isDark ? "text-white/90" : "text-slate-800";
                const dotColor = isDark ? "bg-white/80" : "bg-emerald-500";
                const badgeClasses = isDark
                  ? "self-start rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white border border-white/30"
                  : "self-start rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white";

                return (
                  <article
                    key={plan.id}
                    className={`relative overflow-hidden rounded-3xl border ${cardBorder} ${cardBg} shadow-2xl transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,42,0.25)]`}
                  >
                    <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${plan.tone}`} aria-hidden="true" />
                    <div className={`absolute inset-x-6 -top-3 h-2 rounded-full bg-gradient-to-r ${plan.accent}`} />
                    <div className="relative px-6 py-8 flex flex-col gap-4 min-h-[360px] h-full">
                      {plan.badge && <span className={badgeClasses}>{plan.badge}</span>}
                      <div className="flex items-center justify-between">
                        <div>
                          {plan.label && (
                            <p className={`text-sm uppercase tracking-wide ${labelColor}`}>{plan.label} plan</p>
                          )}
                          <p className={`text-3xl font-semibold ${textColor}`}>{plan.name}</p>
                        </div>
                        <div className="text-right">
                          {plan.price && <p className={`text-4xl font-bold ${textColor}`}>{plan.price}</p>}
                          <p className={`text-xs ${cadenceColor}`}>{plan.cadence}</p>
                        </div>
                      </div>

                      <p className={`text-sm ${descColor}`}>{plan.text}</p>

                      <ul className={`space-y-3 ${featureColor} text-sm flex-1`}>
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className={`mt-1 h-2 w-2 rounded-full ${dotColor}`}></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2">
                        <button
                          type="button"
                          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${plan.buttonClass}`}
                          onClick={async () => {
                            await sendPlanConfirmation(plan.id);
                          }}
                        >
                          {plan.cta}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
