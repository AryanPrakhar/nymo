import React, { useState, useEffect } from 'react';
import { statsService } from '../services/stats';

function Footer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        // Stats are not critical, fail silently
        console.warn('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-feed mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Stats */}
          {stats && (
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.total_posts}</div>
                <div>Total Posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.posts_today}</div>
                <div>Today</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.total_votes}</div>
                <div>Votes</div>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a 
              href="#about" 
              className="hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              About
            </a>
            <a 
              href="#privacy" 
              className="hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <a 
              href="#contact" 
              className="hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Contact
            </a>
          </div>
        </div>        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            Nymo - Anonymous, location-based community updates. 
            Your location is used only to show relevant content and is never stored.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
