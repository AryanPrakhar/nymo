const { v4: uuidv4 } = require('uuid');
const database = require('./database');
const { calculateRankScore, getLocationHash } = require('../utils/algorithms');

class Post {
  static async create({ content, post_type, latitude, longitude, sessionHash, ipHash }) {
    const id = uuidv4();
    const location_hash = getLocationHash(latitude, longitude);
    const rank_score = calculateRankScore({
      upvotes: 0,
      downvotes: 0,
      views: 0,
      created_at: new Date(),
      post_type
    });

    try {
      await database.run(
        `INSERT INTO posts (id, content, post_type, latitude, longitude, location_hash, rank_score)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, content, post_type, latitude, longitude, location_hash, rank_score]
      );

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const post = await database.get(
        'SELECT * FROM posts WHERE id = ?',
        [id]
      );
      return post ? this.formatPost(post) : null;
    } catch (error) {
      throw new Error(`Failed to find post: ${error.message}`);
    }
  }

  static async findByLocation({ latitude, longitude, radius = 2, limit = 20, offset = 0, sort = 'rank' }) {
    try {
      // Calculate bounding box for efficient location filtering
      const latDelta = radius / 69; // Approximate miles to degrees latitude
      const lonDelta = radius / (69 * Math.cos(latitude * Math.PI / 180));

      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLon = longitude - lonDelta;
      const maxLon = longitude + lonDelta;

      let orderClause = 'rank_score DESC, created_at DESC';
      if (sort === 'new') {
        orderClause = 'created_at DESC';
      } else if (sort === 'top') {
        orderClause = '(upvotes - downvotes) DESC, created_at DESC';
      }

      const posts = await database.all(`
        SELECT * FROM posts 
        WHERE latitude BETWEEN ? AND ? 
        AND longitude BETWEEN ? AND ? 
        ORDER BY ${orderClause}
        LIMIT ? OFFSET ?
      `, [minLat, maxLat, minLon, maxLon, limit, offset]);

      return posts.map(post => this.formatPost(post));
    } catch (error) {
      throw new Error(`Failed to find posts by location: ${error.message}`);
    }
  }

  static async updateRankScore(id) {
    try {
      const post = await database.get('SELECT * FROM posts WHERE id = ?', [id]);
      if (!post) return null;

      const rank_score = calculateRankScore({
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        views: post.views,
        created_at: new Date(post.created_at),
        post_type: post.post_type
      });

      await database.run(
        'UPDATE posts SET rank_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rank_score, id]
      );

      return rank_score;
    } catch (error) {
      throw new Error(`Failed to update rank score: ${error.message}`);
    }
  }

  static async incrementViews(id) {
    try {
      await database.run(
        'UPDATE posts SET views = views + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new Error(`Failed to increment views: ${error.message}`);
    }
  }

  static async updateVoteCount(id, upvotes, downvotes) {
    try {
      await database.run(
        'UPDATE posts SET upvotes = ?, downvotes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [upvotes, downvotes, id]
      );
    } catch (error) {
      throw new Error(`Failed to update vote count: ${error.message}`);
    }
  }

  static formatPost(post) {
    const now = new Date();
    const createdAt = new Date(post.created_at);
    const timeDiff = now - createdAt;
    
    return {
      ...post,
      time_ago: this.formatTimeAgo(timeDiff),
      created_at: createdAt.toISOString()
    };
  }

  static formatTimeAgo(timeDiff) {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  static async getStats() {
    try {
      const totalPosts = await database.get('SELECT COUNT(*) as count FROM posts');
      const postsToday = await database.get(`
        SELECT COUNT(*) as count FROM posts 
        WHERE date(created_at) = date('now')
      `);
      const totalVotes = await database.get('SELECT COUNT(*) as count FROM votes');

      return {
        total_posts: totalPosts.count,
        posts_today: postsToday.count,
        total_votes: totalVotes.count
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = Post;
