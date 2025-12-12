const express = require("express");
const router = express.Router();
const { Deal, Unlock, Service, ServiceDeal } = require("../models");

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

module.exports = router;
