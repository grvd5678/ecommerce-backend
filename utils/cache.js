const CACHE_TTL = 3600;

class CacheService {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl = CACHE_TTL) {
    const expiresAt = Date.now() + ttl * 1000;
    this.store.set(key, { value, expiresAt });
  }

  del(key) {
    this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }
}

const cacheService = new CacheService();

const sanitizeKey = (url) => url.replace(/[^a-zA-Z0-9/_?=&-]/g, "");

const cache =
  (duration = 300) =>
  (req, res, next) => {
    const key = `cache:${sanitizeKey(req.originalUrl)}`;
    const cached = cacheService.get(key);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode === 200) {
        cacheService.set(key, data, duration);
      }
      return originalJson(data);
    };

    next();
  };

export { cache, cacheService };
