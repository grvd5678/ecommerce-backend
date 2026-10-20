import Redis from "ioredis";

let redisClient = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || null;

if (redisUrl || process.env.ENABLE_REDIS === "true") {
  try {
    redisClient = new Redis(redisUrl || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Stop reconnecting after 3 failed attempts to avoid console flooding
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 1000);
      },
    });

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log("⚡ [Redis] Connected successfully to caching service");
    });

    redisClient.on("error", (err) => {
      isRedisConnected = false;
      // Graceful degraded mode: app continues running on MongoDB with zero failure
      // Only log once to keep logs clean
      if (err.code !== "ECONNREFUSED") {
        console.warn("⚠️ [Redis] Connection notice:", err.message);
      }
    });

    // Attempt non-blocking connection
    redisClient.connect().catch(() => {
      isRedisConnected = false;
      console.log("ℹ️ [Redis] Running in local offline mode (cache gracefully bypassed to MongoDB)");
    });
  } catch (err) {
    console.warn("⚠️ [Redis] Client initialization skipped:", err.message);
  }
} else {
  console.log("ℹ️ [Redis] Cache service unconfigured. Queries resolve directly via MongoDB.");
}

/**
 * Cache-aside get helper
 */
export const getCachedData = async (key) => {
  if (!redisClient || !isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Cache-aside set helper (with TTL in seconds)
 */
export const setCachedData = async (key, value, ttlSeconds = 300) => {
  if (!redisClient || !isRedisConnected) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch {
    return false;
  }
};

/**
 * Invalidate cache keys matching pattern (e.g. "products:*")
 */
export const invalidateCachePattern = async (pattern) => {
  if (!redisClient || !isRedisConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🧹 [Redis] Invalidated ${keys.length} cached keys matching "${pattern}"`);
    }
  } catch (err) {
    console.warn("⚠️ [Redis] Invalidation notice:", err.message);
  }
};

export default redisClient;
