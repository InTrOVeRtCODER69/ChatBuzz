import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MessageCircle, MoreHorizontal, Heart, Share, Bookmark, Bell, Upload, Image as ImageIcon, Send, Loader2, X } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 

// --- Constants (consider moving to a separate constants file if project grows) ---
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; // Not directly used here, but good practice
const DEFAULT_AVATAR = 'https://via.placeholder.com/40/0A0A0A/FFFFFF?text=NA';
const DEFAULT_COVER_IMAGE = 'https://via.placeholder.com/1200x300/0A0A0A/FFFFFF?text=No+Cover';


const PostPage = () => {
  // Core state management
  const [activeTab, setActiveTab] = useState('Posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // User and profile state
  const [currentUser] = useState({ // Changed to const as it's static mock data
    id: 'current-user-123',
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=40&h=40&fit=crop&crop=face'
  });

  const [profileUser, setProfileUser] = useState({
    id: 'Hitesh',
    name: 'hitesh',
    subtitle: 'Exploring the world through my lens.', // Adjusted for consistency
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=96&h=96&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=300&fit=crop',
    followersCount: 1250,
    followingCount: 840,
    postsCount: 127,
    isFollowing: false
  });

  // Posts and interactions state
  const [posts, setPosts] = useState([
    {
      id: 'post-1',
      userId: 'Hitesh',
      userName: 'hitesh',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=40&h=40&fit=crop&crop=face',
      content: "It was a fun and exciting event to view and experience the majestic mountains of Hawaii! Every turn offered a new breathtaking vista. Truly unforgettable!", // Made content slightly longer for better demo
      images: [
        'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1598711508749-83d3d3c48ec8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
      ],
      likesCount: 42,
      commentsCount: 8,
      sharesCount: 3,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 'post-2',
      userId: 'john-doe',
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf379ab9?w=40&h=40&fit=crop&crop=face',
      content: "Loving the new tech setup! Productivity through the roof. What are your favorite gadgets?",
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
      ],
      likesCount: 120,
      commentsCount: 15,
      sharesCount: 5,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 'post-3',
      userId: 'jane-smith',
      userName: 'Jane Smith',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      content: "Just finished a fantastic book! Highly recommend it to everyone. Any other good reads lately?",
      images: [],
      likesCount: 75,
      commentsCount: 10,
      sharesCount: 2,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
      isLiked: false,
      isBookmarked: true
    }
  ]);

  const [favorites] = useState([
    { id: 'fav-1', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop', alt: 'Autumn leaves' },
    { id: 'fav-2', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop', alt: 'Flowers' }
  ]);

  // API simulation functions (replace with actual API calls)
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate different endpoints
      switch (endpoint) {
        case 'follow':
          return { success: true, isFollowing: !profileUser.isFollowing };
        case 'like':
          return { success: true, newLikeCount: options.currentCount + (options.isLiked ? -1 : 1) };
        case 'bookmark':
          return { success: true, isBookmarked: !options.isBookmarked };
        case 'createPost':
          return {
            success: true,
            post: {
              id: `post-${Date.now()}`,
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatar,
              content: options.content,
              images: options.images || [],
              likesCount: 0,
              commentsCount: 0,
              sharesCount: 0,
              createdAt: new Date().toISOString(),
              isLiked: false,
              isBookmarked: false
            }
          };
        default:
          throw new Error('Unknown endpoint');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profileUser.isFollowing, currentUser]);

  // Event handlers with proper error handling

  const handleFollow = useCallback(async () => {
    try {
      const response = await apiCall('follow');
      if (response.success) {
        setProfileUser(prev => ({
          ...prev,
          isFollowing: response.isFollowing,
          followersCount: prev.followersCount + (response.isFollowing ? 1 : -1)
        }));
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    }
  }, [apiCall]);

  const handleLike = useCallback(async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const response = await apiCall('like', {
        currentCount: post.likesCount,
        isLiked: post.isLiked
      });

      if (response.success) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likesCount: response.newLikeCount }
            : p
        ));
      }

    } catch (err) {
      console.error('Like action failed:', err);

      // Revert UI state on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount + 1 : p.likesCount - 1 }
          : p
      ));
    }
  }, [posts, apiCall]);


  const handleBookmark = useCallback(async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const response = await apiCall('bookmark', { isBookmarked: post.isBookmarked });

      if (response.success) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isBookmarked: response.isBookmarked }
            : p
        ));
      }
    } catch (err) {
      console.error('Bookmark action failed:', err);
      // Revert UI state on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isBookmarked: !p.isBookmarked }
          : p
      ));
    }
  }, [posts, apiCall]);

  const handleCreatePost = useCallback(async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await apiCall('createPost', { content: newPostContent });

      if (response.success) {
        setPosts(prev => [response.post, ...prev]);
        setNewPostContent('');
        setProfileUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
      }
    } catch (err) {
      console.error('Create post failed:', err);
    }
  }, [newPostContent, apiCall, currentUser]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Utility functions
  const formatTimeAgo = useCallback((timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  const formatCount = useCallback((count) => {
    if (count === null || count === undefined) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }, []);

  // Filtered posts for display
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return posts;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.content.toLowerCase().includes(lowerCaseQuery) ||
        post.userName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [posts, searchQuery]);


  // Memoized components for performance
  const PostCard = useMemo(() => React.memo(({ post }) => (
    <motion.article
      layout // Enable layout animations for list changes
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800 rounded-lg p-6 mb-6 shadow-md"
      role="article"
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.userAvatar || DEFAULT_AVATAR}
            alt={`${post.userName}'s avatar`}
            className="w-10 h-10 rounded-full object-cover border border-slate-600"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
          />
          <div>
            <h3 className="font-semibold text-white">{post.userName}</h3>
            <time className="text-xs text-slate-400" dateTime={post.createdAt}>
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </header>

      <div className="mb-4">
        <p className="text-slate-200 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4"> {/* Responsive grid */}
          {post.images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="aspect-[4/3] rounded-lg overflow-hidden"
            >
              <img
                src={img || DEFAULT_COVER_IMAGE}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COVER_IMAGE; }}
              />
            </motion.div>
          ))}
        </div>
      )}

      <footer className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLike(post.id)}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            }`}
            aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{formatCount(post.likesCount)}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-slate-400 hover:text-blue-500 transition-colors duration-200"
            aria-label="View comments"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{formatCount(post.commentsCount)}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-slate-400 hover:text-green-500 transition-colors duration-200"
            aria-label="Share post"
          >
            <Share className="w-5 h-5" />
            <span>{formatCount(post.sharesCount)}</span>
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleBookmark(post.id)}
          disabled={isLoading}
          className={`transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            post.isBookmarked ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'
          }`}
          aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </footer>
    </motion.article>
  )), [handleLike, handleBookmark, formatTimeAgo, formatCount, isLoading]);

  // Error boundary component
  const ErrorMessage = ({ message, onRetry }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4"
    >
      <p className="text-red-400 mb-2">Error: {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-400 hover:text-red-300 underline text-sm"
        >
          Retry
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans antialiased"> {/* Added font-sans and antialiased for consistent styling */}
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-md"
      >
        <div className="flex items-center space-x-4 mb-2 sm:mb-0 w-full sm:w-auto">
          <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">ChatBuzz</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-colors duration-200"
              aria-label="Search"
            />
            <AnimatePresence> {/* AnimatePresence for conditional X button */}
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <nav className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-slate-700 group" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            {/* Simulate notifications */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs animate-pulse ring-2 ring-slate-800" aria-label="New notifications"></span>
            <span className="sr-only group-hover:not-sr-only absolute bg-slate-700 text-white text-xs px-2 py-1 rounded bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Notifications</span>
          </button>
          <img
            src={currentUser.avatar || DEFAULT_AVATAR}
            alt={`${currentUser.name}'s avatar`}
            className="w-8 h-8 rounded-full object-cover border border-slate-600 shadow-sm"
          />
          <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
        </nav>
      </motion.header>

      {/* Hero Section (Cover Image) */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-800"> {/* Adjusted height to match PhotoPage, added bg-slate-800 */}
        <img
          src={profileUser.coverImage || DEFAULT_COVER_IMAGE}
          alt={`${profileUser.name}'s cover`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COVER_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10"> {/* Adjusted top margin to match PhotoPage */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <img
              src={profileUser.avatar || DEFAULT_AVATAR}
              alt={`${profileUser.name}'s profile`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800 shadow-lg ring-4 ring-slate-900" // Added shadow, ring for depth
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
            />
            <div className="pb-2">
              <h1 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-0">{profileUser.name}</h1>
              {profileUser.subtitle && (
                <p className="text-slate-400 text-sm sm:text-base">{profileUser.subtitle}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-slate-400">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center sm:block">
                  <strong className="text-white text-lg sm:text-xl font-bold">{formatCount(profileUser.postsCount)}</strong>
                  <span className="text-slate-400 text-xs sm:text-sm">posts</span>
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="flex flex-col items-center sm:block">
                  <strong className="text-white text-lg sm:text-xl font-bold">{formatCount(profileUser.followersCount)}</strong>
                  <span className="text-slate-400 text-xs sm:text-sm">followers</span>
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} className="flex flex-col items-center sm:block">
                  <strong className="text-white text-lg sm:text-xl font-bold">{formatCount(profileUser.followingCount)}</strong>
                  <span className="text-slate-400 text-xs sm:text-sm">following</span>
                </motion.span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0 pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollow}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold ${
                profileUser.isFollowing
                  ? 'bg-slate-700 text-white hover:bg-slate-600 shadow-md'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              } flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={profileUser.isFollowing ? 'Unfollow user' : 'Follow user'}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{profileUser.isFollowing ? 'Following' : 'Follow'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-200 font-semibold shadow-md"
              aria-label="Message user"
            >
              Message
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap space-x-6 border-b border-slate-700 mb-6 custom-scrollbar" role="tablist">
          {['Posts', 'About', 'Photos', 'Videos', 'Friends'].map((tab) => (
            <motion.button
              key={tab}
    onClick={() => {
      if (tab === 'Friends') {
        navigate('/profile/friends');
      } else if (tab === 'Videos') {
        navigate('/profile/videos');
      } else if (tab === 'Photos') {
        navigate('/profile/photos');
      } else if (tab === 'About') {
        navigate('/profile/about');
      } else {
        setActiveTab(tab);
      }
    }}
              role="tab"
              aria-selected={activeTab === tab}
              className={`py-3 px-1 border-b-2 transition-all duration-300 text-sm sm:text-base font-medium relative group ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="underline" // Framer Motion's shared layout animation
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
        </AnimatePresence>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6"> {/* Adjusted grid for better responsiveness */}
          {/* Left Sidebar */}
          <aside className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-slate-800 rounded-lg p-4 mb-6 shadow-md"
            >
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={profileUser.avatar || DEFAULT_AVATAR}
                  alt={`${profileUser.name}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover border border-slate-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{profileUser.name}</p>
                  {profileUser.subtitle && (
                    <p className="text-xs text-slate-400">{profileUser.subtitle}</p>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white transition-colors" aria-label="More options">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {favorites.length > 0 && (
                <div>
                  <h2 className="font-semibold text-white mb-3">Favorites</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {favorites.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.3, duration: 0.3 }} // Staggered entry
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <img
                          src={item.url || DEFAULT_COVER_IMAGE}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COVER_IMAGE; }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9">
            <AnimatePresence mode="wait"> {/* Use AnimatePresence for tab content transitions */}
              {activeTab === 'Posts' && (
                <motion.div
                  key="posts-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Post Creation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="bg-slate-800 rounded-lg p-4 mb-6 shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={currentUser.avatar || DEFAULT_AVATAR}
                        alt={`${currentUser.name}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="What's on your mind?"
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-400"
                          rows="3"
                          maxLength="500"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-full"
                              aria-label="Add image"
                            >
                              <ImageIcon className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-400 hover:text-green-500 transition-colors p-1 rounded-full"
                              aria-label="Upload file"
                            >
                              <Upload className="w-5 h-5" />
                            </motion.button>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-slate-400">
                              {newPostContent.length}/500
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCreatePost}
                              disabled={!newPostContent.trim() || isLoading}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-md"
                            >
                              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                              <Send className="w-4 h-4" />
                              <span>Post</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Posts Feed */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <h2 className="text-xl font-semibold mb-4 text-white">Posts ({filteredPosts.length})</h2> {/* Adjusted font size and color */}

                    {filteredPosts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[200px] shadow-md"
                      >
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-lg font-medium">No posts found.</p>
                        {searchQuery && (
                          <button onClick={handleClearSearch} className="mt-4 text-blue-400 hover:underline">
                            Clear Search
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div layout className="space-y-6"> {/* Use layout for parent of PostCards */}
                        <AnimatePresence> {/* AnimatePresence for individual PostCard exits */}
                          {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.section>
                </motion.div>
              )}

              
              {/* Other tab content placeholders */}

              {activeTab !== 'Posts' && (
                <motion.div
                  key={`${activeTab}-tab`} // Unique key for AnimatePresence
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-800 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center shadow-md"
                >
                  <h2 className="text-2xl font-bold mb-4 text-white">{activeTab}</h2>
                  <p className="text-slate-400 text-lg">Content for {activeTab} is under construction. Please check back later!</p>
                  <p className="text-slate-500 text-sm mt-2">We're working hard to bring you more exciting features.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};


export default PostPage;