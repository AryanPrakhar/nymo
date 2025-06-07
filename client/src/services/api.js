import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session management
class SessionManager {
  constructor() {
    this.sessionId = this.getStoredSessionId() || this.generateSessionId();
    this.storeSessionId(this.sessionId);
  }

  generateSessionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }
  getStoredSessionId() {
    return localStorage.getItem('nymo_session_id');
  }

  storeSessionId(sessionId) {
    localStorage.setItem('nymo_session_id', sessionId);
    this.sessionId = sessionId;
  }

  getSessionId() {
    return this.sessionId;
  }
}

const sessionManager = new SessionManager();

// Request interceptor to add session ID
api.interceptors.request.use(
  (config) => {
    config.headers['X-Session-ID'] = sessionManager.getSessionId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session updates
api.interceptors.response.use(
  (response) => {
    // Check if server sent a new session ID
    const newSessionId = response.headers['x-session-id'];
    if (newSessionId && newSessionId !== sessionManager.getSessionId()) {
      sessionManager.storeSessionId(newSessionId);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please slow down.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
);

export { api, sessionManager };
