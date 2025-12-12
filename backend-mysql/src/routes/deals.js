const express = require("express");
const router = express.Router();
const { Deal, Unlock, DealClaim } = require("../models");
const { authMiddleware } = require("../middleware/auth");
const { checkDealAccessForUser } = require("../utils/subscriptionAccess");

// GET /api/deals?userId=...
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || "user_1";
    const deals = await Deal.findAll({ order: [["featured", "DESC"], ["title", "ASC"]] });

    const userUnlocks = await Unlock.findAll({ where: { user_id: userId } });
    const unlockedSet = new Set(userUnlocks.map((u) => u.deal_id));

    const annotated = deals.map((d) => ({
      id: d.id,
      title: d.title,
      partner: d.partner,
      isUnlocked: unlockedSet.has(d.id),
      featured: d.featured,
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
      isUnlocked: !!unlocked
    };

    if (unlocked) {
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
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: "missing_auth" });

    const deal = await Deal.findByPk(dealId);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    const access = await checkDealAccessForUser(userId, dealId, deal);
    if (!access.hasAccess) {
      const status =
        access.reason === "plan_mismatch" ? "blocked_plan_mismatch" : "blocked_no_subscription";
      await DealClaim.create({
        user_id: userId,
        deal_id: dealId,
        status,
        claim_source: "web"
      });
      const friendly =
        access.reason === "plan_mismatch"
          ? "This deal is only available on a higher plan."
          : "You need an active subscription to claim this deal.";
      return res.status(403).json({ ok: false, reason: access.reason, message: friendly });
    }

    await Unlock.findOrCreate({
      where: { user_id: userId, deal_id: dealId },
      defaults: {
        user_id: userId,
        deal_id: dealId,
        source: access.reason === "exception" ? "exception" : "subscription"
      }
    });

    const claim = await DealClaim.create({
      user_id: userId,
      deal_id: dealId,
      status: "success",
      claim_source: "web",
      coupon_code_shown: deal.coupon_code,
      link_shown: deal.link
    });

    res.json({
      ok: true,
      deal: {
        id: deal.id,
        title: deal.title,
        partner: deal.partner,
        coupon_code: deal.coupon_code,
        link: deal.link
      },
      claim: { id: claim.id, status: claim.status, reason: access.reason }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed_to_claim" });
  }
});

module.exports = router;
