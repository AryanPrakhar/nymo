const { v4: uuidv4 } = require('uuid');
const database = require('./database');

class Vote {
  static async create({ post_id, session_hash, vote_type, ip_hash }) {
    const id = uuidv4();
    
    try {
      // Check if user already voted on this post
      const existingVote = await database.get(
        'SELECT * FROM votes WHERE post_id = ? AND session_hash = ?',
        [post_id, session_hash]
      );

      if (existingVote) {
        // Update existing vote
        await database.run(
          'UPDATE votes SET vote_type = ?, created_at = CURRENT_TIMESTAMP WHERE post_id = ? AND session_hash = ?',
          [vote_type, post_id, session_hash]
        );
      } else {
        // Create new vote
        await database.run(
          'INSERT INTO votes (id, post_id, session_hash, vote_type, ip_hash) VALUES (?, ?, ?, ?, ?)',
          [id, post_id, session_hash, vote_type, ip_hash]
        );
      }

      // Update post vote counts
      await this.updatePostVoteCounts(post_id);
      
      return { success: true, vote_type };
    } catch (error) {
      throw new Error(`Failed to create/update vote: ${error.message}`);
    }
  }

  static async updatePostVoteCounts(post_id) {
    try {
      const upvotes = await database.get(
        'SELECT COUNT(*) as count FROM votes WHERE post_id = ? AND vote_type = 1',
        [post_id]
      );
      
      const downvotes = await database.get(
        'SELECT COUNT(*) as count FROM votes WHERE post_id = ? AND vote_type = -1',
        [post_id]
      );

      await database.run(
        'UPDATE posts SET upvotes = ?, downvotes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [upvotes.count, downvotes.count, post_id]
      );

      // Update rank score after vote count change
      const Post = require('./Post');
      await Post.updateRankScore(post_id);

      return { upvotes: upvotes.count, downvotes: downvotes.count };
    } catch (error) {
      throw new Error(`Failed to update post vote counts: ${error.message}`);
    }
  }

  static async getUserVote(post_id, session_hash) {
    try {
      const vote = await database.get(
        'SELECT vote_type FROM votes WHERE post_id = ? AND session_hash = ?',
        [post_id, session_hash]
      );
      
      return vote ? vote.vote_type : 0;
    } catch (error) {
      throw new Error(`Failed to get user vote: ${error.message}`);
    }
  }

  static async getPostVotes(post_id) {
    try {
      const upvotes = await database.get(
        'SELECT COUNT(*) as count FROM votes WHERE post_id = ? AND vote_type = 1',
        [post_id]
      );
      
      const downvotes = await database.get(
        'SELECT COUNT(*) as count FROM votes WHERE post_id = ? AND vote_type = -1',
        [post_id]
      );

      return {
        upvotes: upvotes.count,
        downvotes: downvotes.count,
        total: upvotes.count + downvotes.count
      };
    } catch (error) {
      throw new Error(`Failed to get post votes: ${error.message}`);
    }
  }
}

module.exports = Vote;
