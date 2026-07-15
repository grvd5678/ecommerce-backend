import logger from '../utils/logger.js';

const csrfProtection = (req, res, next) => {
  logger.info(`csrfProtection: checking ${req.method} ${req.url}`);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  const origin = req.headers.origin || req.headers.referer;

  const stateMutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (stateMutatingMethods.includes(req.method)) {
    logger.info(`csrfProtection: Checking CSRF for: ${req.method} ${origin}`);
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      logger.error('csrfProtection: validation failed');
      return res.status(403).json({ message: 'CSRF validation failed: origin not allowed' });
    }
  }

  next();
};

export default csrfProtection;
