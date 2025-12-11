// backend-mysql/src/routes/admin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Deal, Service, User, Unlock, Purchase } = require("../models");

// GET /api/admin/deals
router.get("/deals", async (req, res) => {
  try {
    const deals = await Deal.findAll({ order: [["createdAt","DESC"]] });
    res.json({ deals });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/deals  (body: { id, title, partner, coupon_code, link, locked_by_default, featured, type })
router.post("/deals", async (req, res) => {
  try {
    const {
      id,
      title,
      partner,
      coupon_code,
      link,
      locked_by_default,
      featured,
      type
    } = req.body || {};
    if (!id || !title) return res.status(400).json({ error: "id,title required" });

    const defaults = { title, partner, coupon_code, link };
    if (locked_by_default !== undefined) defaults.locked_by_default = !!locked_by_default;
    if (featured !== undefined) defaults.featured = !!featured;
    if (type) defaults.type = type;

    const [deal, created] = await Deal.findOrCreate({
      where: { id },
      defaults
    });
    if (!created) {
      const updates = { title, partner, coupon_code, link };
      if (locked_by_default !== undefined) updates.locked_by_default = !!locked_by_default;
      if (featured !== undefined) updates.featured = !!featured;
      if (type) updates.type = type;
      await deal.update(updates);
    }
    res.json({ deal });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// PUT /api/admin/deals/:id
router.put("/deals/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const deal = await Deal.findByPk(id);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });
    await deal.update(payload);
    res.json({ deal });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// GET /api/admin/services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["title","ASC"]] });
    res.json({ services });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/map-service  body: { serviceId, dealId }
router.post("/map-service", async (req, res) => {
  try {
    const { serviceId, dealId } = req.body || {};
    if (!serviceId || !dealId) return res.status(400).json({ error: "serviceId,dealId required" });
    const service = await Service.findByPk(serviceId);
    const deal = await Deal.findByPk(dealId);
    if (!service || !deal) return res.status(404).json({ error: "not_found" });
    await service.addDeal(deal);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ["id","email","name","role","createdAt"]});
    res.json({ users });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/unlock (manually unlock a deal for a user) body: { userId, dealId }
router.post("/unlock", async (req, res) => {
  try {
    const { userId, dealId } = req.body || {};
    if (!userId || !dealId) return res.status(400).json({ error: "userId,dealId required" });
    const existing = await Unlock.findOne({ where: { user_id: userId, deal_id: dealId } });
    if (!existing) {
      const rec = await Unlock.create({ user_id: userId, deal_id: dealId, source: "manual_admin" });
      return res.json({ unlocked: rec });
    }
    res.json({ message: "already_unlocked" });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/create-admin body: { email, name, password }
router.post("/create-admin", async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: "email,name,password required" });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "user_exists" });
    const pwdHash = await bcrypt.hash(password, 10);
    const id = `admin_${Date.now()}`;
    const user = await User.create({ id, email, name, role: "admin", password_hash: pwdHash });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// POST /api/admin/simulate-purchase  (body: { userId, serviceId })
router.post("/simulate-purchase", async (req, res) => {
  try {
    const { userId, serviceId } = req.body || {};
    if (!userId || !serviceId) return res.status(400).json({ error: "userId,serviceId required" });
    const purchase = await Purchase.create({
      user_id: userId,
      service_id: serviceId,
      amount: 0,
      status: "completed",
      provider: "admin_simulate"
    });
    const service = await Service.findByPk(serviceId, { include: "deals" });
    // include alias might not be set; fetch deals via association
    const serviceWithDeals = await Service.findByPk(serviceId, { include: { model: require("../models").Deal } });
    const dealsToUnlock = (serviceWithDeals && serviceWithDeals.deals) || [];
    const unlocked = [];
    for (const d of dealsToUnlock) {
      const existing = await Unlock.findOne({ where: { user_id: userId, deal_id: d.id } });
      if (!existing) {
        const rec = await Unlock.create({ user_id: userId, deal_id: d.id, source: `admin_simulate:${purchase.id}` });
        unlocked.push(rec);
      }
    }
    res.json({ unlockedCount: unlocked.length, unlocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// POST /api/admin/purchase (manual add) body: { userId, serviceId, amount, status, provider, provider_payment_id }
router.post("/purchase", async (req, res) => {
  try {
    const { userId, serviceId, amount, status, provider, provider_payment_id } = req.body || {};
    if (!userId || !serviceId) return res.status(400).json({ error: "userId,serviceId required" });
    const purchase = await Purchase.create({
      user_id: userId,
      service_id: serviceId,
      amount: typeof amount === "number" ? amount : 0,
      status: status || "completed",
      provider: provider || "admin_manual",
      provider_payment_id: provider_payment_id || null
    });
    res.json({ purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// DELETE /api/admin/purchase/:id
router.delete("/purchase/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const purchase = await Purchase.findByPk(id);
    if (!purchase) return res.status(404).json({ error: "purchase_not_found" });
    await purchase.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/admin/purchases?userId=&limit=
router.get("/purchases", async (req, res) => {
  try {
    const { userId, limit } = req.query || {};
    const max = Math.min(parseInt(limit || "100", 10) || 100, 500);
    const where = {};
    if (userId) where.user_id = userId;

    const purchases = await Purchase.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: max
    });
    res.json({ purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

module.exports = router;
