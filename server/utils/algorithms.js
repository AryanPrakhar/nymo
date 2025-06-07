const geohash = require('ngeohash');

/**
 * Calculate post ranking score based on votes, views, time, and content type
 */
function calculateRankScore({ upvotes, downvotes, views, created_at, post_type }) {
  const now = new Date();
  const hoursAge = (now - new Date(created_at)) / (1000 * 60 * 60);
  
  // Base score calculation
  const time_decay = Math.pow(hoursAge + 2, -1.5);
  const vote_score = upvotes - downvotes;
  const engagement_score = Math.log(views + 1);
  const base_rank = (vote_score + engagement_score) * time_decay;
  
  // Content type multipliers
  const typeMultipliers = {
    'alert': 2.0,
    'event': 1.5,
    'question': 1.2,
    'recommendation': 1.0,
    'random': 0.8
  };
  
  const type_multiplier = typeMultipliers[post_type] || 1.0;
  
  // Quality adjustments
  let quality_multiplier = 1.0;
  
  // Velocity bonus: Recent votes in last hour
  const recentVoteBonus = (upvotes + downvotes > 2 && hoursAge < 1) ? 1.3 : 1.0;
  
  // Controversy bonus: High engagement
  const total_votes = upvotes + downvotes;
  const controversy_bonus = (total_votes > 5 && Math.min(upvotes, downvotes) / total_votes > 0.3) ? 1.2 : 1.0;
  
  // Spam penalty: Too many downvotes
  const spam_penalty = (total_votes > 0 && downvotes / total_votes > 0.7) ? 0.5 : 1.0;
  
  quality_multiplier = recentVoteBonus * controversy_bonus * spam_penalty;
  
  const final_rank = base_rank * type_multiplier * quality_multiplier;
  
  return Math.max(0, final_rank);
}

/**
 * Generate location hash for geographic grouping
 */
function getLocationHash(latitude, longitude, precision = 7) {
  return geohash.encode(latitude, longitude, precision);
}

/**
 * Calculate distance between two coordinates in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Determine appropriate radius based on area density
 */
function getLocationRadius(latitude, longitude) {
  // This is a simplified implementation
  // In a real app, you'd query population density data
  
  // Default to suburban radius
  return 2; // miles
}

/**
 * Get neighboring geohashes for boundary posts
 */
function getNeighboringHashes(latitude, longitude, precision = 7) {
  const baseHash = geohash.encode(latitude, longitude, precision);
  const neighbors = geohash.neighbors(baseHash);
  
  return [baseHash, ...Object.values(neighbors)];
}

/**
 * Validate geographic coordinates
 */
function isValidCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

module.exports = {
  calculateRankScore,
  getLocationHash,
  calculateDistance,
  getLocationRadius,
  getNeighboringHashes,
  isValidCoordinates
};
