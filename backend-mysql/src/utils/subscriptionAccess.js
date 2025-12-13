const { Op } = require("sequelize");
const { UserSubscription, Service, Deal, ServiceDeal, UserDealException } = require("../models");

async function getActiveSubscriptionForUser(userId) {
  const now = new Date();
  const subscription = await UserSubscription.findOne({
    where: {
      user_id: userId,
      status: "active",
      started_at: { [Op.lte]: now },
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gte]: now } }]
    },
    include: [
      {
        model: Service,
        attributes: ["id", "title", "code", "tier", "billing_interval"]
      }
    ],
    order: [
      ["started_at", "DESC"],
      ["createdAt", "DESC"]
    ]
  });

  return subscription || null;
}

function normalizeTier(value) {
  const str = (value || "").toString().toLowerCase();
  if (!str) return null;
  if (["pro", "professional", "premium"].some((token) => str.includes(token))) return "professional";
  if (["standard", "basic", "starter"].some((token) => str.includes(token))) return "standard";
  return str;
}

async function checkDealAccessForUser(userId, dealId, deal = null) {
  const now = new Date();

  if (!deal) {
    deal = await Deal.findByPk(dealId, { attributes: ["id", "locked_by_default"] });
  }

  // Open deals (locked_by_default = false) don't require a subscription.
  if (deal && deal.locked_by_default === false) {
    return {
      hasAccess: true,
      reason: "open",
      activeSubscription: null,
      plan: null
    };
  }

  const exception = await UserDealException.findOne({
    where: {
      user_id: userId,
      deal_id: dealId,
      is_active: true,
      [Op.and]: [
        { [Op.or]: [{ valid_from: null }, { valid_from: { [Op.lte]: now } }] },
        { [Op.or]: [{ valid_to: null }, { valid_to: { [Op.gte]: now } }] }
      ]
    }
  });

  if (exception) {
    return {
      hasAccess: true,
      reason: "exception",
      activeSubscription: null,
      plan: null
    };
  }

  const activeSubscription = await getActiveSubscriptionForUser(userId);
  const plan = activeSubscription ? activeSubscription.service : null;
  const planTier = normalizeTier(plan?.tier || plan?.code || plan?.id);

  if (!activeSubscription || !plan) {
    return {
      hasAccess: false,
      reason: "no_subscription",
      activeSubscription: null,
      plan: null
    };
  }

  const dealTier = normalizeTier(deal?.tier || deal?.type);
  const tierRank = { standard: 1, professional: 2 };
  if (dealTier) {
    const requiredLevel = tierRank[dealTier] || 0;
    const planLevel = tierRank[planTier];

    // Only enforce tier comparison if we recognize the plan tier.
    if (requiredLevel > 0 && planLevel !== undefined) {
      if (planLevel < requiredLevel) {
        return {
          hasAccess: false,
          reason: "plan_mismatch",
          activeSubscription,
          plan
        };
      }

      return {
        hasAccess: true,
        reason: "ok",
        activeSubscription,
        plan
      };
    }
  }

  const planWithDeal = await Service.findByPk(plan.id, {
    include: [
      {
        model: Deal,
        through: ServiceDeal,
        where: { id: dealId },
        required: false
      }
    ]
  });

  const mappedDeals = planWithDeal && planWithDeal.deals ? planWithDeal.deals : [];
  const isMapped = mappedDeals.some((d) => d.id === dealId);

  if (!isMapped) {
    return {
      hasAccess: false,
      reason: "plan_mismatch",
      activeSubscription,
      plan
    };
  }

  return {
    hasAccess: true,
    reason: "ok",
    activeSubscription,
    plan
  };
}

module.exports = {
  getActiveSubscriptionForUser,
  checkDealAccessForUser
};
