const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRES_IN = "7d"; // adjust as needed

// POST /api/auth/register
// Body: { id (optional), email, name, password }
router.post("/register", async (req, res) => {
  try {
    const { id, email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: "email,name,password required" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "user_exists" });

    const pwdHash = await bcrypt.hash(password, 10);
    const userId = id || `user_${Date.now()}`;
    const user = await User.create({ id: userId, email, name, password_hash: pwdHash, role: "user" });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "register_failed" });
  }
});

// POST /api/auth/login
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email,password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login_failed" });
  }
});

module.exports = router;
