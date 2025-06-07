import { api } from './api.js';

export const postsService = {
  // Get posts by location
  async getPosts({ latitude, longitude, radius = 2, limit = 20, offset = 0, sort = 'rank' }) {
    try {
      const response = await api.get('/posts', {
        params: {
          latitude,
          longitude,
          radius,
          limit,
          offset,
          sort
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  // Create a new post
  async createPost({ content, post_type, latitude, longitude }) {
    try {
      const response = await api.post('/posts', {
        content,
        post_type,
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  },

  // Get a single post
  async getPost(id) {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  },

  // Vote on a post
  async votePost(id, vote_type) {
    try {
      const response = await api.post(`/posts/${id}/vote`, { vote_type });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to vote');
    }
  },

  // Track post view
  async viewPost(id) {
    try {
      const response = await api.post(`/posts/${id}/view`);
      return response.data;
    } catch (error) {
      // Views are not critical, so we don't throw errors
      console.warn('Failed to track view:', error.message);
      return null;
    }
  }
};

export const statsService = {
  // Get platform statistics
  async getStats() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Health check
  async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Service unavailable');
    }
  }
};
