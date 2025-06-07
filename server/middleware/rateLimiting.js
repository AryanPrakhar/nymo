const rateLimit = require('express-rate-limit');
const { getClientIP, hashIP, createRateLimiter } = require('../utils/security');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: true,
    message: 'Too many requests, please try again later.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return hashIP(getClientIP(req));
  }
});

// Strict rate limiting for post creation
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.POST_RATE_LIMIT_MAX) || 5,
  message: {
    error: true,
    message: 'Post limit exceeded. You can create up to 5 posts per hour.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use session hash if available, otherwise IP
    const sessionHash = req.headers['x-session-id'] || req.session?.id;
    return sessionHash ? `session_${sessionHash}` : `ip_${hashIP(getClientIP(req))}`;
  }
});

// Voting rate limiter
const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 votes per minute
  message: {
    error: true,
    message: 'Voting too fast. Please slow down.',
    status: 429
  },
  keyGenerator: (req) => {
    const sessionHash = req.headers['x-session-id'] || req.session?.id;
    return sessionHash ? `vote_${sessionHash}` : `vote_ip_${hashIP(getClientIP(req))}`;
  }
});

module.exports = {
  apiLimiter,
  postLimiter,
  voteLimiter
};
