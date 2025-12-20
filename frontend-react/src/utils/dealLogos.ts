const LOGO_FALLBACKS: Record<string, string> = {
  notion: "/logos/notion.png",
  aws: "/logos/aws.svg",
  amazonwebservices: "/logos/aws.svg",
  figma: "/logos/figma.svg",
  hubspot: "/logos/hubspot.png",
  googlecloud: "/logos/google-cloud.png",
  google: "/logos/google-cloud.png",
  stripe: "/logos/stripe.svg",
  slack: "/logos/slack.svg",
  mongodb: "/logos/mongodb.ico",
  mongo: "/logos/mongodb.ico",
  linear: "/logos/linear.png"
};

const normalizeBrand = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function resolveDealLogo(logo?: string, ...candidates: Array<string | undefined>) {
  if (logo) return logo;
  for (const candidate of candidates) {
    const key = normalizeBrand(candidate);
    if (key && LOGO_FALLBACKS[key]) {
      return LOGO_FALLBACKS[key];
    }
  }
  return "/logos/logo-placeholder.svg";
}
