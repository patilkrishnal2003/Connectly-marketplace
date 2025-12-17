import { useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Tag,
  ShoppingCart,
  CreditCard,
  Menu,
  X,
  Shield,
  ChevronLeft,
  Wifi,
  TrendingUp,
  Activity,
  Search,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  UserPlus,
  Link2,
  ExternalLink,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  Eye,
  ChevronDown,
  ChevronUp,
  Crown,
  Zap,
  Star,
  Gift,
  LucideIcon,
  LogOut,
} from "lucide-react";

import { AuthContext } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

// ============================================
// TYPES & INTERFACES
// ============================================

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  subscription: {
    plan: string;
    interval: string;
    status: "active" | "inactive" | "cancelled";
  } | null;
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  link: string;
  couponCode: string;
  discount: string;
  featured: boolean;
  locked: boolean;
  active: boolean;
  createdAt: string;
  imageUrl?: string;
}

type PurchaseStatus = "completed" | "pending" | "failed" | "refunded" | string;

interface Purchase {
  id: string;
  transactionId: string;
  userEmail: string;
  dealTitle: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  paymentMethod: string;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  tier: "free" | "starter" | "pro" | "enterprise";
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  active: boolean;
  subscriberCount: number;
}

// ============================================
// API DATA HELPERS
// ============================================

type RawSubscription = {
  id: number;
  user_id: string;
  plan_id: string;
  status: string;
  started_at?: string;
  expires_at?: string | null;
  createdAt?: string;
  service?: RawService;
  Service?: RawService;
};

type RawUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  user_subscriptions?: RawSubscription[];
  userSubscriptions?: RawSubscription[];
};

type RawDeal = {
  id: string;
  title: string;
  partner?: string;
  coupon_code?: string;
  link?: string;
  locked_by_default?: boolean;
  featured?: boolean;
  tier?: string;
  type?: string;
  createdAt: string;
  logo?: string;
  image_url?: string;
};

type RawPurchase = {
  id: number;
  user_id: string;
  service_id: string;
  amount?: number | null;
  status?: string;
  provider?: string;
  provider_payment_id?: string | null;
  createdAt: string;
};

type RawService = {
  id: string;
  title: string;
  code?: string;
  tier?: string;
  price?: number;
  description?: string;
  billing_interval?: "monthly" | "yearly";
  is_active?: boolean;
};

const normalizeTierForPlan = (value?: string): Plan["tier"] => {
  const tier = (value || "").toString().toLowerCase();
  if (tier.includes("free")) return "free";
  if (["starter", "basic", "standard"].some((token) => tier.includes(token))) return "starter";
  if (["pro", "professional", "premium"].some((token) => tier.includes(token))) return "pro";
  if (["enterprise", "business"].some((token) => tier.includes(token))) return "enterprise";
  return "starter";
};

const pickPrimarySubscription = (subscriptions: RawSubscription[] = []): RawSubscription | null => {
  if (!subscriptions.length) return null;
  const sorted = [...subscriptions].sort((a, b) => {
    const aDate = new Date(a.started_at || a.createdAt || 0).getTime();
    const bDate = new Date(b.started_at || b.createdAt || 0).getTime();
    return bDate - aDate;
  });
  return sorted[0] || null;
};

const mapRawUserToUser = (raw: RawUser): User => {
  const subscriptions = raw.user_subscriptions || raw.userSubscriptions || [];
  const primary = pickPrimarySubscription(subscriptions);
  const service = primary?.service || primary?.Service;
  const status =
    primary?.status === "active"
      ? "active"
      : primary?.status === "canceled" || primary?.status === "cancelled"
      ? "cancelled"
      : "inactive";
  const interval = (service?.billing_interval as User["subscription"]["interval"]) || "monthly";

  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: raw.role === "admin" ? "admin" : "user",
    subscription: primary
      ? {
          plan: service?.title || primary.plan_id,
          interval,
          status,
        }
      : null,
    createdAt: raw.createdAt,
  };
};

const mapRawDealToDeal = (raw: RawDeal): Deal => ({
  id: raw.id,
  title: raw.title,
  description: raw.partner ? `${raw.partner}` : raw.type || "",
  link: raw.link || "",
  couponCode: raw.coupon_code || "",
  discount: raw.tier ? `${raw.tier} tier` : raw.type ? `${raw.type} offer` : "",
  featured: !!raw.featured,
  locked: raw.locked_by_default ?? true,
  active: true,
  createdAt: raw.createdAt,
  imageUrl: raw.logo || raw.image_url || "",
});

const mapRawPurchaseToPurchase = (
  raw: RawPurchase,
  userMap: Record<string, string>,
  serviceMap: Record<string, string>
): Purchase => ({
  id: raw.id.toString(),
  transactionId: raw.provider_payment_id || `txn-${raw.id}`,
  userEmail: userMap[raw.user_id] || raw.user_id,
  dealTitle: serviceMap[raw.service_id] || raw.service_id,
  amount: typeof raw.amount === "number" ? raw.amount : Number(raw.amount) || 0,
  currency: "USD",
  paymentMethod: raw.provider || "manual",
  status: (raw.status as Purchase["status"]) || "pending",
  createdAt: raw.createdAt,
});

const formatRelativeTime = (dateString: string) => {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const deltaMinutes = Math.round(Math.abs(now - then) / (1000 * 60));
  if (deltaMinutes < 1) return "Just now";
  if (deltaMinutes < 60) return `${deltaMinutes} min${deltaMinutes === 1 ? "" : "s"} ago`;
  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours} hr${deltaHours === 1 ? "" : "s"} ago`;
  return `${Math.round(deltaHours / 24)} day${Math.round(deltaHours / 24) === 1 ? "" : "s"} ago`;
};

const deriveActivityLabel = (status?: string) => {
  switch (status) {
    case "completed":
      return "Purchase completed";
    case "pending":
      return "Purchase pending";
    case "failed":
      return "Purchase failed";
    default:
      return "Purchase recorded";
  }
};

const mapRawServiceToPlan = (service: RawService, subscriberCount: number): Plan => ({
  id: service.id,
  name: service.title,
  tier: normalizeTierForPlan(service.tier || service.code),
  price: service.price ?? 0,
  currency: "USD",
  interval: service.billing_interval === "yearly" ? "yearly" : "monthly",
  features: [
    service.description || `${service.title} access`,
    `Billing interval: ${service.billing_interval || "monthly"}`,
    `Plan code: ${service.code || service.id}`,
  ],
  active: service.is_active ?? true,
  subscriberCount,
});

// ============================================
// UTILITY COMPONENTS
// ============================================

// Status Badge Component
type BadgeStatus = "success" | "warning" | "danger" | "primary" | "neutral";

const StatusBadge = ({ status, children }: { status: BadgeStatus; children: ReactNode }) => {
  const statusClasses = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    primary: "badge-primary",
    neutral: "badge-neutral",
  };

  return <span className={statusClasses[status]}>{children}</span>;
};

// Toggle Switch Component
const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${checked ? "bg-primary" : "bg-muted"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
        />
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
};

// Stat Card Component
const colorStyles = {
  primary: { bg: "bg-primary-light", text: "text-primary" },
  success: { bg: "bg-success-light", text: "text-success" },
  warning: { bg: "bg-warning-light", text: "text-warning" },
  destructive: { bg: "bg-destructive-light", text: "text-destructive" },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: "primary" | "success" | "warning" | "destructive";
  delay?: number;
}) => {
  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div className={`stat-card-icon ${styles.bg}`}>
          <Icon className={`w-5 h-5 ${styles.text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
};

// Simple Tooltip Component
const Tooltip = ({ children, content }: { children: ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-foreground rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 whitespace-nowrap max-w-xs break-all">
          {content}
        </div>
      )}
    </div>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================

const AdminHeader = ({
  title,
  description,
  flashMessage,
  onDismissFlash,
}: {
  title: string;
  description?: string;
  flashMessage?: string;
  onDismissFlash?: () => void;
}) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-bold text-foreground"
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mt-1"
              >
                {description}
              </motion.p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-light">
              <Wifi className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-medium text-success">Live</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Secure</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost btn-sm flex items-center gap-1 text-xs"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="mt-4"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-primary-light border border-primary/20">
              <p className="text-sm text-primary font-medium">{flashMessage}</p>
              {onDismissFlash && (
                <button onClick={onDismissFlash} className="text-primary hover:text-primary-dark transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// ============================================
// SIDEBAR COMPONENT
// ============================================

type PageType = "overview" | "users" | "deals" | "purchases" | "subscriptions";

const navItems: { page: PageType; label: string; icon: LucideIcon }[] = [
  { page: "overview", label: "Overview", icon: LayoutDashboard },
  { page: "users", label: "Users", icon: Users },
  { page: "deals", label: "Deals", icon: Tag },
  { page: "purchases", label: "Purchases", icon: ShoppingCart },
  { page: "subscriptions", label: "Subscriptions", icon: CreditCard },
];

const AdminSidebar = ({
  currentPage,
  onPageChange,
  adminEmail = "admin@connectly.io",
}: {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  adminEmail?: string;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-semibold text-foreground whitespace-nowrap">Connectly</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Marketplace Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-medium text-sm">
              {adminEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">{adminEmail}</p>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Admin</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;

          return (
            <button
              key={item.page}
              onClick={() => {
                onPageChange(item.page);
                setIsMobileOpen(false);
              }}
              className={`nav-item w-full ${isActive ? "active" : ""} ${isCollapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden lg:block p-3 border-t border-sidebar-border">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="nav-item w-full justify-center">
          <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 btn-icon bg-card shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-sidebar z-50 shadow-lg"
          >
            <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-4 btn-icon">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border z-30"
      >
        {sidebarContent}
      </motion.aside>

      {/* Spacer for main content */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
};

// ============================================
// PAGE VIEWS
// ============================================

// Overview Page
const OverviewView = () => {
  const { authFetch } = useContext(AuthContext);
  const [overviewData, setOverviewData] = useState<{
    users: User[];
    deals: Deal[];
    purchases: Purchase[];
    services: RawService[];
  }>({ users: [], deals: [], purchases: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      if (!authFetch) {
        setError("Authentication required to load overview data");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [usersRes, dealsRes, purchasesRes, servicesRes] = await Promise.all([
          authFetch("/api/admin/users?includeSubscriptions=true"),
          authFetch("/api/admin/deals"),
          authFetch("/api/admin/purchases?limit=100"),
          authFetch("/api/admin/services"),
        ]);

        if (!usersRes.ok) throw new Error("Failed to fetch users");
        if (!dealsRes.ok) throw new Error("Failed to fetch deals");
        if (!purchasesRes.ok) throw new Error("Failed to fetch purchases");
        if (!servicesRes.ok) throw new Error("Failed to fetch services");

        const [usersJson, dealsJson, purchasesJson, servicesJson] = await Promise.all([
          usersRes.json(),
          dealsRes.json(),
          purchasesRes.json(),
          servicesRes.json(),
        ]);

        if (!isMounted) return;

        const services: RawService[] = servicesJson?.services || [];
        const users = (usersJson?.users || []).map(mapRawUserToUser);
        const deals = (dealsJson?.deals || []).map(mapRawDealToDeal);
        const userMap = Object.fromEntries(users.map((user) => [user.id, user.email]));
        const serviceMap = Object.fromEntries(services.map((service) => [service.id, service.title]));
        const purchases = (purchasesJson?.purchases || []).map((raw: RawPurchase) =>
          mapRawPurchaseToPurchase(raw, userMap, serviceMap)
        );

        setOverviewData({ users, deals, purchases, services });
      } catch (err) {
        console.error("Failed to load overview", err);
        if (isMounted) setError((err as Error).message || "Failed to load overview data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const totalUsers = overviewData.users.length;
  const totalDeals = overviewData.deals.length;
  const totalPurchases = overviewData.purchases.length;
  const totalSubscribedUsers = overviewData.users.filter((user) => user.subscription?.status === "active").length;
  const totalRevenue = overviewData.purchases
    .filter((purchase) => purchase.status === "completed")
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const recentActivityItems = overviewData.purchases.slice(0, 4).map((purchase) => ({
    id: purchase.id,
    action: deriveActivityLabel(purchase.status),
    user: purchase.userEmail,
    time: formatRelativeTime(purchase.createdAt),
  }));

  return (
    <>
      <AdminHeader title="Overview" description="Welcome back! Here's what's happening with your marketplace." />
      <div className="p-4 lg:p-8 space-y-8">
        {loading && (
          <div className="admin-card p-4 text-sm text-muted-foreground">Loading overview metrics...</div>
        )}
        {error && (
          <div className="admin-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} color="primary" />
            <StatCard title="Active Deals" value={totalDeals.toLocaleString()} icon={Tag} color="success" />
            <StatCard
              title="Purchases"
              value={totalPurchases.toLocaleString()}
              icon={ShoppingCart}
              color="warning"
            />
            <StatCard
              title="Subscriptions"
              value={totalSubscribedUsers.toLocaleString()}
              icon={CreditCard}
              color="primary"
            />
          </div>
        </section>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="admin-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary text-sm py-3">Manage Users</button>
              <button className="btn-secondary text-sm py-3">View Deals</button>
              <button className="btn-secondary text-sm py-3">Purchases</button>
              <button className="btn-secondary text-sm py-3">Subscriptions</button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="admin-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recentActivityItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent activity yet.</div>
              ) : (
                recentActivityItems.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* Performance Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-foreground">98.5%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-foreground">124ms</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Response</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-foreground">4.8/5</p>
              <p className="text-sm text-muted-foreground mt-1">User Rating</p>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

// Users Page
const UsersView = () => {
  const { authFetch } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState<{ email: string; name: string; role: User["role"]; password: string }>({
    email: "",
    name: "",
    role: "user",
    password: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      if (!authFetch) {
        setError("Authentication required to manage users");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await authFetch("/api/admin/users?includeSubscriptions=true");
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        if (!isMounted) return;
        const mapped = (data.users || []).map(mapRawUserToUser);
        setUsers(mapped);
      } catch (err) {
        console.error("Users load failed", err);
        if (isMounted) setError((err as Error).message || "Failed to load users");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const filteredUsers = users.filter(
    (user: User) =>
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveUser = () => {
    console.log("Saving user:", editForm);
    setEditingId(null);
    setEditForm({});
  };

  const deleteUser = async (id: string) => {
    if (!authFetch) return;

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Remove user from local state
      setUsers(users.filter((user) => user.id !== id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to delete user:", message);
      alert(message);
    }
  };

  const addNewUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await authFetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Failed to create user");
      }

    const createdUser = await res.json();
    const payload = createdUser?.user || createdUser;

    // Add the new user to the users list
    const newUserObj: User = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      subscription: null,
      createdAt: payload.createdAt || new Date().toISOString(),
    };
      setUsers([newUserObj, ...users]);

      // Reset form
      setShowNewUserForm(false);
      setNewUser({ email: "", name: "", role: "user", password: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to create user:", message);
      alert(message);
    }
  };

  return (
    <>
      <AdminHeader title="Users" description="Manage user accounts and subscriptions" />
      <div className="p-4 lg:p-8 space-y-6">
        {loading && (
          <div className="admin-card p-4 text-sm text-muted-foreground">Loading users...</div>
        )}
        {error && (
          <div className="admin-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <button onClick={() => setShowNewUserForm(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* New User Form */}
        {showNewUserForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="admin-card p-4 border-l-4 border-l-primary bg-primary/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New User
              </h3>
              <button onClick={() => setShowNewUserForm(false)} className="btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="admin-input"
              />
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="admin-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="admin-input"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
                className="admin-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addNewUser} className="btn-primary">
                <Save className="w-4 h-4" />
                Create User
              </button>
              <button onClick={() => setShowNewUserForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={editingId === user.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}
                  >
                    <td>
                      {editingId === user.id ? (
                        <div className="space-y-2">
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="admin-input text-sm"
                            placeholder="Email"
                          />
                          <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="admin-input text-sm"
                            placeholder="Name"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === user.id ? (
                        <select
                          value={editForm.role || "user"}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "user" | "admin" })}
                          className="admin-input text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <StatusBadge status={user.role === "admin" ? "primary" : "neutral"}>{user.role}</StatusBadge>
                      )}
                    </td>
                    <td>
                      {user.subscription ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status="primary">{user.subscription.plan}</StatusBadge>
                          <StatusBadge status="neutral">{(user.subscription as NonNullable<User["subscription"]>).interval}</StatusBadge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No subscription</span>
                      )}
                    </td>
                    <td>
                      {user.subscription ? (
                        <StatusBadge
                          status={
                            user.subscription.status === "active"
                              ? "success"
                              : user.subscription.status === "cancelled"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {user.subscription.status}
                        </StatusBadge>
                      ) : (
                        <StatusBadge status="neutral">N/A</StatusBadge>
                      )}
                    </td>
                    <td className="text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {editingId === user.id ? (
                          <>
                            <button onClick={saveUser} className="btn-icon text-success">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEditing} className="btn-icon text-muted-foreground">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(user)} className="btn-icon">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteUser(user.id)} className="btn-icon text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Deals Page
const DealsView = () => {
  const { authFetch } = useContext(AuthContext);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Deal>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDealForm, setShowNewDealForm] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: "",
    description: "",
    link: "",
    couponCode: "",
    discount: "",
    featured: false,
    locked: false,
    active: true,
    imageUrl: "",
  });

  const filteredDeals = deals.filter(
    (deal) =>
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.couponCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (deal: Deal) => {
    setEditingId(deal.id);
    setEditForm({ ...deal });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveDeal = () => {
    setDeals(deals.map((d) => (d.id === editingId ? { ...d, ...editForm } : d)));
    setEditingId(null);
    setEditForm({});
  };

  const deleteDeal = (id: string) => {
    setDeals(deals.filter((d) => d.id !== id));
  };

  const toggleDealProperty = (id: string, property: "featured" | "locked" | "active") => {
    setDeals(deals.map((d) => (d.id === id ? { ...d, [property]: !d[property] } : d)));
  };

  const addNewDeal = () => {
    const deal: Deal = {
      id: Date.now().toString(),
      title: newDeal.title || "",
      description: newDeal.description || "",
      link: newDeal.link || "",
      couponCode: newDeal.couponCode || "",
      discount: newDeal.discount || "",
      featured: newDeal.featured || false,
      locked: newDeal.locked || false,
      active: newDeal.active !== false,
      imageUrl: newDeal.imageUrl || "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDeals([deal, ...deals]);
    setShowNewDealForm(false);
    setNewDeal({
      title: "",
      description: "",
      link: "",
      couponCode: "",
      discount: "",
      featured: false,
      locked: false,
      active: true,
      imageUrl: "",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    let isMounted = true;

    const loadDeals = async () => {
      if (!authFetch) {
        setError("Authentication required to load deals");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await authFetch("/api/admin/deals");
        if (!res.ok) throw new Error("Failed to load deals");
        const data = await res.json();
        if (!isMounted) return;
        const mapped = (data.deals || []).map(mapRawDealToDeal);
        setDeals(mapped);
      } catch (err) {
        console.error("Deals load failed", err);
        if (isMounted) setError((err as Error).message || "Failed to load deals");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDeals();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  return (
    <>
      <AdminHeader title="Deals" description="Manage promotional deals and discount codes" />
      <div className="p-4 lg:p-8 space-y-6">
        {loading && (
          <div className="admin-card p-4 text-sm text-muted-foreground">Loading deals...</div>
        )}
        {error && (
          <div className="admin-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <button onClick={() => setShowNewDealForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>

        {/* New Deal Form */}
        {showNewDealForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="admin-card p-4 border-l-4 border-l-primary bg-primary/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                New Deal
              </h3>
              <button onClick={() => setShowNewDealForm(false)} className="btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                className="admin-input"
              />
              <input
                type="text"
                placeholder="Coupon Code"
                value={newDeal.couponCode}
                onChange={(e) => setNewDeal({ ...newDeal, couponCode: e.target.value })}
                className="admin-input"
              />
              <input
                type="text"
                placeholder="Discount (e.g., 50%)"
                value={newDeal.discount}
                onChange={(e) => setNewDeal({ ...newDeal, discount: e.target.value })}
                className="admin-input"
              />
              <input
                type="url"
                placeholder="Link URL"
                value={newDeal.link}
                onChange={(e) => setNewDeal({ ...newDeal, link: e.target.value })}
                className="admin-input md:col-span-2 lg:col-span-3"
              />
              <textarea
                placeholder="Description"
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                className="admin-input md:col-span-2 lg:col-span-3 min-h-[80px]"
              />
              <input
                type="url"
                placeholder="Image or icon URL"
                value={newDeal.imageUrl}
                onChange={(e) => setNewDeal({ ...newDeal, imageUrl: e.target.value })}
                className="admin-input md:col-span-2 lg:col-span-3"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <ToggleSwitch
                checked={newDeal.featured || false}
                onChange={(checked) => setNewDeal({ ...newDeal, featured: checked })}
                label="Featured"
              />
              <ToggleSwitch
                checked={newDeal.locked || false}
                onChange={(checked) => setNewDeal({ ...newDeal, locked: checked })}
                label="Locked"
              />
              <ToggleSwitch
                checked={newDeal.active !== false}
                onChange={(checked) => setNewDeal({ ...newDeal, active: checked })}
                label="Active"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addNewDeal} className="btn-primary">
                <Save className="w-4 h-4" />
                Create Deal
              </button>
              <button onClick={() => setShowNewDealForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Deals Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="admin-table">
              <thead>
              <tr>
                  <th>Image</th>
                  <th>Deal</th>
                  <th>Coupon</th>
                  <th>Discount</th>
                  <th>Link</th>
                  <th>Featured</th>
                  <th>Locked</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, index) => (
                  <motion.tr
                    key={deal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={editingId === deal.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}
                  >
                    <td className="w-20">
                      {editingId === deal.id ? (
                        <input
                          type="url"
                          value={editForm.imageUrl || ""}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          className="admin-input text-sm"
                          placeholder="Icon URL"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-muted">
                          {deal.imageUrl ? (
                            <img src={deal.imageUrl} alt={`${deal.title} icon`} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold uppercase text-muted-foreground">
                              {deal.title?.charAt(0) || "D"}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === deal.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="admin-input text-sm"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="admin-input text-sm min-h-[60px]"
                            placeholder="Description"
                          />
                        </div>
                      ) : (
                        <div className="max-w-[200px]">
                          <p className="font-medium text-foreground">{deal.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{deal.description}</p>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === deal.id ? (
                        <input
                          type="text"
                          value={editForm.couponCode || ""}
                          onChange={(e) => setEditForm({ ...editForm, couponCode: e.target.value })}
                          className="admin-input text-sm w-28"
                        />
                      ) : (
                        <code className="px-2 py-1 rounded bg-muted text-sm font-mono">{deal.couponCode}</code>
                      )}
                    </td>
                    <td>
                      {editingId === deal.id ? (
                        <input
                          type="text"
                          value={editForm.discount || ""}
                          onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                          className="admin-input text-sm w-20"
                        />
                      ) : (
                        <StatusBadge status="success">{deal.discount}</StatusBadge>
                      )}
                    </td>
                    <td>
                      {editingId === deal.id ? (
                        <input
                          type="url"
                          value={editForm.link || ""}
                          onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                          className="admin-input text-sm w-48"
                        />
                      ) : (
                        <Tooltip content={deal.link}>
                          <a
                            href={deal.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
                          >
                            <Link2 className="w-3 h-3" />
                            {truncateText(deal.link, 20)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Tooltip>
                      )}
                    </td>
                    <td>
                      <ToggleSwitch
                        checked={editingId === deal.id ? editForm.featured || false : deal.featured}
                        onChange={(checked) =>
                          editingId === deal.id
                            ? setEditForm({ ...editForm, featured: checked })
                            : toggleDealProperty(deal.id, "featured")
                        }
                      />
                    </td>
                    <td>
                      <ToggleSwitch
                        checked={editingId === deal.id ? editForm.locked || false : deal.locked}
                        onChange={(checked) =>
                          editingId === deal.id
                            ? setEditForm({ ...editForm, locked: checked })
                            : toggleDealProperty(deal.id, "locked")
                        }
                      />
                    </td>
                    <td>
                      <StatusBadge status={deal.active ? "success" : "neutral"}>
                        {deal.active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {editingId === deal.id ? (
                          <>
                            <button onClick={saveDeal} className="btn-icon text-success">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEditing} className="btn-icon text-muted-foreground">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(deal)} className="btn-icon">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteDeal(deal.id)} className="btn-icon text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDeals.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No deals found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Purchases Page
const PurchasesView = () => {
  const { authFetch } = useContext(AuthContext);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    const loadPurchases = async () => {
      if (!authFetch) {
        setError("Authentication required to load purchases");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [purchasesRes, usersRes, servicesRes] = await Promise.all([
          authFetch("/api/admin/purchases?limit=200"),
          authFetch("/api/admin/users"),
          authFetch("/api/admin/services"),
        ]);

        if (!purchasesRes.ok) throw new Error("Failed to load purchases");
        if (!usersRes.ok) throw new Error("Failed to load users");
        if (!servicesRes.ok) throw new Error("Failed to load services");

        const [purchasesJson, usersJson, servicesJson] = await Promise.all([
          purchasesRes.json(),
          usersRes.json(),
          servicesRes.json(),
        ]);

        if (!isMounted) return;

        const rawUsers: RawUser[] = usersJson?.users || [];
        const services: RawService[] = servicesJson?.services || [];
        const userMap = Object.fromEntries(rawUsers.map((user) => [user.id, user.email]));
        const serviceMap = Object.fromEntries(services.map((service) => [service.id, service.title]));
        const mapped = (purchasesJson?.purchases || []).map((raw: RawPurchase) =>
          mapRawPurchaseToPurchase(raw, userMap, serviceMap)
        );

        setPurchases(mapped);
      } catch (err) {
        console.error("Purchases load failed", err);
        if (isMounted) setError((err as Error).message || "Failed to load purchases");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPurchases();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.dealTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Purchase["status"]): BadgeStatus => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const totalRevenue = purchases.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <>
      <AdminHeader title="Purchases" description="Track and manage all transactions" />
      <div className="p-4 lg:p-8 space-y-6">
        {loading && (
          <div className="admin-card p-4 text-sm text-muted-foreground">Loading purchases...</div>
        )}
        {error && (
          <div className="admin-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue, "USD")}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{purchases.filter((p) => p.status === "pending").length}</p>
            </div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-input w-full sm:w-40"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Purchases Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Customer</th>
                  <th>Deal</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase, index) => (
                  <motion.tr
                    key={purchase.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td>
                      <code className="text-sm font-mono text-primary">{purchase.transactionId}</code>
                    </td>
                    <td>
                      <span className="text-foreground">{purchase.userEmail}</span>
                    </td>
                    <td>
                      <span className="text-foreground">{purchase.dealTitle}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatCurrency(purchase.amount, purchase.currency)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted-foreground text-sm">{purchase.paymentMethod}</span>
                    </td>
                    <td>
                      <StatusBadge status={getStatusColor(purchase.status)}>{purchase.status}</StatusBadge>
                    </td>
                    <td>
                      <span className="text-muted-foreground text-sm">{formatDate(purchase.createdAt)}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end">
                        <button className="btn-icon">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPurchases.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No purchases found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Subscriptions Page
const tierIcons = {
  free: Star,
  starter: Zap,
  pro: Crown,
  enterprise: Gift,
};

const tierColors = {
  free: "neutral",
  starter: "primary",
  pro: "warning",
  enterprise: "success",
} as const;

const SubscriptionsView = () => {
  const { authFetch } = useContext(AuthContext);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usersList, setUsersList] = useState<RawUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userEmail: "",
    planId: "",
    duration: "1",
  });
  const [grantStatus, setGrantStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [isGranting, setIsGranting] = useState(false);
  const isMountedRef = useRef(true);

  const loadPlans = useCallback(async () => {
    if (!authFetch) {
      if (isMountedRef.current) {
        setError("Authentication required to load subscription plans");
        setPlans([]);
        setUsersList([]);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [servicesRes, usersRes] = await Promise.all([
        authFetch("/api/admin/services"),
        authFetch("/api/admin/users?includeSubscriptions=true"),
      ]);

      if (!servicesRes.ok) throw new Error("Failed to load plans");
      if (!usersRes.ok) throw new Error("Failed to load user subscriptions");

      const [servicesJson, usersJson] = await Promise.all([servicesRes.json(), usersRes.json()]);
      const services: RawService[] = servicesJson?.services || [];
      const rawUsers: RawUser[] = usersJson?.users || [];
      const subscriptionCounts: Record<string, number> = {};
      rawUsers.forEach((user) => {
        const subs = user.user_subscriptions || user.userSubscriptions || [];
        subs.forEach((sub) => {
          if (sub.status === "active") {
            subscriptionCounts[sub.plan_id] = (subscriptionCounts[sub.plan_id] || 0) + 1;
          }
        });
      });

      const mappedPlans = services.map((service) =>
        mapRawServiceToPlan(service, subscriptionCounts[service.id] || 0)
      );
      if (!isMountedRef.current) return;
      setPlans(mappedPlans);
      setUsersList(rawUsers);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
      if (isMountedRef.current) {
        setError((err as Error).message || "Failed to load subscription plans");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [authFetch]);

  useEffect(() => {
    isMountedRef.current = true;
    loadPlans();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadPlans]);

  const toggleGrantForm = () => {
    setGrantStatus(null);
    setShowGrantForm((prev) => !prev);
  };

  const handleCancelGrantForm = () => {
    setGrantStatus(null);
    setShowGrantForm(false);
  };

  const handleGrantSubscription = async () => {
    if (!authFetch) {
      setGrantStatus({ type: "error", message: "Authentication required to grant subscriptions" });
      return;
    }

    if (isGranting) return;
    setGrantStatus(null);

    const normalizedEmail = grantForm.userEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setGrantStatus({ type: "error", message: "Enter a user email to grant a subscription" });
      return;
    }

    const user = usersList.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
    if (!user) {
      setGrantStatus({ type: "error", message: "No user found with that email" });
      return;
    }

    const plan = plans.find((candidate) => candidate.id === grantForm.planId);
    if (!plan) {
      setGrantStatus({ type: "error", message: "Select a valid plan to grant" });
      return;
    }

    const durationMonths = Math.max(1, Number(grantForm.duration) || 1);
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    setIsGranting(true);
    try {
      const response = await authFetch(`/api/admin/users/${user.id}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          status: "active",
          startedAt: startedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to grant subscription");
      }

      setGrantStatus({
        type: "success",
        message: `Granted ${plan.name} to ${user.email} for ${durationMonths} month(s).`,
      });
      setGrantForm({ userEmail: "", planId: "", duration: "1" });
      setShowGrantForm(false);
      await loadPlans();
    } catch (err) {
      setGrantStatus({
        type: "error",
        message: (err as Error).message || "Failed to grant the subscription",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const filteredPlans = plans.filter((plan) => plan.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  return (
    <>
      <AdminHeader title="Subscriptions" description="Manage subscription plans and user access" />
      <div className="p-4 lg:p-8 space-y-6">
        {loading && (
          <div className="admin-card p-4 text-sm text-muted-foreground">Loading plans...</div>
        )}
        {error && (
          <div className="admin-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => {
            const TierIcon = tierIcons[plan.tier];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="admin-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      plan.tier === "free"
                        ? "bg-muted"
                        : plan.tier === "starter"
                        ? "bg-primary-light"
                        : plan.tier === "pro"
                        ? "bg-warning-light"
                        : "bg-success-light"
                    }`}
                  >
                    <TierIcon
                      className={`w-4 h-4 ${
                        plan.tier === "free"
                          ? "text-muted-foreground"
                          : plan.tier === "starter"
                          ? "text-primary"
                          : plan.tier === "pro"
                          ? "text-warning"
                          : "text-success"
                      }`}
                    />
                  </div>
                  <StatusBadge status={tierColors[plan.tier]}>{plan.tier}</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="text-2xl font-bold text-foreground">{plan.subscriberCount}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Grant Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Grant Subscription</h3>
              <p className="text-sm text-muted-foreground">Manually assign a subscription to a user</p>
            </div>
            <button onClick={toggleGrantForm} className="btn-primary">
              <Plus className="w-4 h-4" />
              Grant Access
            </button>
          </div>

          {showGrantForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-border pt-4 mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">User Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={grantForm.userEmail}
                    onChange={(e) => setGrantForm({ ...grantForm, userEmail: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
                  <select
                    value={grantForm.planId}
                    onChange={(e) => setGrantForm({ ...grantForm, planId: e.target.value })}
                    className="admin-input"
                  >
                    <option value="">Select a plan</option>
                    {plans
                      .filter((p) => p.tier !== "free")
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatCurrency(plan.price, plan.currency)}/{plan.interval}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Duration (months)</label>
                  <select
                    value={grantForm.duration}
                    onChange={(e) => setGrantForm({ ...grantForm, duration: e.target.value })}
                    className="admin-input"
                  >
                    <option value="1">1 month</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleGrantSubscription}
                  disabled={!grantForm.userEmail || !grantForm.planId || isGranting}
                  className="btn-primary"
                >
                  Grant Subscription
                </button>
                <button onClick={handleCancelGrantForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
          {grantStatus && (
            <p
              className={`mt-3 text-sm ${
                grantStatus.type === "success" ? "text-success" : "text-destructive"
              }`}
            >
              {grantStatus.message}
            </p>
          )}
        </motion.div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input pl-10"
          />
        </div>

        {/* Plans Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Tier</th>
                  <th>Price</th>
                  <th>Interval</th>
                  <th>Subscribers</th>
                  <th>Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan, index) => {
                  const TierIcon = tierIcons[plan.tier];
                  const isExpanded = expandedPlan === plan.id;

                  return (
                    <>
                      <motion.tr
                        key={plan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="cursor-pointer"
                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                plan.tier === "free"
                                  ? "bg-muted"
                                  : plan.tier === "starter"
                                  ? "bg-primary-light"
                                  : plan.tier === "pro"
                                  ? "bg-warning-light"
                                  : "bg-success-light"
                              }`}
                            >
                              <TierIcon
                                className={`w-4 h-4 ${
                                  plan.tier === "free"
                                    ? "text-muted-foreground"
                                    : plan.tier === "starter"
                                    ? "text-primary"
                                    : plan.tier === "pro"
                                    ? "text-warning"
                                    : "text-success"
                                }`}
                              />
                            </div>
                            <span className="font-medium text-foreground">{plan.name}</span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={tierColors[plan.tier]}>{plan.tier}</StatusBadge>
                        </td>
                        <td>
                          <span className="font-semibold text-foreground tabular-nums">
                            {formatCurrency(plan.price, plan.currency)}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status="neutral">{plan.interval}</StatusBadge>
                        </td>
                        <td>
                          <span className="font-medium text-foreground tabular-nums">
                            {plan.subscriberCount.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={plan.active ? "success" : "neutral"}>
                            {plan.active ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>
                        <td>
                          <div className="flex items-center justify-end">
                            <button className="btn-icon">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {isExpanded && (
                        <tr key={`${plan.id}-expanded`}>
                          <td colSpan={7} className="bg-muted/30 p-0">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-4"
                            >
                              <h4 className="text-sm font-medium text-foreground mb-3">Features included:</h4>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredPlans.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No plans found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ============================================
// MAIN ADMIN PANEL COMPONENT
// ============================================

const AdminPanel = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("overview");

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewView />;
      case "users":
        return <UsersView />;
      case "deals":
        return <DealsView />;
      case "purchases":
        return <PurchasesView />;
      case "subscriptions":
        return <SubscriptionsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 min-w-0">{renderPage()}</main>
    </div>
  );
};

export default AdminPanel;
