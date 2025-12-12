const express = require("express");
const router = express.Router();
const { Deal, Unlock, Service, Purchase } = require("../models");
const { authMiddleware, optionalAuthMiddleware } = require("../middleware/auth");

// GET /api/deals (optionally annotates unlocks for authenticated user)
router.get("/", optionalAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const deals = await Deal.findAll({ order: [["featured", "DESC"], ["createdAt","DESC"]] });

    const userUnlocks = userId ? await Unlock.findAll({ where: { user_id: userId } }) : [];
    const unlockedSet = new Set(userUnlocks.map((u) => u.deal_id));

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
router.get("/:id", optionalAuthMiddleware, async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user?.id;

    const deal = await Deal.findByPk(dealId);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    const unlocked = userId ? await Unlock.findOne({ where: { user_id: userId, deal_id: dealId } }) : null;
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
    const userId = req.user.id;
    const dealId = req.params.id;

    const deal = await Deal.findByPk(dealId);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    const existingUnlock = await Unlock.findOne({ where: { user_id: userId, deal_id: dealId } });
    if (existingUnlock) {
      return res.json({
        ok: true,
        claim: { reason: existingUnlock.source || "existing_unlock" },
        deal: {
          id: deal.id,
          title: deal.title,
          partner: deal.partner,
          coupon_code: deal.coupon_code,
          link: deal.link,
          isUnlocked: true
        }
      });
    }

    // Check for active subscription
    const latestPurchase = await Purchase.findOne({
      where: { user_id: userId, status: "completed" },
      order: [["createdAt", "DESC"]],
      include: [{ model: Service, include: [Deal] }]
    });

    if (!latestPurchase) {
      return res.status(403).json({
        ok: false,
        reason: "no_subscription",
        message: "You need an active subscription to claim this deal."
      });
    }

    const service = latestPurchase.service || (await Service.findByPk(latestPurchase.service_id, { include: [Deal] }));
    const mappedDealIds = new Set((service?.deals || []).map((d) => d.id));

    if (!mappedDealIds.has(dealId)) {
      return res.status(403).json({
        ok: false,
        reason: "plan_mismatch",
        message: "This deal requires a higher plan. Please upgrade to Professional."
      });
    }

    const unlock = await Unlock.create({
      user_id: userId,
      deal_id: dealId,
      source: `subscription:${service?.id || latestPurchase.service_id}`
    });

    return res.json({
      ok: true,
      claim: {
        reason: "subscription",
        purchaseId: latestPurchase.id,
        planId: service?.id || latestPurchase.service_id
      },
      deal: {
        id: deal.id,
        title: deal.title,
        partner: deal.partner,
        coupon_code: deal.coupon_code,
        link: deal.link,
        isUnlocked: true,
        unlockId: unlock.id
      }
    });
  } catch (err) {
    console.error("claim failed", err);
    res.status(500).json({ error: "claim_failed" });
  }
});

module.exports = router;
