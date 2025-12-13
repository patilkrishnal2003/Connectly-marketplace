require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Op } = require("sequelize");
const { sequelize, User, Service } = require("./models");
const bcrypt = require("bcrypt");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const dealsRoutes = require("./routes/deals");
const { authMiddleware, requireRole } = require("./middleware/auth");
const { sendPlanConfirmationEmail } = require("./utils/mailer");

const app = express();
app.disable("x-powered-by");

// CORS (locked to env if provided to avoid breaking existing behavior)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));
// Handle preflight requests before auth guards so browser fetches with Authorization work in dev/prod
app.options("*", cors());
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
});

// Simple in-memory rate limiter (per IP + path)
function createRateLimiter({ windowMs = 60_000, max = 30 }) {
  const hits = new Map();
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const bucket = hits.get(key) || [];
    const recent = bucket.filter(ts => ts > windowStart);
    recent.push(now);
    hits.set(key, recent);
    if (recent.length > max) {
      return res.status(429).json({ error: "rate_limited", retryAfterMs: windowMs });
    }
    next();
  };
}
const strictLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const PORT = process.env.PORT || 4000;

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", authMiddleware, requireRole("admin"), adminRoutes);
// expose deals under /api/deals (and keep /api for backward compat)
app.use("/api/deals", dealsRoutes);
app.use("/api", dealsRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// PLAN CONFIRMATION EMAIL
app.post("/api/plan/confirm", strictLimiter, async (req, res) => {
  const { email, planId } = req.body || {};
  if (!email || !planId) return res.status(400).json({ error: "email_and_plan_required" });
  try {
    const result = await sendPlanConfirmationEmail({ to: email, planId });
    if (result?.skipped) {
      return res.status(400).json({ error: result.reason || "smtp_not_configured" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("plan confirm email failed", err);
    res.status(500).json({ error: "email_failed", detail: err.message });
  }
});

app.get("/confirm", async (req, res) => {
  const plan = req.query.plan || req.query.planId || "your plan";
  const email = req.query.email || "your email";
  const razorpayLink = process.env.PAYMENT_RAZORPAY_LINK;
  const stripeCheckout = process.env.PAYMENT_STRIPE_LINK;
  const upiId = process.env.PAYMENT_UPI_ID || "connecttly@okaxis";

  let amountPaise = null;
  try {
    const service = await Service.findOne({
      where: {
        [Op.or]: [{ id: plan }, { code: plan }, { tier: plan }]
      }
    });
    if (service) {
      const cents =
        Number.isFinite(service.price_cents) && service.price_cents > 0
          ? service.price_cents
          : Math.round((Number(service.price) || 0) * 100);
      if (cents > 0) amountPaise = cents;
    }
  } catch (err) {
    console.error("Failed to load plan amount", err);
  }

  const appendParams = (base, { includeAmount } = {}) => {
    try {
      const u = new URL(base);
      u.searchParams.set("plan", plan);
      u.searchParams.set("email", email);
      if (includeAmount && amountPaise) {
        u.searchParams.set("amount", String(amountPaise));
        if (!u.searchParams.get("currency")) {
          u.searchParams.set("currency", "INR");
        }
      }
      return u.toString();
    } catch (err) {
      return base;
    }
  };

  // If a gateway link is configured, redirect straight there
  if (razorpayLink) {
    return res.redirect(appendParams(razorpayLink, { includeAmount: true }));
  }
  if (stripeCheckout) {
    return res.redirect(appendParams(stripeCheckout));
  }

  // No gateway configured: return a clear error
  res.status(400).json({
    error: "payment_gateway_not_configured",
    message: "Set PAYMENT_RAZORPAY_LINK or PAYMENT_STRIPE_LINK in backend .env to redirect to your gateway."
  });
});

// START SERVER WITH RETRIES
async function start() {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`Attempt ${attempts}/${maxAttempts}: Connecting to DB...`);
      await sequelize.authenticate();
      console.log("Database connected.");

      // Keep schema in sync with models so admin panel sees latest tables/columns
      await sequelize.sync({ alter: true });
      console.log("Models synced (altered).");

      // CREATE DEFAULT ADMIN IF NOT EXISTS
      const adminEmail = "admin@connecttly.local";
      const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2025";

      let admin = await User.findOne({ where: { email: adminEmail } });

      if (!admin) {
        const hash = await bcrypt.hash(adminPass, 10);
        await User.create({
          id: "admin_1",
          email: adminEmail,
          name: "Admin",
          role: "admin",
          password_hash: hash
        });
        console.log("Default admin created.");
      } else {
        console.log("Admin already exists.");
      }

      // START THE SERVER
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
      return; // SUCCESS
    } catch (err) {
      console.error(`Attempt failed:`, err.message);

      if (attempts === maxAttempts) {
        console.error("Max attempts reached. Server failed.");
        process.exit(1);
      }

      console.log("Retrying in 5 seconds...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// CALL START()
start();
