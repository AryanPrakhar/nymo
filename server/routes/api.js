const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/security');

/**
 * GET /api/health - Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json(formatSuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  }, 'Service is healthy'));
});

/**
 * GET /api/stats - Basic platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Post.getStats();
    
    res.json(formatSuccessResponse({
      ...stats,
      last_updated: new Date().toISOString()
    }, 'Statistics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(formatErrorResponse('Failed to fetch statistics', 500));
  }
});

module.exports = router;
