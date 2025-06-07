const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Vote = require('../models/Vote');
const View = require('../models/View');
const { 
  validateCreatePost, 
  validateVote, 
  validateLocationQuery 
} = require('../middleware/validation');
const { postLimiter, voteLimiter } = require('../middleware/rateLimiting');
const { requireSession } = require('../middleware/session');
const { 
  getClientIP, 
  hashIP, 
  hashSession,
  formatErrorResponse,
  formatSuccessResponse
} = require('../utils/security');

/**
 * GET /api/posts - Retrieve ranked posts by location
 */
router.get('/', validateLocationQuery, async (req, res) => {
  try {
    const { latitude, longitude, radius, limit, offset, sort = 'rank' } = req.query;
    
    const posts = await Post.findByLocation({
      latitude,
      longitude,
      radius,
      limit,
      offset,
      sort
    });

    // Add user's vote status if session exists
    if (req.session?.id) {
      const sessionHash = hashSession(req.session.id);
      
      for (const post of posts) {
        try {
          post.user_vote = await Vote.getUserVote(post.id, sessionHash);
        } catch (error) {
          post.user_vote = 0;
        }
      }
    }

    res.json(formatSuccessResponse({
      posts,
      pagination: {
        total: posts.length,
        limit,
        offset,
        has_more: posts.length === limit
      }
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json(formatErrorResponse('Failed to fetch posts', 500));
  }
});

/**
 * POST /api/posts - Create new post
 */
router.post('/', postLimiter, requireSession, validateCreatePost, async (req, res) => {
  try {
    const { content, post_type, latitude, longitude } = req.body;
    const sessionHash = hashSession(req.session.id);
    const ipHash = hashIP(getClientIP(req));

    const post = await Post.create({
      content,
      post_type,
      latitude,
      longitude,
      sessionHash,
      ipHash
    });

    res.status(201).json(formatSuccessResponse(post, 'Post created successfully'));
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json(formatErrorResponse('Failed to create post', 500));
  }
});

/**
 * GET /api/posts/:id - Get single post details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json(formatErrorResponse('Post not found', 404));
    }

    // Add user's vote status if session exists
    if (req.session?.id) {
      const sessionHash = hashSession(req.session.id);
      try {
        post.user_vote = await Vote.getUserVote(post.id, sessionHash);
      } catch (error) {
        post.user_vote = 0;
      }
    }

    res.json(formatSuccessResponse(post));
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json(formatErrorResponse('Failed to fetch post', 500));
  }
});

/**
 * POST /api/posts/:id/vote - Vote on post
 */
router.post('/:id/vote', voteLimiter, requireSession, validateVote, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;
    const sessionHash = hashSession(req.session.id);
    const ipHash = hashIP(getClientIP(req));

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json(formatErrorResponse('Post not found', 404));
    }

    // Create/update vote
    const voteResult = await Vote.create({
      post_id: id,
      session_hash: sessionHash,
      vote_type,
      ip_hash: ipHash
    });

    // Get updated post data
    const updatedPost = await Post.findById(id);

    res.json(formatSuccessResponse({
      vote_type: voteResult.vote_type,
      post: updatedPost
    }, 'Vote recorded successfully'));
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json(formatErrorResponse('Failed to record vote', 500));
  }
});

/**
 * POST /api/posts/:id/view - Track post view
 */
router.post('/:id/view', requireSession, async (req, res) => {
  try {
    const { id } = req.params;
    const sessionHash = hashSession(req.session.id);

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json(formatErrorResponse('Post not found', 404));
    }

    // Record view
    const viewResult = await View.create({
      post_id: id,
      session_hash: sessionHash
    });

    res.json(formatSuccessResponse({
      new_view: viewResult.new_view
    }, 'View recorded'));
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json(formatErrorResponse('Failed to record view', 500));
  }
});

module.exports = router;
