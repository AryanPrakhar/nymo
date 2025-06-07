const crypto = require('crypto');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Generate a session hash for anonymous users
 */
function generateSessionHash() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash an IP address for privacy
 */
function hashIP(ip) {
  const salt = process.env.SESSION_SECRET || 'default-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

/**
 * Hash a session ID for database storage
 */
function hashSession(sessionId) {
  const salt = process.env.SESSION_SECRET || 'default-salt';
  return crypto.createHash('sha256').update(sessionId + salt).digest('hex');
}

/**
 * Sanitize user input content
 */
function sanitizeContent(content) {
  if (typeof content !== 'string') {
    return '';
  }
  
  // Remove HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(content, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Trim whitespace and normalize
  return sanitized.trim().replace(/\s+/g, ' ');
}

/**
 * Validate post content
 */
function validatePostContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }
  
  const sanitized = sanitizeContent(content);
  
  if (sanitized.length < 1) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (sanitized.length > 2000) {
    return { valid: false, error: 'Content must be 2000 characters or less' };
  }
  
  return { valid: true, content: sanitized };
}

/**
 * Validate post type
 */
function validatePostType(postType) {
  const validTypes = ['event', 'recommendation', 'alert', 'question', 'random'];
  return validTypes.includes(postType);
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

/**
 * Generate a unique session ID for new users
 */
function generateUniqueSessionId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
}

/**
 * Check if content appears to be spam
 */
function isSpamContent(content) {
  const spamIndicators = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\//gi, // URLs (basic check)
    /\b(buy|sale|discount|offer|deal|free|win|prize|click|visit)\b/gi, // Spam keywords
  ];
  
  return spamIndicators.some(pattern => pattern.test(content));
}

/**
 * Rate limiting helper
 */
function createRateLimiter(windowMs, maxRequests) {
  const requests = new Map();
  
  return (identifier) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(time => time > windowStart);
      if (filtered.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, filtered);
      }
    }
    
    // Check current requests
    const userRequests = requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(identifier, recentRequests);
    
    return true;
  };
}

/**
 * Format error response
 */
function formatErrorResponse(message, status = 400, details = null) {
  return {
    error: true,
    message,
    status,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response
 */
function formatSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateSessionHash,
  hashIP,
  hashSession,
  sanitizeContent,
  validatePostContent,
  validatePostType,
  getClientIP,
  generateUniqueSessionId,
  isSpamContent,
  createRateLimiter,
  formatErrorResponse,
  formatSuccessResponse
};
