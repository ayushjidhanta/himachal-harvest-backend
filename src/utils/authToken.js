import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const getSecret = () => process.env.AUTH_TOKEN_SECRET || "development-only-change-me";
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (value) => createHmac("sha256", getSecret()).update(value).digest("base64url");

export const createAccessToken = ({ userId, role, permissions = [] }) => {
  const payload = {
    sub: String(userId),
    role,
    permissions,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encode(payload);
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifyAccessToken = (token) => {
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.sub || !payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
