import { Button } from "@/components/ui/button";
import { ArrowUpRight, Star, Zap } from "lucide-react";
import type { Deal } from "@/types/deal";
import { resolveDealLogo } from "@/utils/dealLogos";

const DEAL_VALUE_OVERRIDES: Record<string, string> = {
  Notion: "$500",
  AWS: "$100,000",
  Figma: "$144",
  HubSpot: "$45,000",
  "Google Cloud": "$50,000",
  Stripe: "$25,000",
  Slack: "$1,500",
  MongoDB: "$25,000",
  Linear: "$2,400",
};

interface DealCardProps {
  deal: Deal;
  onClaim?: (id: string) => void;
}

const DealCard = ({ deal, onClaim }: DealCardProps) => {
  const handleClaimClick = () => {
    if (!deal.id) return;
    onClaim?.(deal.id);
  };

  const companyName = deal.partner || deal.company;
  const brandName = companyName || "Startup partner";
  const offerHeadline = deal.offerTitle || deal.title || "Curated deal";
  const realmLabel = deal.realm || deal.category || "Startup";
  const formatTierLabel = (value?: string) => {
    const str = (value || "").toString().trim();
    if (!str) return null;
    const normalized = str.toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };
  const tierLabel = formatTierLabel(deal.tier);
  const discountLabel = deal.discount || "Limited-time offer";
  const displayDescription =
    deal.description ||
    `${brandName} provides curated credits, trial access, and flexible discounts for bold teams.`;
  const displayValue = deal.value || DEAL_VALUE_OVERRIDES[companyName || ""] || "TBD";
  const buttonLabel = "Claim deal";
  const logoUrl = resolveDealLogo(deal.logo, deal.company, deal.partner, deal.title);

  return (
    <div className="group relative flex h-full flex-col">
      {deal.featured && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-semibold uppercase text-primary-foreground shadow-soft">
          <Zap className="h-3 w-3" />
          Featured
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-secondary">
              <img src={logoUrl} alt={brandName} className="h-10 w-10 object-contain" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground truncate">{brandName}</h3>
                {deal.rating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-[14px] w-[14px] fill-current" />
                    <span className="text-xs font-semibold">{deal.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="truncate">{realmLabel}</span>
                {tierLabel && (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
                    {tierLabel}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
              {discountLabel}
            </div>
            <h4 className="text-lg font-semibold text-foreground">{offerHeadline}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{displayDescription}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-border/70 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="text-xs text-muted-foreground">Value up to </span>
                <span className="font-semibold text-foreground">{displayValue}</span>
              </div>
              <Button
                size="sm"
                onClick={handleClaimClick}
                className="group/btn bg-gradient-primary text-primary-foreground shadow-soft transition-all duration-200 hover:shadow-lg"
              >
              {buttonLabel}
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;

export function DealCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-3 w-24 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="h-5 w-48 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
      </div>
      <div className="mt-auto border-t border-border/70 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-20 rounded-full bg-slate-200" />
          <div className="h-10 w-28 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
