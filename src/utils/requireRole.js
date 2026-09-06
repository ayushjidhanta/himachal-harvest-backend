import { verifyAccessToken } from "./authToken.js";

export const requireRole = (...roles) => (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const auth = verifyAccessToken(token);

  if (!auth || !roles.includes(auth.role)) {
    return res.status(403).json({ ok: false, error: { message: "Forbidden" } });
  }

  req.auth = auth;
  return next();
};
