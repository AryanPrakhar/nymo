import React, { useEffect, useRef, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import PostCard from './PostCard';
import LoadingSpinner from './LoadingSpinner';

function PostsFeed({ posts, loading, error, hasMore, onLoadMore, onVote, onRetry }) {
  const loadMoreRef = useRef();

  // Intersection observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [handleObserver]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load posts
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💭</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No posts in your area yet
        </h3>
        <p className="text-gray-600">
          Be the first to share something with your community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          onVote={onVote}
          className={index === 0 ? 'post-enter-active' : ''}
        />
      ))}

      {/* Loading indicator for initial load */}
      {loading && posts.length === 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loading && posts.length > 0 && <LoadingSpinner />}
        </div>
      )}

      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
}

export default PostsFeed;
