const express = require("express");
const router = express.Router();
const { Deal, Unlock, DealClaim } = require("../models");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { checkDealAccessForUser } = require("../utils/subscriptionAccess");

function normalizeTier(value) {
  const str = (value || "").toString().toLowerCase();
  if (!str) return null;
  if (["pro", "professional", "premium"].some((token) => str.includes(token))) return "professional";
  if (["standard", "basic", "starter"].some((token) => str.includes(token))) return "standard";
  return str;
}

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
      partner: d.partner || "",
      isUnlocked: unlockedSet.has(d.id),
      featured: d.featured,
      locked_by_default: d.locked_by_default,
      tier: d.tier,
      type: d.type,
      link: d.link,
      coupon_code: d.coupon_code,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }));
    res.json({ deals: annotated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch deals" });
  }
});

// POST /api/deals (admin only)
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const {
      id,
      title,
      partner,
      coupon_code,
      link,
      locked_by_default,
      featured,
      type,
      tier
    } = req.body || {};
    if (!id || !title) return res.status(400).json({ error: "id,title required" });

    const normalizedTier = normalizeTier(tier);
    const normalizedType = type ? type.toString().toLowerCase() : null;

    const defaults = {
      title,
      partner: partner || null,
      coupon_code: coupon_code || null,
      link: link || null,
      locked_by_default: locked_by_default !== undefined ? !!locked_by_default : true,
      featured: featured !== undefined ? !!featured : false
    };
    if (normalizedType) defaults.type = normalizedType;
    if (normalizedTier) defaults.tier = normalizedTier;

    const [deal, created] = await Deal.findOrCreate({
      where: { id },
      defaults
    });

    if (!created) {
      const updates = {
        title,
        partner: partner || null,
        coupon_code: coupon_code || null,
        link: link || null
      };
      if (locked_by_default !== undefined) updates.locked_by_default = !!locked_by_default;
      if (featured !== undefined) updates.featured = !!featured;
      if (normalizedType) updates.type = normalizedType;
      if (normalizedTier) updates.tier = normalizedTier;
      await deal.update(updates);
    }

    res.json({ deal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// PUT /api/deals/:id (admin only)
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const id = req.params.id;
    const deal = await Deal.findByPk(id);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    const {
      title,
      partner,
      coupon_code,
      link,
      locked_by_default,
      featured,
      type,
      tier
    } = req.body || {};

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (partner !== undefined) updates.partner = partner || null;
    if (coupon_code !== undefined) updates.coupon_code = coupon_code || null;
    if (link !== undefined) updates.link = link || null;
    if (locked_by_default !== undefined) updates.locked_by_default = !!locked_by_default;
    if (featured !== undefined) updates.featured = !!featured;

    const normalizedType = type ? type.toString().toLowerCase() : null;
    const normalizedTier = normalizeTier(tier);
    if (normalizedType) updates.type = normalizedType;
    if (normalizedTier) updates.tier = normalizedTier;

    await deal.update(updates);
    res.json({ deal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// DELETE /api/deals/:id (admin only)
router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const id = req.params.id;
    const deal = await Deal.findByPk(id);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    await Unlock.destroy({ where: { deal_id: id } });
    await DealClaim.destroy({ where: { deal_id: id } });
    await deal.destroy();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
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
