const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// authMiddleware: if token present, set req.user; else 401
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "missing_token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// requireRole(role): returns middleware that checks req.user.role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "missing_auth" });
    if (req.user.role !== role) return res.status(403).json({ error: "forbidden" });
    return next();
  };
}

module.exports = { authMiddleware, requireRole };
