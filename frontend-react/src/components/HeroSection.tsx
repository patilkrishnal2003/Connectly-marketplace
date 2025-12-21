import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Zap } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn?: boolean;
  userName?: string;
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

const HeroSection = ({ isLoggedIn = false, userName, onGetStarted, onWatchDemo }: HeroSectionProps) => {
  const brandLogos = [
    { name: "Google", src: "/logos/google.svg" },
    { name: "Figma", src: "/logos/figma.svg" },
    { name: "Amazon", src: "/logos/amazon.svg" },
    { name: "LinkedIn", src: "/logos/linkedin.svg" },
    { name: "Stripe", src: "/logos/stripe.svg" },
  ];

  const getDisplayName = () => {
    if (!userName) return "Member";
    const trimmed = userName.trim();

    if (trimmed.includes("@")) {
      const [beforeAt] = trimmed.split("@");
      if (beforeAt) {
        return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
      }
    }

    return trimmed;
  };

  const displayName = getDisplayName();
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-[10%] w-20 h-20 rounded-2xl bg-card border border-border shadow-card animate-float opacity-60" style={{ animationDelay: "0s" }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary opacity-50" />
        </div>
      </div>
      <div className="absolute top-48 right-[15%] w-16 h-16 rounded-2xl bg-card border border-border shadow-card animate-float opacity-60" style={{ animationDelay: "2s" }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent opacity-50" />
        </div>
      </div>
      <div className="absolute bottom-32 left-[20%] w-14 h-14 rounded-xl bg-card border border-border shadow-card animate-float opacity-40" style={{ animationDelay: "4s" }}>
        <div className="w-full h-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary/50" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft mb-8 animate-fade-in">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Over 200+ exclusive startup perks available
            </span>
          </div>

          {isLoggedIn && (
            <div className="flex justify-center mb-4 animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-card border border-border shadow-soft">
                <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Signed in</p>
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {isLoggedIn ? (
              <>
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {displayName}
                </span>
              </>
            ) : (
              <>
                Unlock{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Premium Perks
                </span>
                <br />
                for Your Startup
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {isLoggedIn
              ? "Explore your exclusive deals and save thousands on the tools you need to grow."
              : "Access $1M+ in exclusive deals from top SaaS providers. Join 10,000+ startups already saving."
            }
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base px-6 py-4 group"
            >
              {isLoggedIn ? "Browse Deals" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onWatchDemo}
              className="w-full sm:w-auto text-base px-6 py-4 border border-border bg-card/70 text-foreground hover:bg-card/70 group"
            >
              <Play className="w-4 h-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {/* Avatars */}
            <div className="flex items-center">
              <div className="flex gap-3 sm:gap-4">
                {brandLogos.map((brand) => (
                  <div
                    key={brand.name}
                    className="w-14 h-14 rounded-2xl bg-card/90 border border-border shadow-soft flex items-center justify-center overflow-hidden"
                  >
                    <img src={brand.src} alt={`${brand.name} logo`} className="w-10 h-10 object-contain" />
                  </div>
                ))}
              </div>
              <div className="ml-4 text-left">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">From 2,000+ reviews</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-12 bg-border" />

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold text-foreground">10K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Startups</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold text-foreground">$1M+</span>
                </div>
                <p className="text-sm text-muted-foreground">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
