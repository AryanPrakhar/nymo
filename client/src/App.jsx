import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ComposePost from './components/ComposePost';
import PostsFeed from './components/PostsFeed';
import Footer from './components/Footer';
import LocationPermission from './components/LocationPermission';
import { useLocation } from './hooks/useLocation';
import { usePosts } from './hooks/usePosts';

function App() {
  const { location, loading: locationLoading, error: locationError, refetch: refetchLocation } = useLocation();
  const [sortBy, setSortBy] = useState('rank');
  const [radius, setRadius] = useState(2);
  
  const { 
    posts, 
    loading: postsLoading, 
    error: postsError, 
    hasMore, 
    loadMore, 
    refresh, 
    votePost, 
    addPost 
  } = usePosts({ location, sort: sortBy, radius });

  // Show location permission screen if location is needed
  if (locationError && !location) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LocationPermission onRetry={refetchLocation} error={locationError} />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        location={location}
        sortBy={sortBy}
        setSortBy={setSortBy}
        radius={radius}
        setRadius={setRadius}
        onRefresh={refresh}
      />
      
      <main className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <ComposePost
          location={location}
          onPostCreated={addPost}
          disabled={locationLoading || !location}
        />
        
        <PostsFeed
          posts={posts}
          loading={postsLoading}
          error={postsError}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onVote={votePost}
          onRetry={refresh}
        />
      </main>
      
      <Footer />
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
