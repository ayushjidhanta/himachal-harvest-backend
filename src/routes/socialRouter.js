import express from "express";
import https from "https";

const router = express.Router();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map(); // username -> { ts, data }

const decodeHtml = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const httpsGetText = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );
    req.on("error", reject);
    req.end();
  });

const pickMeta = (html, property) => {
  const p = String(property || "").replace(/"/g, '\\"');
  const re1 = new RegExp(`<meta\\s+property="${p}"\\s+content="([^"]*)"\\s*/?>`, "i");
  const re2 = new RegExp(`<meta\\s+content="([^"]*)"\\s+property="${p}"\\s*/?>`, "i");
  const m = re1.exec(html) || re2.exec(html);
  return decodeHtml(m?.[1] || "");
};

const parseCounts = (ogDescription) => {
  const desc = String(ogDescription || "");
  const m = desc.match(
    /([0-9][0-9.,KM]*)\s+Followers?,\s*([0-9][0-9.,KM]*)\s+Following,\s*([0-9][0-9.,KM]*)\s+Posts?/i
  );
  if (!m) return { followers: "", following: "", posts: "" };
  return { followers: m[1], following: m[2], posts: m[3] };
};

const parseDisplayName = (ogTitle, username) => {
  const title = String(ogTitle || "");
  const handle = String(username || "");
  // Common formats:
  // "Name (@username) • Instagram photos and videos"
  // "Name (@username) on Instagram"
  const m = title.match(/^(.*?)\s*\(@/);
  if (m?.[1]) return m[1].trim();
  return handle;
};

const parseBio = (ogDescription, displayName, username) => {
  const desc = String(ogDescription || "");
  const name = String(displayName || "");
  const handle = String(username || "");

  // Often: "{followers} Followers, {following} Following, {posts} Posts - See Instagram photos and videos from {name} (@{username})"
  const marker = `See Instagram photos and videos from`;
  const idx = desc.toLowerCase().indexOf(marker.toLowerCase());
  if (idx === -1) return "";

  const tail = desc.slice(idx + marker.length).trim();
  // Remove "{name} (@handle)" part if present
  const cleaned = tail
    .replace(new RegExp(`^${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*\\(@${handle}\\)`, "i"), "")
    .trim();

  return cleaned ? cleaned.replace(/^\-+\s*/, "").trim() : "";
};

router.get("/instagram/:username", async (req, res) => {
  const username = String(req.params.username || "").trim().replace(/^@/, "");
  if (!username) return res.status(400).json({ error: { message: "Missing username" } });

  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.json({ data: cached.data, cached: true });
  }

  try {
    const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    const { status, body } = await httpsGetText(url);

    if (!body || status >= 400) {
      return res.status(502).json({ error: { message: `Instagram fetch failed (status ${status || "unknown"})` } });
    }

    const ogTitle = pickMeta(body, "og:title");
    const ogDescription = pickMeta(body, "og:description");
    const ogImage = pickMeta(body, "og:image");

    const displayName = parseDisplayName(ogTitle, username);
    const counts = parseCounts(ogDescription);
    const bio = parseBio(ogDescription, displayName, username);

    const data = {
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      displayName,
      bio,
      profilePicUrl: ogImage,
      ...counts,
    };

    cache.set(username, { ts: Date.now(), data });
    return res.json({ data });
  } catch (err) {
    const msg = err?.message || "Instagram fetch failed";
    return res.status(502).json({ error: { message: msg } });
  }
});

export default router;

