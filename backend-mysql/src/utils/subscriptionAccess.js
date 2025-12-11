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
        attributes: ["id", "title", "code", "billing_interval"]
      }
    ],
    order: [
      ["started_at", "DESC"],
      ["createdAt", "DESC"]
    ]
  });

  return subscription || null;
}

async function checkDealAccessForUser(userId, dealId) {
  const now = new Date();

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

  if (!activeSubscription || !plan) {
    return {
      hasAccess: false,
      reason: "no_subscription",
      activeSubscription: null,
      plan: null
    };
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
