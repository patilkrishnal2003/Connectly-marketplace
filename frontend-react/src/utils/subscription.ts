export type RawSubscription = {
  serviceId?: string;
  service_id?: string;
  title?: string;
  status?: string;
};

export function normalizePlanLabel(sub?: RawSubscription) {
  const idText = (sub?.serviceId || sub?.service_id || "").toLowerCase();
  const titleText = (sub?.title || "").toLowerCase();
  if (idText.includes("pro") || titleText.includes("pro")) return "Professional";
  if (
    idText.includes("starter") ||
    idText.includes("basic") ||
    idText.includes("standard") ||
    titleText.includes("starter")
  )
    return "Starter";
  if (titleText) return sub?.title || "";
  if (idText) return sub?.serviceId || sub?.service_id || "";
  return "";
}

export function matchesPlan(sub?: RawSubscription, planId?: string) {
  if (!planId) return false;
  const idText = (sub?.serviceId || sub?.service_id || "").toLowerCase();
  const titleText = (sub?.title || "").toLowerCase();
  const target = planId.toLowerCase();
  if (target === "professional") return idText.includes("pro") || titleText.includes("pro");
  if (target === "standard") return (
    idText.includes("starter") || idText.includes("standard") || titleText.includes("starter")
  );
  return idText.includes(target) || titleText.includes(target);
}

export function derivePlanStatus(subscription?: RawSubscription) {
  const label = normalizePlanLabel(subscription);
  const lower = label.toLowerCase();
  const isPro = lower.includes("pro");
  const isStarter = lower.includes("starter") || lower.includes("standard") || lower.includes("basic");
  const hasPlan = Boolean(label) && subscription?.status === "active";
  return { label, isPro, isStarter, hasPlan };
}
