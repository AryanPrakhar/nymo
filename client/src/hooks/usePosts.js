import { useState, useEffect, useCallback } from 'react';
import { postsService } from '../services/posts';
import { utils } from '../utils/helpers';

export function usePosts({ location, sort = 'rank', radius = 2 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const limit = 20;

  const fetchPosts = useCallback(async (reset = false) => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const offset = reset ? 0 : page * limit;
      const response = await postsService.getPosts({
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        limit,
        offset,
        sort
      });

      if (response.success) {
        const newPosts = response.data.posts;
        
        if (reset) {
          setPosts(newPosts);
          setPage(1);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(response.data.pagination.has_more);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, sort, radius, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && location) {
      fetchPosts(false);
    }
  }, [loading, hasMore, location, fetchPosts]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const votePost = useCallback(async (postId, voteType) => {
    try {
      const response = await postsService.votePost(postId, voteType);
      
      if (response.success) {
        // Update the post in the local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, ...response.data.post, user_vote: response.data.vote_type }
            : post
        ));
        return true;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }, []);

  const addPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  // Reset when location or sort changes
  useEffect(() => {
    if (location) {
      refresh();
    }
  }, [location, sort, radius]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    votePost,
    addPost
  };
}
