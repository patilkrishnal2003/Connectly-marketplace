const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, Purchase, Service } = require("../models");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRES_IN = "7d"; // adjust as needed
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@connecttly.local";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2025";

// POST /api/auth/register
// Body: { id (optional), email, name, password }
router.post("/register", async (req, res) => {
  try {
    const { id, email, name, password } = req.body || {};
    const normalizedEmail = (email || "").toLowerCase().trim();
    if (!normalizedEmail || !name || !password) return res.status(400).json({ error: "email,name,password required" });

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: "user_exists" });

    const pwdHash = await bcrypt.hash(password, 10);
    const userId = id || `user_${Date.now()}`;
    const user = await User.create({ id: userId, email: normalizedEmail, name, password_hash: pwdHash, role: "user" });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "register_failed" });
  }
});

// POST /api/auth/login
// Body: { email, password } OR { id, password } (identifier can be email or id)
router.post("/login", async (req, res) => {
  try {
    const { email, id, password } = req.body || {};
    const identifier = (email || id || "").trim();
    if (!identifier || !password) return res.status(400).json({ error: "email_or_id,password required" });

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    // Fallback for default admin (ensures access even if DB is empty)
    if ((identifier === DEFAULT_ADMIN_EMAIL || identifier === "admin_1") && password === DEFAULT_ADMIN_PASSWORD) {
      const token = jwt.sign({ userId: "admin_1", role: "admin", email: DEFAULT_ADMIN_EMAIL }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
      return res.json({ token, user: { id: "admin_1", email: DEFAULT_ADMIN_EMAIL, name: "Admin", role: "admin" } });
    }

    const orClause = [];
    if (normalizedEmail) orClause.push({ email: normalizedEmail });
    if (identifier) {
      orClause.push({ id: identifier });
      orClause.push({ email: identifier }); // fallback in case stored email casing differs
    }

    const user = await User.findOne({
      where: {
        [Op.or]: orClause
      }
    });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    // If password hash missing, set it now to the provided password
    if (!user.password_hash) {
      const newHash = await bcrypt.hash(password, 10);
      await user.update({ password_hash: newHash });
    }

    let ok = await bcrypt.compare(password, user.password_hash || "");

    // If admin is using the default admin password, accept and refresh hash
    if (!ok && user.role === "admin" && password === DEFAULT_ADMIN_PASSWORD) {
      const newHash = await bcrypt.hash(password, 10);
      await user.update({ password_hash: newHash });
      ok = true;
    }

    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login_failed" });
  }
});

// POST /api/auth/claim-check
// Body: { email }
// If user exists, return token + latest subscription info. Otherwise exists:false.
router.post("/claim-check", async (req, res) => {
  try {
    const normalizedEmail = (req.body?.email || "").toLowerCase().trim();
    if (!normalizedEmail) return res.status(400).json({ error: "email required" });

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.json({ exists: false });

    const latestPurchase = await Purchase.findOne({
      where: { user_id: user.id, status: "completed" },
      order: [["createdAt", "DESC"]]
    });

    let subscription = null;
    if (latestPurchase) {
      const svc = await Service.findByPk(latestPurchase.service_id);
      if (svc) {
        subscription = {
          serviceId: svc.id,
          title: svc.title,
          purchasedAt: latestPurchase.createdAt
        };
      }
    }

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({
      exists: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      subscription
    });
  } catch (err) {
    console.error("claim-check failed", err);
    // Soft-fail so the UI can prompt for registration instead of hard error
    res.json({ exists: false, error: "claim_check_failed" });
  }
});

module.exports = router;
