import User from "../model/userSchema.js";
import { asTrimmedString, badRequest, isNonEmptyString } from "../utils/validation.js";

const ALLOWED_ROLES = new Set(["User", "Manager", "Admin"]);

const normalizeRole = (role) => {
  const r = asTrimmedString(role);
  if (!isNonEmptyString(r)) return "";
  const key = r.toLowerCase();
  if (key === "partner") return "Manager";
  if (key === "manager") return "Manager";
  if (key === "admin") return "Admin";
  if (key === "user") return "User";
  return r;
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("username email role createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ ok: true, data: users });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const setUserRole = async (req, res) => {
  try {
    const username = asTrimmedString(req.params.username);
    if (!isNonEmptyString(username)) return badRequest(res, "username param is required");

    const role = normalizeRole(req.body?.role);
    if (!ALLOWED_ROLES.has(role)) return badRequest(res, "role must be one of User, Manager, Admin");

    const updated = await User.findOneAndUpdate(
      { username },
      { $set: { role } },
      { new: true }
    )
      .select("username email role createdAt updatedAt")
      .lean();

    if (!updated) return res.status(404).json({ ok: false, error: { message: "User not found" } });
    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};
