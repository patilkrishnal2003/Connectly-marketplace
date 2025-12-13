// backend-mysql/src/routes/admin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  Deal,
  Service,
  User,
  Unlock,
  Purchase,
  UserSubscription,
  DealClaim,
  UserDealException,
  ServiceDeal
} = require("../models");

function normalizeTier(value) {
  const str = (value || "").toString().toLowerCase();
  if (!str) return null;
  if (["pro", "professional", "premium"].some((token) => str.includes(token))) return "professional";
  if (["standard", "basic", "starter"].some((token) => str.includes(token))) return "standard";
  return str;
}

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
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// PUT /api/admin/deals/:id
router.put("/deals/:id", async (req, res) => {
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
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// DELETE /api/admin/deals/:id
router.delete("/deals/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deal = await Deal.findByPk(id);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    await Unlock.destroy({ where: { deal_id: id } });
    await DealClaim.destroy({ where: { deal_id: id } });
    await ServiceDeal.destroy({ where: { deal_id: id } });
    await deal.destroy();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/admin/services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["title","ASC"]] });
    res.json({ services });
  } catch (err) { console.error(err); res.status(500).json({ error: "failed" }); }
});

// POST /api/admin/services  (create or update a subscription plan)
router.post("/services", async (req, res) => {
  try {
    const {
      id,
      title,
      price,
      price_cents,
      description,
      billing_interval,
      is_active,
      code,
      tier
    } = req.body || {};
    if (!id || !title) return res.status(400).json({ error: "id,title required" });

    const payload = {
      title,
      description: description || null
    };

    const allowedIntervals = ["monthly", "yearly"];
    if (billing_interval && allowedIntervals.includes(billing_interval)) {
      payload.billing_interval = billing_interval;
    }
    const normalizedTier = normalizeTier(tier || code || id);
    if (code !== undefined && code !== null && code !== "") {
      payload.code = code.toString().toLowerCase();
    } else if (normalizedTier) {
      payload.code = normalizedTier;
    }
    if (normalizedTier) payload.tier = normalizedTier;
    if (price !== undefined && price !== null && price !== "") payload.price = Number(price) || 0;
    if (price_cents !== undefined && price_cents !== null && price_cents !== "") {
      payload.price_cents = Number(price_cents);
    }
    if (is_active !== undefined) payload.is_active = !!is_active;

    const [service, created] = await Service.findOrCreate({
      where: { id },
      defaults: { id, ...payload }
    });
    if (!created) {
      await service.update(payload);
    }
    res.json({ service, created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// PUT /api/admin/services/:id  (update subscription plan)
router.put("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ error: "service_not_found" });

    const {
      title,
      price,
      price_cents,
      description,
      billing_interval,
      is_active,
      code,
      tier
    } = req.body || {};

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (billing_interval !== undefined && ["monthly", "yearly"].includes(billing_interval)) {
      updates.billing_interval = billing_interval;
    }
    if (price !== undefined && price !== null && price !== "") updates.price = Number(price) || 0;
    if (price_cents !== undefined && price_cents !== null && price_cents !== "") {
      updates.price_cents = Number(price_cents);
    }
    if (is_active !== undefined) updates.is_active = !!is_active;
    const normalizedTier = normalizeTier(tier || code);
    if (code !== undefined && code !== null && code !== "") updates.code = code.toString().toLowerCase();
    if (normalizedTier) updates.tier = normalizedTier;

    await service.update(updates);
    res.json({ service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
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

// DELETE /api/admin/deals/:id
router.delete("/deals/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deal = await Deal.findByPk(id);
    if (!deal) return res.status(404).json({ error: "deal_not_found" });

    await ServiceDeal.destroy({ where: { deal_id: id } });
    await Unlock.destroy({ where: { deal_id: id } });
    await DealClaim.destroy({ where: { deal_id: id } });
    await UserDealException.destroy({ where: { deal_id: id } });

    await deal.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const includeSubscriptions = req.query.includeSubscriptions === "true" || req.query.includeSubscriptions === "1";
    const users = await User.findAll({
      attributes: ["id", "email", "name", "role", "createdAt"],
      include: includeSubscriptions
        ? [
            {
              model: UserSubscription,
              required: false,
              attributes: ["id", "plan_id", "status", "started_at", "expires_at", "createdAt", "updatedAt", "source"],
              include: [
                {
                  model: Service,
                  attributes: ["id", "title", "code", "tier", "billing_interval"]
                }
              ]
            }
          ]
        : []
    });
    res.json({ users });
  } catch (err) {
    console.error("admin /users failed", err);
    res.status(500).json({ error: "failed_to_list_users", detail: err.message });
  }
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

// POST /api/admin/users
router.post("/users", async (req, res) => {
  try {
    const { email, name, password, role } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: "email,name,password required" });
    const normalizedRole = role === "admin" ? "admin" : "user";
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "user_exists" });
    const pwdHash = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}`;
    const user = await User.create({ id, email, name, role: normalizedRole, password_hash: pwdHash });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// PUT /api/admin/users/:id
router.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, role, password } = req.body || {};
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role === "admin" ? "admin" : "user";
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    await user.update(updates);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const currentAdminId = req.user?.userId || req.user?.id;
    if (currentAdminId === id) return res.status(400).json({ error: "cannot_delete_self" });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "user_not_found" });
    if (user.role === "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });
      if (adminCount <= 1) return res.status(400).json({ error: "cannot_delete_last_admin" });
    }
    await user.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// POST /api/admin/users/:id/subscriptions
router.post("/users/:id/subscriptions", async (req, res) => {
  try {
    const userId = req.params.id;
    const { planId, status, startedAt, expiresAt, source } = req.body || {};
    if (!planId) return res.status(400).json({ error: "planId required" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const existing = await UserSubscription.findOne({
      where: { user_id: userId, plan_id: planId, status: "active" }
    });

    if (existing) {
      await existing.update({
        status: status || existing.status,
        started_at: startedAt || existing.started_at,
        expires_at: expiresAt || existing.expires_at,
        source: source || existing.source
      });
      return res.json({ subscription: existing, refreshed: true });
    }

    const subscription = await UserSubscription.create({
      user_id: userId,
      plan_id: planId,
      status: status || "active",
      started_at: startedAt || new Date(),
      expires_at: expiresAt || null,
      source: source || "admin_grant"
    });

    res.json({ subscription, refreshed: false });
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
    const existingSubscription = await UserSubscription.findOne({
      where: { user_id: userId, plan_id: serviceId, status: "active" }
    });
    if (!existingSubscription) {
      await UserSubscription.create({
        user_id: userId,
        plan_id: serviceId,
        status: "active",
        started_at: new Date(),
        expires_at: null,
        source: "online_purchase"
      });
    }
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
    if ((purchase.status || "").toLowerCase() === "completed") {
      const existingSubscription = await UserSubscription.findOne({
        where: { user_id: userId, plan_id: serviceId, status: "active" }
      });
      if (!existingSubscription) {
        await UserSubscription.create({
          user_id: userId,
          plan_id: serviceId,
          status: "active",
          started_at: new Date(),
          expires_at: null,
          source: "manual"
        });
      }
    }
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

// POST /api/admin/deal-exceptions
router.post("/deal-exceptions", async (req, res) => {
  try {
    const { userId, dealId, sourceNote, validFrom, validTo, isActive } = req.body || {};
    if (!userId || !dealId) return res.status(400).json({ error: "userId,dealId required" });

    const exception = await UserDealException.create({
      user_id: userId,
      deal_id: dealId,
      source_note: sourceNote || null,
      valid_from: validFrom || null,
      valid_to: validTo || null,
      is_active: typeof isActive === "boolean" ? isActive : true,
      created_by_admin_id: req.user?.userId || req.user?.id || null
    });

    res.json({ exception });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/admin/deal-exceptions
router.get("/deal-exceptions", async (req, res) => {
  try {
    const { userId, dealId } = req.query || {};
    const where = {};
    if (userId) where.user_id = userId;
    if (dealId) where.deal_id = dealId;

    const exceptions = await UserDealException.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });

    res.json({ exceptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// PATCH /api/admin/deal-exceptions/:id
router.patch("/deal-exceptions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const exception = await UserDealException.findByPk(id);
    if (!exception) return res.status(404).json({ error: "not_found" });

    const { isActive, validFrom, validTo, sourceNote } = req.body || {};
    const updates = {};
    if (isActive !== undefined) updates.is_active = !!isActive;
    if (validFrom !== undefined) updates.valid_from = validFrom;
    if (validTo !== undefined) updates.valid_to = validTo;
    if (sourceNote !== undefined) updates.source_note = sourceNote;

    await exception.update(updates);
    res.json({ exception });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/admin/deal-claims
router.get("/deal-claims", async (req, res) => {
  try {
    const { userId, dealId, limit } = req.query || {};
    const max = Math.min(parseInt(limit || "100", 10) || 100, 500);
    const where = {};
    if (userId) where.user_id = userId;
    if (dealId) where.deal_id = dealId;

    const claims = await DealClaim.findAll({
      where,
      include: [
        { model: User, attributes: ["email", "id"] },
        { model: Deal, attributes: ["id", "title"] }
      ],
      order: [["createdAt", "DESC"]],
      limit: max
    });

    res.json({ claims });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

module.exports = router;
