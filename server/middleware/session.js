const { generateUniqueSessionId } = require('../utils/security');

/**
 * Session management middleware for anonymous users
 */
function sessionMiddleware(req, res, next) {
  // Check for existing session ID in headers
  let sessionId = req.headers['x-session-id'];
  
  // If no session ID provided, generate a new one
  if (!sessionId) {
    sessionId = generateUniqueSessionId();
    
    // Send the new session ID back to client
    res.setHeader('X-Session-ID', sessionId);
  }
  
  // Store session info in request
  req.session = {
    id: sessionId,
    isNew: !req.headers['x-session-id']
  };
  
  next();
}

/**
 * Require session middleware - ensures session exists
 */
function requireSession(req, res, next) {
  if (!req.session || !req.session.id) {
    return res.status(400).json({
      error: true,
      message: 'Session required',
      status: 400
    });
  }
  
  next();
}

module.exports = {
  sessionMiddleware,
  requireSession
};
