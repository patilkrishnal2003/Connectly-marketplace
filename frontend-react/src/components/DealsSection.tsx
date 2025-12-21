import DealCard, { DealCardSkeleton } from "./DealCard";
import type { Deal } from "@/types/deal";

interface DealsSectionProps {
  deals?: Deal[];
  onClaimDeal: (id: string) => void;
  isSubscribed?: boolean;
  loading?: boolean;
}

const skeletonCount = 6;

const DealsSection = ({ deals = [], onClaimDeal, isSubscribed = false, loading = false }: DealsSectionProps) => {
  if (loading) {
    return (
      <section id="deals" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Admin curated</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Loading partner deals...</h2>
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              Pulling the latest offers from the database so you can discover your next win.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DealCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!deals.length) {
    return null;
  }

  return (
    <section id="deals" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Marketplace</p>
            <h2 className="text-2xl font-bold text-foreground">All deals</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <div
              key={deal.id || `deal-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DealCard deal={deal} onClaim={onClaimDeal} isLocked={!isSubscribed && !deal.featured} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
