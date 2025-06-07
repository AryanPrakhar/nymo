const database = require('./database');

class View {
  static async create({ post_id, session_hash }) {
    try {
      // Check if user already viewed this post
      const existingView = await database.get(
        'SELECT * FROM views WHERE post_id = ? AND session_hash = ?',
        [post_id, session_hash]
      );

      if (!existingView) {
        // Create new view record
        await database.run(
          'INSERT INTO views (post_id, session_hash) VALUES (?, ?)',
          [post_id, session_hash]
        );

        // Increment post view count
        const Post = require('./Post');
        await Post.incrementViews(post_id);
        await Post.updateRankScore(post_id);

        return { success: true, new_view: true };
      }

      return { success: true, new_view: false };
    } catch (error) {
      throw new Error(`Failed to create view: ${error.message}`);
    }
  }

  static async getPostViewCount(post_id) {
    try {
      const result = await database.get(
        'SELECT COUNT(*) as count FROM views WHERE post_id = ?',
        [post_id]
      );
      
      return result.count;
    } catch (error) {
      throw new Error(`Failed to get view count: ${error.message}`);
    }
  }

  static async hasUserViewed(post_id, session_hash) {
    try {
      const view = await database.get(
        'SELECT 1 FROM views WHERE post_id = ? AND session_hash = ? LIMIT 1',
        [post_id, session_hash]
      );
      
      return !!view;
    } catch (error) {
      throw new Error(`Failed to check if user viewed: ${error.message}`);
    }
  }
}

module.exports = View;
