import React, { useState } from 'react';
import { Send, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { postsService } from '../services/posts';
import { postUtils } from '../utils/helpers';

function ComposePost({ location, onPostCreated, disabled }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('random');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    { value: 'event', label: 'Event', icon: '📅' },
    { value: 'recommendation', label: 'Recommendation', icon: '⭐' },
    { value: 'alert', label: 'Alert', icon: '⚠️' },
    { value: 'question', label: 'Question', icon: '❓' },
    { value: 'random', label: 'Random', icon: '💭' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Location is required to post');
      return;
    }

    const validation = postUtils.validateContent(content);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await postsService.createPost({
        content: content.trim(),
        post_type: postType,
        latitude: location.latitude,
        longitude: location.longitude
      });

      if (response.success) {
        toast.success('Post created successfully!');
        setContent('');
        setIsExpanded(false);
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsExpanded(true);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsExpanded(false);
  };

  const characterCount = content.length;
  const maxCharacters = 2000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder={disabled ? "Enable location to post..." : "What's happening in your area?"}
            disabled={disabled || isSubmitting}
            className={`w-full resize-none border-0 focus:ring-0 placeholder-gray-400 text-gray-900 ${
              isExpanded ? 'h-24' : 'h-12'
            } transition-all duration-200`}
            style={{ outline: 'none' }}
          />
          
          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Post type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {postTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPostType(type.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        postType === type.value
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character count and location indicator */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {location ? 'Location detected' : 'No location'}
                  </span>
                </div>
                
                <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!content.trim() || isOverLimit || isSubmitting || disabled}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ComposePost;
