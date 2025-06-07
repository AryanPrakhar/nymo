import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { postUtils } from '../utils/helpers';
import { postsService } from '../services/posts';

function PostCard({ post, onVote, className = '' }) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const postTypeInfo = postUtils.getPostTypeInfo(post.post_type);
  const userVote = post.user_vote || 0;

  // Track view when post is visible
  React.useEffect(() => {
    if (!hasViewed) {
      const timer = setTimeout(() => {
        postsService.viewPost(post.id);
        setHasViewed(true);
      }, 2000); // Track view after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [post.id, hasViewed]);

  const handleVote = async (voteType) => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(post.id, voteType);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  const netScore = post.upvotes - post.downvotes;

  return (
    <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        {/* Post header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${postTypeInfo.color} bg-gray-100`}>
              <span className="mr-1">{postTypeInfo.icon}</span>
              {postTypeInfo.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.time_ago}</span>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* Upvote button */}
            <button
              onClick={() => handleVote(userVote === 1 ? 0 : 1)}
              disabled={isVoting}
              className={`p-2 rounded-lg transition-colors ${
                userVote === 1
                  ? 'bg-green-100 text-green-600'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Upvote"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Vote score */}
            <span className={`px-2 py-1 text-sm font-medium ${
              netScore > 0 
                ? 'text-green-600' 
                : netScore < 0 
                  ? 'text-red-600' 
                  : 'text-gray-500'
            }`}>
              {netScore > 0 ? '+' : ''}{netScore}
            </span>

            {/* Downvote button */}
            <button
              onClick={() => handleVote(userVote === -1 ? 0 : -1)}
              disabled={isVoting}
              className={`p-2 rounded-lg transition-colors ${
                userVote === -1
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Downvote"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Post stats */}
          <div className="text-xs text-gray-500">
            {post.upvotes} up • {post.downvotes} down
          </div>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
