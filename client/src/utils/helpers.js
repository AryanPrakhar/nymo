// Location utilities
export const locationUtils = {
  // Get user's current position
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject(new Error(message));
        },
        defaultOptions
      );
    });
  },

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Default location (NYC) for demo purposes
  getDefaultLocation() {
    return {
      latitude: 40.7128,
      longitude: -74.0060
    };
  }
};

// Post utilities
export const postUtils = {
  // Get post type display information
  getPostTypeInfo(type) {
    const types = {
      event: { icon: '📅', label: 'Event', color: 'text-blue-600' },
      recommendation: { icon: '⭐', label: 'Recommendation', color: 'text-green-600' },
      alert: { icon: '⚠️', label: 'Alert', color: 'text-red-600' },
      question: { icon: '❓', label: 'Question', color: 'text-purple-600' },
      random: { icon: '💭', label: 'Random', color: 'text-gray-600' }
    };
    return types[type] || types.random;
  },

  // Validate post content
  validateContent(content) {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Content is required' };
    }
    
    const trimmed = content.trim();
    
    if (trimmed.length < 1) {
      return { valid: false, error: 'Content cannot be empty' };
    }
    
    if (trimmed.length > 2000) {
      return { valid: false, error: 'Content must be 2000 characters or less' };
    }
    
    return { valid: true };
  },

  // Format time ago
  formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  }
};

// Utility functions
export const utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Safe JSON parse
  safeJsonParse(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  },

  // Clamp number between min and max
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
};
