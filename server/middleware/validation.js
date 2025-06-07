const { 
  validatePostContent, 
  validatePostType, 
  formatErrorResponse 
} = require('../utils/security');
const { isValidCoordinates } = require('../utils/algorithms');

/**
 * Validate post creation request
 */
function validateCreatePost(req, res, next) {
  const { content, post_type, latitude, longitude } = req.body;
  
  // Validate content
  const contentValidation = validatePostContent(content);
  if (!contentValidation.valid) {
    return res.status(400).json(formatErrorResponse(contentValidation.error));
  }
  
  // Validate post type
  if (!validatePostType(post_type)) {
    return res.status(400).json(formatErrorResponse(
      'Invalid post type. Must be one of: event, recommendation, alert, question, random'
    ));
  }
  
  // Validate coordinates
  if (!isValidCoordinates(latitude, longitude)) {
    return res.status(400).json(formatErrorResponse(
      'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
    ));
  }
  
  // Store sanitized content
  req.body.content = contentValidation.content;
  
  next();
}

/**
 * Validate vote request
 */
function validateVote(req, res, next) {
  const { vote_type } = req.body;
  const { id } = req.params;
  
  // Validate post ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json(formatErrorResponse('Invalid post ID'));
  }
  
  // Validate vote type
  if (![1, -1, 0].includes(vote_type)) {
    return res.status(400).json(formatErrorResponse(
      'Invalid vote type. Must be 1 (upvote), -1 (downvote), or 0 (remove vote)'
    ));
  }
  
  next();
}

/**
 * Validate location query parameters
 */
function validateLocationQuery(req, res, next) {
  const { latitude, longitude, radius, limit, offset } = req.query;
  
  // Validate required coordinates
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (!isValidCoordinates(lat, lon)) {
    return res.status(400).json(formatErrorResponse(
      'Invalid or missing coordinates'
    ));
  }
  
  // Validate optional parameters
  const parsedRadius = radius ? parseFloat(radius) : 2;
  const parsedLimit = limit ? parseInt(limit) : 20;
  const parsedOffset = offset ? parseInt(offset) : 0;
  
  if (parsedRadius < 0.1 || parsedRadius > 50) {
    return res.status(400).json(formatErrorResponse(
      'Radius must be between 0.1 and 50 miles'
    ));
  }
  
  if (parsedLimit < 1 || parsedLimit > 100) {
    return res.status(400).json(formatErrorResponse(
      'Limit must be between 1 and 100'
    ));
  }
  
  if (parsedOffset < 0) {
    return res.status(400).json(formatErrorResponse(
      'Offset cannot be negative'
    ));
  }
  
  // Store parsed values
  req.query.latitude = lat;
  req.query.longitude = lon;
  req.query.radius = parsedRadius;
  req.query.limit = parsedLimit;
  req.query.offset = parsedOffset;
  
  next();
}

module.exports = {
  validateCreatePost,
  validateVote,
  validateLocationQuery
};
