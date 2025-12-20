import React from "react";
import { Check, Sparkles, Building2, Rocket } from "lucide-react";

interface PricingPlan {
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

interface PricingSectionProps {
  onSelectPlan?: (planName: string) => void;
  currentPlan?: string;
}

const PricingSection = ({ onSelectPlan, currentPlan }: PricingSectionProps) => {
  const plans: PricingPlan[] = [
    {
      name: "Starter",
      icon: <Rocket className="w-5 h-5" />,
      price: "Free",
      period: "forever",
      description: "Perfect for early-stage teams exploring perks.",
      features: [
        "Access to 50+ free deals",
        "Basic partner directory",
        "Community support",
        "Monthly newsletter",
      ],
      cta: "Get Started",
    },
    {
      name: "Professional",
      icon: <Sparkles className="w-5 h-5" />,
      price: "$29",
      period: "per month",
      description: "Unlock premium perks and maximize savings.",
      features: [
        "Access to all 200+ deals",
        "Priority deal claiming",
        "Exclusive enterprise deals",
        "Deal value tracking",
        "Priority email support",
        "Early access to new deals",
      ],
      highlighted: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      icon: <Building2 className="w-5 h-5" />,
      price: "Custom",
      period: "per team",
      description: "For accelerators and multi-team programs.",
      features: [
        "Everything in Professional",
        "Team management",
        "Custom deal negotiation",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Transparent pricing for every stage
          </h2>
          <p className="text-base text-muted-foreground">
            Clean white cards, minimal borders, and a single highlighted plan for clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 space-y-5 bg-white ${
                plan.highlighted
                  ? "border-primary shadow-[0_20px_45px_rgba(51,105,253,0.15)]"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
              </div>

              <div>
                <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.period}</p>
              </div>

              <p className="text-sm text-muted-foreground">{plan.description}</p>

              <button
                onClick={() => onSelectPlan?.(plan.name)}
                className={`w-full rounded-xl border py-3 text-sm font-semibold ${
                  plan.highlighted
                    ? "border-primary bg-primary text-white"
                    : "border-border text-foreground hover:border-primary hover:text-primary"
                }`}
                disabled={currentPlan === plan.name}
              >
                {currentPlan === plan.name ? "Current Plan" : plan.cta}
              </button>

              <ul className="text-sm text-muted-foreground space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
