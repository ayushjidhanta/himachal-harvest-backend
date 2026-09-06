import User from "../model/userSchema.js";
import { asTrimmedString, badRequest, isNonEmptyString } from "../utils/validation.js";
import { USER_ROLE, USER_ROLE_VALUES } from "../constants/userRole.js";
import { MANAGER_PERMISSION_VALUES } from "../constants/managerPermission.js";

const ALLOWED_ROLES = new Set(USER_ROLE_VALUES);
const ALLOWED_MANAGER_PERMISSIONS = new Set(MANAGER_PERMISSION_VALUES);

const normalizeRole = (role) => {
  const r = asTrimmedString(role);
  if (!isNonEmptyString(r)) return "";
  const key = r.toLowerCase();
  if (key === "partner" || key === "deliverypartner" || key === "delivery_partner") return USER_ROLE.DELIVERY_PARTNER;
  if (key === "manager") return USER_ROLE.MANAGER;
  if (key === "admin") return USER_ROLE.ADMIN;
  if (key === "user") return USER_ROLE.USER;
  return r;
};

const normalizeManagerPermissions = (permissions) => {
  if (permissions === undefined) return null;
  if (!Array.isArray(permissions)) return undefined;
  const normalized = [...new Set(permissions.map((permission) => asTrimmedString(permission)).filter(Boolean))];
  if (normalized.some((permission) => !ALLOWED_MANAGER_PERMISSIONS.has(permission))) return undefined;
  return normalized;
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("username email role permissions createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ ok: true, data: users });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const listDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: USER_ROLE.DELIVERY_PARTNER })
      .select("username email")
      .sort({ username: 1 })
      .lean();
    return res.status(200).json({ ok: true, data: partners });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const setUserRole = async (req, res) => {
  try {
    const username = asTrimmedString(req.params.username);
    if (!isNonEmptyString(username)) return badRequest(res, "username param is required");

    const role = normalizeRole(req.body?.role);
    if (!ALLOWED_ROLES.has(role)) return badRequest(res, "role must be one of User, Manager, Admin, DeliveryPartner");

    const requestedPermissions = normalizeManagerPermissions(req.body?.permissions);
    if (requestedPermissions === undefined) {
      return badRequest(res, "permissions must contain only valid manager permissions");
    }

    const targetUser = await User.findOne({ username }).select("role permissions").lean();
    if (!targetUser) return res.status(404).json({ ok: false, error: { message: "User not found" } });

    // Role updates are available to the administrative user-management endpoint,
    // but Admin accounts themselves are protected from demotion or reassignment.
    if (targetUser.role === USER_ROLE.ADMIN) {
      return res.status(403).json({
        ok: false,
        error: { message: "Admin roles are protected and cannot be changed from the Users portal" },
      });
    }

    const permissions = role === USER_ROLE.MANAGER ? (requestedPermissions ?? targetUser.permissions ?? []) : [];
    const updated = await User.findOneAndUpdate(
      { username },
      { $set: { role, permissions } },
      { new: true }
    )
      .select("username email role permissions createdAt updatedAt")
      .lean();

    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};
