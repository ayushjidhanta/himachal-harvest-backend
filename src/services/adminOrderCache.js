import { createHash } from "node:crypto";
import Order from "../model/order-schema.js";

// Orders change more often than products, so this cache is intentionally short-lived.
const CACHE_TTL_MS = 30 * 1000;
let cachedOrders = null;
let pendingOrders = null;
let cacheGeneration = 0;

const calculateEtag = (data) => `\"${createHash("sha256").update(JSON.stringify(data)).digest("base64url")}\"`;

export const getAdminOrders = async () => {
  const now = Date.now();
  if (cachedOrders && now - cachedOrders.createdAt < CACHE_TTL_MS) return cachedOrders;
  if (pendingOrders?.generation === cacheGeneration) return pendingOrders.promise;

  const generationAtStart = cacheGeneration;
  const request = Order.find({}).sort({ createdAt: -1 }).lean().then((data) => {
    const catalog = { data, etag: calculateEtag(data), createdAt: now };
    if (generationAtStart === cacheGeneration) cachedOrders = catalog;
    return catalog;
  });
  pendingOrders = { generation: generationAtStart, promise: request };

  try {
    return await request;
  } finally {
    if (pendingOrders?.promise === request) pendingOrders = null;
  }
};

export const invalidateAdminOrders = () => {
  cacheGeneration += 1;
  cachedOrders = null;
};
