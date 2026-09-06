import { USER_ROLE } from "../constants/userRole.js";
import { isAdminKeyValid } from "./requireAdminKey.js";
import { verifyAccessToken } from "./authToken.js";

const readAccessToken = (req) => {
  const authorization = req.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
};

// Admin API-key access is retained for existing admin tooling. Managers must
// use their signed-in access token and can only reach their assigned operations.
export const requireOperationsAccess = (...permissions) => (req, res, next) => {
  if (isAdminKeyValid(req) && req.get("x-admin-key")) {
    req.operationsAuth = { role: USER_ROLE.ADMIN, permissions: [] };
    return next();
  }

  const auth = verifyAccessToken(readAccessToken(req));
  if (!auth) return res.status(403).json({ ok: false, error: { message: "Forbidden" } });

  if (auth.role === USER_ROLE.ADMIN) {
    req.operationsAuth = auth;
    return next();
  }

  const granted = new Set(Array.isArray(auth.permissions) ? auth.permissions : []);
  if (auth.role !== USER_ROLE.MANAGER || !permissions.some((permission) => granted.has(permission))) {
    return res.status(403).json({ ok: false, error: { message: "You do not have permission for this operation" } });
  }

  req.operationsAuth = auth;
  return next();
};

export const assertOperationPermission = (req, permission) => {
  if (req.operationsAuth?.role === USER_ROLE.ADMIN) return true;
  return Array.isArray(req.operationsAuth?.permissions) && req.operationsAuth.permissions.includes(permission);
};

export const requireStaffAccess = (req, res, next) => {
  if (isAdminKeyValid(req) && req.get("x-admin-key")) return next();

  const auth = verifyAccessToken(readAccessToken(req));
  if (!auth || ![USER_ROLE.ADMIN, USER_ROLE.MANAGER].includes(auth.role)) {
    return res.status(403).json({ ok: false, error: { message: "Forbidden" } });
  }

  req.operationsAuth = auth;
  return next();
};
