import { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
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
import { Deal } from "@/types/deal";
import DealDetailCard from "@/components/DealDetailCard";
import { derivePlanStatus, RawSubscription } from "@/utils/subscription";

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
  const [subscription, setSubscription] = useState<RawSubscription | null>(null);
  const [planError, setPlanError] = useState("");
  const [planChecking, setPlanChecking] = useState(false);
  const [planModal, setPlanModal] = useState<null | "purchase" | "upgrade">(null);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const { body } = document;
    const originalOverflow = body.style.overflow;

    if (planModal) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [planModal]);

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

  useEffect(() => {
    if (!user?.email) {
      setSubscription(null);
      setPlanChecking(false);
      setPlanError("");
      return;
    }

    let isMounted = true;
    const loadSubscription = async () => {
      try {
        setPlanChecking(true);
        setPlanError("");
        const res = await authFetch("/api/auth/claim-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "subscription_check_failed");
        if (isMounted) {
          setSubscription(json.subscription || null);
        }
      } catch (err) {
        console.error("Failed to load subscription status", err);
        if (isMounted) setPlanError("Unable to verify your plan right now.");
      } finally {
        if (isMounted) setPlanChecking(false);
      }
    };

    loadSubscription();
    return () => {
      isMounted = false;
    };
  }, [authFetch, user?.email]);

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

  const planStatus = useMemo(() => derivePlanStatus(subscription), [subscription]);

  const requiresProfessionalPlan = useMemo(() => {
    if (!deal) return false;
    const tier = (deal.tier || "").toLowerCase();
    if (tier.includes("pro")) return true;
    const requirementText = (deal.requirements || []).join(" ").toLowerCase();
    return requirementText.includes("professional");
  }, [deal]);

  const ratingValue = useMemo(() => {
    const raw = Number(deal?.rating ?? NaN);
    if (Number.isNaN(raw)) return 4.9;
    return Math.min(5, Math.max(0, raw));
  }, [deal?.rating]);
  const ratingDisplay = ratingValue.toFixed(1);
  const claimedDisplay = deal?.claimedCount ? deal.claimedCount.toLocaleString() : "2,847";
  const partnerName = deal?.partner || "Connecttly";

  const promptPlanModalForReason = (reason?: string) => {
    if (!reason) return false;
    if (reason === "plan_mismatch") {
      setPlanModal("upgrade");
      return true;
    }
    if (reason === "no_subscription") {
      setPlanModal("purchase");
      return true;
    }
    return false;
  };

  const handleClaimClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!dealId) return;
    if (!planStatus.hasPlan) {
      setPlanModal("purchase");
      return;
    }
    if (planStatus.isStarter && requiresProfessionalPlan) {
      setPlanModal("upgrade");
      return;
    }

    setClaiming(true);
    setClaimStatus(null);

    try {
      const res = await authFetch(`/api/deals/${dealId}/claim`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        promptPlanModalForReason(json?.reason);
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
  const planModalCopy = planModal === "upgrade"
    ? {
        title: "Professional access required",
        body: "This perk is reserved for Professional members. Upgrade now to unlock it instantly.",
        cta: "Upgrade plan"
      }
    : {
        title: "Activate a plan",
        body: "You need an active Starter or Professional plan before you can claim deals. Pick a plan tailored to your stage.",
        cta: "Choose a plan"
      };

  const navbarUser = user
    ? {
        name: user?.name || user?.email || "Member",
        email: user?.email || "",
        avatar: user?.avatar || user?.avatarUrl
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={!!user}
        user={navbarUser}
        onLogin={() => navigate("/login")}
        onLogout={() => {
          logout();
          navigate("/");
        }}
        onProfile={() => navigate("/my-deals")}
        onSettings={() => navigate("/subscription-plans")}
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
                {deal && (
                  <DealDetailCard
                    deal={deal}
                    ratingDisplay={ratingDisplay}
                    claimedDisplay={claimedDisplay}
                    subtitle={subtitle}
                  />
                )}

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
                  {planChecking && (
                    <p className="text-xs text-center text-slate-500">Verifying your subscription...</p>
                  )}
                  {planError && (
                    <p className="text-xs text-center text-rose-600">{planError}</p>
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
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connecttly</p>
            <h3 className="text-2xl font-semibold text-foreground">{planModalCopy.title}</h3>
            <p className="text-sm text-muted-foreground">{planModalCopy.body}</p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-white"
                onClick={() => {
                  setPlanModal(null);
                  navigate("/subscription-plans");
                }}
              >
                {planModalCopy.cta}
              </Button>
              <button
                type="button"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setPlanModal(null)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
