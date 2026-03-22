export const isAdminKeyValid = (req) => {
  const required = process.env.ADMIN_API_KEY;
  if (!required) return true;
  const provided = req?.get?.("x-admin-key");
  return Boolean(provided && provided === required);
};

export const requireAdminKey = (req, res, next) => {
  if (!isAdminKeyValid(req)) {
    return res.status(403).json({ ok: false, error: { message: "Forbidden" } });
  }

  return next();
};
