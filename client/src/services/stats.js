import { api } from './api.js';

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
