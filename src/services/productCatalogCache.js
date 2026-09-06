import { createHash } from "node:crypto";
import Product from "../model/product-schema.js";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedCatalog = null;
let pendingCatalog = null;
let cacheGeneration = 0;

const calculateEtag = (data) => `\"${createHash("sha256").update(JSON.stringify(data)).digest("base64url")}\"`;

export const getProductCatalog = async () => {
  const now = Date.now();
  if (cachedCatalog && now - cachedCatalog.createdAt < CACHE_TTL_MS) return cachedCatalog;
  if (pendingCatalog?.generation === cacheGeneration) return pendingCatalog.promise;

  const generationAtStart = cacheGeneration;
  const request = Product.find({})
    .sort({ updatedAt: -1, id: 1 })
    .lean()
    .then((data) => {
      const catalog = { data, etag: calculateEtag(data), createdAt: now };
      // Do not repopulate this cache with a query that began before a mutation.
      if (generationAtStart === cacheGeneration) cachedCatalog = catalog;
      return catalog;
    });
  pendingCatalog = { generation: generationAtStart, promise: request };

  try {
    return await request;
  } finally {
    if (pendingCatalog?.promise === request) pendingCatalog = null;
  }
};

// Call this immediately after every catalogue mutation. The short TTL is a fallback
// for changes made directly in the database rather than through this API.
export const invalidateProductCatalog = () => {
  cacheGeneration += 1;
  cachedCatalog = null;
};
