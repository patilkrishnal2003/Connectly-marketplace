import { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Zap,
  ExternalLink,
  Calendar,
  Users,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthContext } from "@/auth/AuthProvider";

type Deal = {
  id?: string;
  title?: string;
  partner?: string;
  description?: string;
  longDescription?: string;
  value?: string;
  discount?: string;
  tier?: string;
  coupon_code?: string;
  link?: string;
  requirements?: string[];
  steps?: string[];
  claimedCount?: number;
  featured?: boolean;
  rating?: number;
  expiresAt?: string;
  expires_on?: string;
  expires?: string;
  logo?: string;
  image_url?: string;
  isUnlocked?: boolean;
};

type ClaimStatus = {
  status: "success" | "error";
  message: string;
  reason?: string;
  link?: string;
};

export default function DealDetail() {
  const { dealId } = useParams<{ dealId?: string }>();
  const navigate = useNavigate();
  const { authFetch, user, logout } = useContext(AuthContext);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);

  useEffect(() => {
    if (!dealId) return;
    let isMounted = true;
    const userQuery = user?.userId ? `?userId=${encodeURIComponent(user.userId)}` : "";

    const loadDeal = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await authFetch(`/api/deals/${dealId}${userQuery}`);
        if (!res.ok) throw new Error("Unable to load deal");
        const data = await res.json();
        if (isMounted) setDeal(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Could not fetch deal details right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDeal();
    return () => {
      isMounted = false;
    };
  }, [dealId, authFetch, user?.userId]);

  const expiresLabel = useMemo(() => {
    const raw = deal?.expiresAt || deal?.expires_on || deal?.expires;
    if (!raw) return undefined;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, [deal]);

  const requirements = useMemo(() => {
    if (deal?.requirements && deal.requirements.length) return deal.requirements;
    return [
      "Connecttly membership in good standing",
      deal?.tier ? `${deal.tier.charAt(0).toUpperCase() + deal.tier.slice(1)} plan access` : "Active plan required",
      deal?.partner ? `Approved by ${deal.partner}` : "Partner confirmation"
    ];
  }, [deal]);

  const claimSteps = useMemo(() => {
    if (deal?.steps && deal.steps.length) return deal.steps;
    return [
      "Sign in with your Connecttly account",
      `Claim ${deal?.title || "this partner perk"}`,
      "Use the link or coupon shared on your dashboard"
    ];
  }, [deal]);

  const ratingValue = useMemo(() => {
    const raw = Number(deal?.rating ?? NaN);
    if (Number.isNaN(raw)) return 4.9;
    return Math.min(5, Math.max(0, raw));
  }, [deal?.rating]);
  const ratingDisplay = ratingValue.toFixed(1);
  const claimedDisplay = deal?.claimedCount ? deal.claimedCount.toLocaleString() : "2,847";
  const partnerName = deal?.partner || "Connecttly";

  const handleClaimClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!dealId) return;

    setClaiming(true);
    setClaimStatus(null);

    try {
      const res = await authFetch(`/api/deals/${dealId}/claim`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json?.message || json?.error || "Claim could not be processed.";
        const error = new Error(message);
        (error as Error & { status?: number }).status = res.status;
        throw error;
      }

      const successMessage = json?.message || "Deal claimed successfully";
      const claimedDeal = json?.deal;
      setClaimStatus({ status: "success", message: successMessage, link: claimedDeal?.link });
      setDeal((prev) => {
        if (!prev && !claimedDeal) return prev;
        const merged = { ...(prev || {}), ...(claimedDeal || {}) };
        merged.isUnlocked = true;
        return merged;
      });

      const redirectLink = claimedDeal?.link;
      if (redirectLink && typeof window !== "undefined" && /^https?:\/\//.test(redirectLink)) {
        window.open(redirectLink, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Could not claim this deal right now.";
      setClaimStatus({ status: "error", message });
      const statusCode = err instanceof Error ? (err as Error & { status?: number }).status : undefined;
      if (statusCode === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setClaiming(false);
    }
  };

  const valueLabel = deal?.value || deal?.discount || "Premium partner benefit";
  const subtitle = deal?.description || deal?.longDescription || deal?.partner || "Exclusive Connecttly offer";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={!!user}
        onLogin={() => navigate("/login")}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />

      <main className="container mx-auto px-4 py-8 pt-24 space-y-8">
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">Loading deal...</div>
        ) : error ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground mb-4">Deal not found</p>
            <p>{error}</p>
            <Button variant="secondary" className="mt-6" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl">
                  <div className="pointer-events-none absolute -top-10 -right-24 h-52 w-52 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl" />
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div className="flex items-start gap-6">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl font-bold text-foreground shadow-inner">
                            {deal?.logo ? (
                              <img src={deal.logo} alt={deal.partner || deal.title} className="h-16 w-16 object-contain" />
                            ) : (
                              <span>{(deal?.partner || deal?.title || "?").charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h1 className="text-2xl font-bold text-foreground">{deal?.title || "Partner perk"}</h1>
                              {(deal?.featured || deal?.tier) && (
                                <Badge
                                  variant="secondary"
                                  className="border-0 bg-gradient-to-r from-primary/70 to-accent/70 text-primary-foreground"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  {deal?.featured ? "Featured" : deal?.tier}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                {ratingDisplay} rating
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {claimedDisplay} claims
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                {deal?.discount || "Premium benefit"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground">{deal?.longDescription || deal?.description}</p>

                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full border border-border/60 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          {deal?.discount ? deal.discount : "Member pricing"}
                        </span>
                        <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {partnerName}
                        </span>
                        {deal?.tier && (
                          <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {deal.tier} tier
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full max-w-sm space-y-4">
                      <div className="rounded-2xl border border-border bg-gradient-to-b from-white/70 via-white/80 to-white/80 p-6 shadow-lg">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Community review</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-3xl font-bold text-foreground">{ratingDisplay}</span>
                          <span className="text-sm text-muted-foreground">/5</span>
                        </div>
                        <div className="mt-3 flex gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${index < Math.round(ratingValue) ? "text-amber-500" : "text-border/60"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{claimedDisplay} member claims logged</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/50 p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Deal value</p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{valueLabel}</p>
                        <p className="text-sm text-muted-foreground">Unlock perks for {partnerName}</p>
                        {deal?.coupon_code && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                            <span>Use code</span>
                            <span className="text-primary">{deal.coupon_code}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <section className="bg-card rounded-2xl border border-border p-8 shadow-md">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-primary" />
                    Eligibility requirements
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-card rounded-2xl border border-border p-8 shadow-md">
                  <h3 className="text-lg font-semibold text-foreground mb-4">How to claim</h3>
                  <ol className="space-y-4 text-sm text-muted-foreground">
                    {claimSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <aside className="lg:col-span-1 space-y-6">
                <div className="sticky top-24 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-2xl">
                  <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/80 to-accent/80 p-6 text-center text-white shadow-lg">
                    <p className="text-sm uppercase tracking-[0.3em] opacity-90">Value up to</p>
                    <p className="mt-2 text-3xl font-bold">{valueLabel}</p>
                    <p className="text-xs uppercase tracking-wide opacity-90">Unlock perks for {partnerName}</p>
                    {expiresLabel && <p className="mt-1 text-xs uppercase tracking-wide opacity-75">Expires {expiresLabel}</p>}
                  </div>
                  <Button
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    onClick={handleClaimClick}
                    disabled={claiming}
                  >
                    {claiming ? "Claiming..." : "Claim This Deal"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  {claimStatus && (
                    <p className={`text-sm text-center ${claimStatus.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                      {claimStatus.message}
                    </p>
                  )}
                  {expiresLabel && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Expires {expiresLabel}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-border bg-secondary/50 p-6 shadow">
                  <h4 className="font-medium text-foreground mb-4">Deal stats</h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total claimed</span>
                      <span className="font-semibold text-foreground">{claimedDisplay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier</span>
                      <Badge variant="secondary">{deal?.tier || "Standard"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Partner</span>
                      <span className="font-semibold text-foreground">{partnerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span>{ratingDisplay}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
