export const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const asTrimmedString = (value) => (typeof value === "string" ? value.trim() : "");

export const isValidEmail = (value) => {
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

export const badRequest = (res, message, details = undefined) =>
  res.status(400).json({ ok: false, error: { message, details } });

