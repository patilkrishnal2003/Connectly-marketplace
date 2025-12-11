const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Deal, Service, ServiceDeal, User, Unlock, Purchase } = require("../models");

// GET /api/admin/deals
router.get("/deals", async (req, res) => {
  try {
    const deals = await Deal.findAll({ order: [["createdAt","DESC"]] });
    res.json({ deals });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/deals  (body: { id, title, partner, coupon_code, link, locked_by_default })
router.post("/deals", async (req, res) => {
  try {
    const { id, title, partner, coupon_code, link, locked_by_default } = req.body || {};
    if (!id || !title) return res.status(400).json({ error: "id,title required" });
    const [deal, created] = await Deal.findOrCreate({
      where: { id },
      defaults: { title, partner, coupon_code, link, locked_by_default: !!locked_by_default }
    });
    if (!created) {
      await deal.update({ title, partner, coupon_code, link, locked_by_default: !!locked_by_default });
    }
    res.json({ deal });
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

// GET /api/admin/services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["createdAt","DESC"]] });
    res.json({ services });
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

// POST /api/admin/create-admin  body: { email, name, password }
router.post("/create-admin", async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    const normalizedEmail = (email || "").toLowerCase().trim();
    if (!normalizedEmail || !name || !password) return res.status(400).json({ error: "email,name,password required" });

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: "user_exists" });

    const pwdHash = await bcrypt.hash(password, 10);
    const adminId = `admin_${Date.now()}`;
    const adminUser = await User.create({ id: adminId, email: normalizedEmail, name, password_hash: pwdHash, role: "admin" });
    res.json({ user: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role } });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/simulate-purchase body: { userId, serviceId }
router.post("/simulate-purchase", async (req, res) => {
  try {
    const { userId, serviceId } = req.body || {};
    if (!userId || !serviceId) return res.status(400).json({ error: "userId,serviceId required" });

    const service = await Service.findByPk(serviceId, { include: Deal });
    if (!service) return res.status(404).json({ error: "service_not_found" });

    const purchase = await Purchase.create({
      user_id: userId,
      service_id: serviceId,
      amount: 0,
      status: "completed",
      provider: "simulate"
    });

    const unlocked = [];
    for (const d of service.deals || []) {
      const existing = await Unlock.findOne({ where: { user_id: userId, deal_id: d.id } });
      if (!existing) {
        const rec = await Unlock.create({ user_id: userId, deal_id: d.id, source: `purchase:${purchase.id}` });
        unlocked.push(rec);
      }
    }
    res.json({ unlockedCount: unlocked.length, unlocked });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

module.exports = router;
