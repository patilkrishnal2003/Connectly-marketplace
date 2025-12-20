import { Badge } from "@/components/ui/badge";
import type { Deal } from "@/types/deal";
import { Zap, Star, Users } from "lucide-react";
import { resolveDealLogo } from "@/utils/dealLogos";

interface DealDetailCardProps {
  deal: Deal;
  ratingDisplay: string;
  claimedDisplay: string;
  subtitle: string;
}

export default function DealDetailCard({ deal, ratingDisplay, claimedDisplay, subtitle }: DealDetailCardProps) {
  const logoUrl = resolveDealLogo(deal.logo, deal.partner, deal.company, deal.title);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl">
      <div className="pointer-events-none absolute -top-10 -right-24 h-52 w-52 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl font-bold text-foreground shadow-inner">
                <img src={logoUrl} alt={deal.partner || deal.title || "Startups"} className="h-16 w-16 object-contain" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{deal.title || "Partner perk"}</h1>
                  {(deal.featured || deal.tier) && (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-gradient-to-r from-primary/70 to-accent/70 text-primary-foreground"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {deal.featured ? "Featured" : deal.tier}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
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
                    {deal.discount || "Premium benefit"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{deal.longDescription || deal.description}</p>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-border/60 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {deal.discount ? deal.discount : "Member pricing"}
            </span>
            <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              {deal.partner || deal.company || "Connecttly"}
            </span>
            {deal.tier && (
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {deal.tier} tier
              </span>
            )}
          </div>
          {deal.coupon_code && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
              <span>Use code</span>
              <span className="text-primary">{deal.coupon_code}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
