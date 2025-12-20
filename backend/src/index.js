const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { sequelize, User, Service, Deal, Unlock, Purchase, AuditLog, ServiceDeal } = require("./models");
const dealsRouter = require("./routes/deals");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const { sendPlanConfirmationEmail } = require("./utils/mailer");

const { authMiddleware, requireRole } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/deals", dealsRouter);

// protected admin routes
app.use("/api/admin", authMiddleware, requireRole("admin"), adminRouter);

// collect email and send plan confirmation
app.post("/api/plan/confirm", async (req, res) => {
  const { email, planId } = req.body || {};
  if (!email || !planId) return res.status(400).json({ error: "email_and_plan_required" });

  try {
    await sendPlanConfirmationEmail({ to: email, planId });
    res.json({ ok: true });
  } catch (err) {
    console.error("plan confirm email failed", err);
    res.status(500).json({ error: "email_failed" });
  }
});

// POST /api/simulate-purchase (keeps existing behavior)
app.post("/api/simulate-purchase", async (req, res) => {
  const { userId, serviceId } = req.body || {};
  if (!userId || !serviceId) return res.status(400).json({ error: "userId and serviceId required" });

  try {
    await sequelize.sync();

    const purchase = await Purchase.create({
      user_id: userId,
      service_id: serviceId,
      amount: 0,
      status: "completed",
      provider: "simulate"
    });

    const service = await Service.findByPk(serviceId, { include: Deal });
    if (!service) return res.status(404).json({ error: "service_not_found" });

    const dealsToUnlock = service.deals || [];

    const unlocked = [];
    for (const d of dealsToUnlock) {
      const existing = await Unlock.findOne({ where: { user_id: userId, deal_id: d.id } });
      if (!existing) {
        const rec = await Unlock.create({ user_id: userId, deal_id: d.id, source: `purchase:${purchase.id}` });
        unlocked.push(rec);
      }
    }

    res.json({ unlockedCount: unlocked.length, unlocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "simulate_failed" });
  }
});

const PORT = process.env.PORT || 4000;
async function start() {
  try {
    await sequelize.authenticate();
    console.log("DB authenticated");
    await sequelize.sync({ alter: true });

    // remove any existing deals and related links for a clean slate
    await Unlock.destroy({ where: {} });
    await ServiceDeal.destroy({ where: {} });
    await Deal.destroy({ where: {} });

    // create default admin if missing (use DEFAULT_ADMIN_PASSWORD)
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2025";
    const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@connecttly.local";
    const DEFAULT_DEMO_PASSWORD = process.env.DEFAULT_DEMO_PASSWORD || "Demo@2025";
    const bcrypt = require("bcrypt");
    const { User } = require("./models");

    const adminEmail = DEFAULT_ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const pwdHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      admin = await User.create({ id: "admin_1", email: adminEmail, name: "Admin", role: "admin", password_hash: pwdHash });
      console.log("Created default admin:", adminEmail);
    } else {
      console.log("Admin exists:", adminEmail);
    }

    // create a default demo user with a known password for quick testing
    const demoEmail = "demo@user.com";
    let demoUser = await User.findOne({ where: { email: demoEmail } });
    if (!demoUser) {
      const pwdHash = await bcrypt.hash(DEFAULT_DEMO_PASSWORD, 10);
      demoUser = await User.create({ id: "user_1", email: demoEmail, name: "Demo User", role: "user", password_hash: pwdHash });
      console.log("Created demo user:", demoEmail);
    } else if (!demoUser.password_hash) {
      // ensure existing demo user has a password so login works
      const pwdHash = await bcrypt.hash(DEFAULT_DEMO_PASSWORD, 10);
      await demoUser.update({ password_hash: pwdHash });
      console.log("Updated demo user password hash.");
    }

    // Ensure any users missing password hashes get one so login succeeds
    const usersWithoutPwd = await User.findAll({ where: { password_hash: null } });
    if (usersWithoutPwd.length) {
      console.log(`Fixing password hashes for ${usersWithoutPwd.length} user(s)`);
      for (const u of usersWithoutPwd) {
        const isAdmin = u.role === "admin";
        const fallback = isAdmin ? DEFAULT_ADMIN_PASSWORD : DEFAULT_DEMO_PASSWORD;
        const pwdHash = await bcrypt.hash(fallback, 10);
        await u.update({ password_hash: pwdHash });
      }
    }

    // Seed the marketplace with benchmark deals
    const [starterService] = await Service.findOrCreate({
      where: { id: "service_connectly_starter" },
      defaults: { title: "Connectly Starter", price: 199 }
    });

    const defaultDeals = [
      {
        id: "deal_notion_50",
        title: "Notion 50% off Pro",
        partner: "Notion",
        type: "coupon",
        coupon_code: "NOTION50",
        link: "https://www.notion.so/",
        locked_by_default: true,
        featured: true,
        tier: "standard"
      },
      {
        id: "deal_aws_100k",
        title: "AWS $100K credits",
        partner: "AWS",
        type: "coupon",
        coupon_code: "AWS100K",
        link: "https://aws.amazon.com/",
        locked_by_default: true,
        featured: true,
        tier: "professional"
      },
      {
        id: "deal_figma_pro",
        title: "Figma Pro for free",
        partner: "Figma",
        type: "coupon",
        coupon_code: "FIGMAFREE",
        link: "https://www.figma.com/",
        locked_by_default: true,
        featured: true,
        tier: "professional"
      },
      {
        id: "deal_hubspot_90",
        title: "HubSpot 90% off",
        partner: "HubSpot",
        type: "coupon",
        coupon_code: "HUBSPOT90",
        link: "https://www.hubspot.com/",
        locked_by_default: true,
        featured: false,
        tier: "professional"
      },
      {
        id: "deal_google_cloud_50k",
        title: "Google Cloud $50K credits",
        partner: "Google Cloud",
        type: "coupon",
        coupon_code: "GCLOUD50K",
        link: "https://cloud.google.com/",
        locked_by_default: true,
        featured: false,
        tier: "professional"
      },
      {
        id: "deal_stripe_2yrs",
        title: "Stripe free 2 years",
        partner: "Stripe",
        type: "coupon",
        coupon_code: "STRIPE2YRS",
        link: "https://stripe.com/",
        locked_by_default: true,
        featured: false,
        tier: "professional"
      },
      {
        id: "deal_slack_6months",
        title: "Slack 6 months free",
        partner: "Slack",
        type: "coupon",
        coupon_code: "SLACK6MO",
        link: "https://slack.com/",
        locked_by_default: true,
        featured: false,
        tier: "standard"
      },
      {
        id: "deal_mongodb_25k",
        title: "MongoDB $25K credits",
        partner: "MongoDB",
        type: "coupon",
        coupon_code: "MONGO25K",
        link: "https://www.mongodb.com/",
        locked_by_default: true,
        featured: false,
        tier: "standard"
      },
      {
        id: "deal_linear_pro",
        title: "Linear Pro free",
        partner: "Linear",
        type: "coupon",
        coupon_code: "LINEARPRO",
        link: "https://linear.app/",
        locked_by_default: true,
        featured: false,
        tier: "standard"
      }
    ];

    const createdDeals = [];
    for (const dealData of defaultDeals) {
      const [deal] = await Deal.findOrCreate({
        where: { id: dealData.id },
        defaults: dealData
      });
      createdDeals.push(deal);
    }

    for (const deal of createdDeals) {
      await starterService.addDeal(deal);
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
start();
