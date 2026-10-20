import { getCachedData, setCachedData } from "../config/redis.js";

/**
 * Express Caching Middleware (Cache-Aside Pattern)
 * @param {number} ttlSeconds - Time-To-Live for cache entry (default: 5 minutes)
 * @param {string} prefix - Custom key prefix (default: "cache")
 */
export const cacheResponse = (ttlSeconds = 300, prefix = "cache") => {
  return async (req, res, next) => {
    // Only cache safe GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-TTL", `${ttlSeconds}s`);
        return res.json(cached);
      }
    } catch (err) {
      console.warn("Cache read bypass:", err.message);
    }

    // Cache MISS: Intercept response to write to Redis
    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body) {
        setCachedData(cacheKey, body, ttlSeconds).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
};
