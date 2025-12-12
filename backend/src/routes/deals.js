const express = require("express");
const router = express.Router();
const { Deal, Unlock, Service, ServiceDeal, Purchase } = require("../models");
const { authMiddleware } = require("../middleware/auth");

// GET /api/deals?userId=...
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || "user_1";
    // fetch deals
    const deals = await Deal.findAll({ order: [["featured", "DESC"], ["createdAt","DESC"]] });

    // find unlocked deal ids for user
    const userUnlocks = await Unlock.findAll({ where: { user_id: userId } });
    const unlockedSet = new Set(userUnlocks.map(u => u.deal_id));

    const annotated = deals.map(d => ({
      id: d.id,
      title: d.title,
      partner: d.partner,
      isUnlocked: unlockedSet.has(d.id),
      featured: d.featured,
      tier: d.tier,
      createdAt: d.createdAt
    }));
    res.json({ deals: annotated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch deals" });
  }
});

// GET /api/deals/:id  (only reveal coupon if unlocked)
router.get("/:id", async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.query.userId || "user_1";

    const deal = await Deal.findByPk(dealId);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    const unlocked = await Unlock.findOne({ where: { user_id: userId, deal_id: dealId } });
    const payload = {
      id: deal.id,
      title: deal.title,
      partner: deal.partner,
      isUnlocked: !!unlocked,
    };

    if (unlocked) {
      // reveal coupon/link if unlocked
      payload.coupon_code = deal.coupon_code;
      payload.link = deal.link;
    }

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch deal" });
  }
});

// POST /api/deals/:id/claim
router.post("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "missing_auth" });

    const deal = await Deal.findByPk(dealId);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    // If there are mapped services for this deal, ensure the user has a completed purchase for one of them
    const mappedServices = await Service.findAll({
      include: [
        {
          model: Deal,
          through: ServiceDeal,
          where: { id: dealId },
          required: true
        }
      ]
    });
    const mappedIds = mappedServices.map((s) => s.id);

    if (mappedIds.length > 0) {
      const purchases = await Purchase.findAll({ where: { user_id: userId, status: "completed" } });
      const purchasedIds = purchases.map((p) => p.service_id);

      if (purchases.length === 0) {
        return res
          .status(403)
          .json({ ok: false, reason: "no_subscription", message: "You need an active subscription to claim this deal." });
      }

      const hasMatchingPlan = purchasedIds.some((sid) => mappedIds.includes(sid));
      if (!hasMatchingPlan) {
        return res
          .status(403)
          .json({ ok: false, reason: "plan_mismatch", message: "This deal is only available on a higher plan." });
      }
    }

    const [unlock] = await Unlock.findOrCreate({
      where: { user_id: userId, deal_id: dealId },
      defaults: { user_id: userId, deal_id: dealId, source: "claim" }
    });

    res.json({
      ok: true,
      deal: {
        id: deal.id,
        title: deal.title,
        partner: deal.partner,
        coupon_code: deal.coupon_code,
        link: deal.link,
        isUnlocked: true
      },
      claim: {
        id: unlock.id,
        status: "success",
        reason: mappedIds.length > 0 ? "ok" : "exception"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed_to_claim" });
  }
});

module.exports = router;
