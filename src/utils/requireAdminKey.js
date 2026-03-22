export const requireAdminKey = (req, res, next) => {
  const required = process.env.ADMIN_API_KEY;
  if (!required) return next();

  const provided = req.get("x-admin-key");
  if (!provided || provided !== required) {
    return res.status(403).json({ ok: false, error: { message: "Forbidden" } });
  }

  return next();
};
