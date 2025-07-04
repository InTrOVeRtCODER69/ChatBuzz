import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Home, User, Heart, Users, Share2, Camera, Video,
  MessageCircle, MoreHorizontal, Bell, Settings, Plus, Send,
  Bookmark, TrendingUp, Hash, Globe, X, CheckCircle, AlertCircle,
  Loader2, RefreshCw, ImageIcon, Smile, MapPin, Calendar,
  Eye, UserPlus, UserMinus, Edit3, Trash2, Flag, Copy, ExternalLink
} from 'lucide-react';

// Constants
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

const TOAST_DURATION = 4000;
const DEBOUNCE_DELAY = 300;
const POSTS_PER_PAGE = 10;

// Utility functions
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return time.toLocaleDateString();
};

const validatePostContent = (content) => {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
};

// Custom hooks
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Components
const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Bell
  };
  
  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600'
  };
  
  const Icon = icons[toast.type] || Bell;
  
  return (
     <div className={`animate-slide-in-right ${colors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <Toast key={toast.id} toast={toast} onRemove={onRemove} />
    ))}
  </div>
);

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
  );
};

const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">Please refresh the page to try again</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

const ChatBuzzDashboard = () => {
  // State management
  const [activeSection, setActiveSection] = useState('Home');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [newPostText, setNewPostText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({
    id: 'user-1',
    name: 'Hitesh Gai',
    username: 'hiteshxg',
    avatar: 'H',
    verified: true
  });

  // Hooks
  const navigate = useNavigate();
  const { apiCall, loading, error } = useApi();
  const { toasts, showToast, removeToast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const newPostRef = useRef(null);

  // Navigation items
  const sidebarItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: TrendingUp, path: '/explore' },
    { name: 'Messages', icon: MessageCircle, path: '/chat' },
    { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { name: 'Profile', icon: User, path: '/profile-feed' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  // Mock data
  const mockPosts = useMemo(() => [
    {
      id: '1',
      user: { 
        id: 'user-2',
        name: 'Navneet', 
        username: 'navneet', 
        avatar: '👨‍💼',
        verified: true
      },
      content: 'Let him cook!',
      type: 'text',
      likes: 24,
      comments: 8,
      shares: 3,
      views: 156,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 'San Francisco, CA',
      hashtags: ['#project', '#teamwork', '#excited']
    },
    {
      id: '2',
      user: { 
        id: 'user-3',
        name: 'Aryan G', 
        username: 'aryan_g', 
        avatar: '👩‍💼',
        verified: true
      },
      content: 'Leetcode Grinding💦',
      type: 'text',
      likes: 42,
      comments: 12,
      shares: 7,
      views: 289,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      hashtags: ['#mindfulness', '#grateful']
    },
    {
      id: '3',
      user: { 
        id: 'user-4',
        name: 'Shailaj', 
        username: 'shailaj_g',
        avatar: '👨‍🎨',
        verified: false
      },
      content: 'Javascript💦',
      type: 'images',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop',
      ],
      likes: 95,
      comments: 34,
      shares: 21,
      views: 512,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      hashtags: ['#passion']
    }
  ], []);

  const recentChats = [
    { id: '1', name: 'Navneet', username: 'navneet', avatar: '👨‍💻', online: true, lastMessage: 'finish this project fast', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { id: '2', name: 'Keshav ', username: 'keshav', avatar: '👨‍🦱', online: false, lastMessage: 'Thanks for the help!', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  ];

  const notifications = [
    {
      id: '1',
      user: { id: 'user-5', name: 'Ex', username: 'Hitesh_ex', avatar: '👩‍💼' },
      action: 'requested to follow you',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'follow_request',
      read: false
    },
    {
      id: '2',
      user: { id: 'user-6', name: 'Ex', username: 'Hitesh_ex', avatar: '👩‍💼' },
      action: 'liked your post',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'like',
      read: false
    },
    {
      id: '3',
      user: { id: 'user-7', name: 'Ex', username: 'hitesh_ex ', avatar: '👩‍💼' },
      action: 'commented on your post',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'comment',
      read: true
    }
  ];

  // API functions
  const fetchPosts = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      
      // Simulate API call
      const response = await new Promise(resolve => {
        setTimeout(() => {
          const startIndex = (page - 1) * POSTS_PER_PAGE;
          const endIndex = startIndex + POSTS_PER_PAGE;
          const paginatedPosts = mockPosts.slice(startIndex, endIndex);
          
          resolve({
            posts: paginatedPosts,
            hasMore: endIndex < mockPosts.length,
            total: mockPosts.length
          });
        }, 1000);
      });
      
      if (refresh || page === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMorePosts(response.hasMore);
      setCurrentPage(page);
      
      if (refresh) {
        showToast('Posts refreshed successfully', 'success');
      }
    } catch (err) {
      showToast(`Failed to fetch posts: ${err.message}`, 'error');
    } finally {
      if (refresh) setRefreshing(false);
    }
  }, [mockPosts, showToast]);

  const createPost = useCallback(async (content, type = 'text', attachments = []) => {
    if (!validatePostContent(content)) {
      showToast('Please enter valid content (1-2000 characters)', 'error');
      return false;
    }

    try {
      const newPost = {
        id: `post-${Date.now()}`,
        user: user,
        content: content.trim(),
        type,
        attachments,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        timestamp: new Date().toISOString(),
        hashtags: content.match(/#\w+/g) || []
      };

      setPosts(prev => [newPost, ...prev]);
      showToast('Post created successfully', 'success');
      return true;
    } catch (err) {
      showToast(`Failed to create post: ${err.message}`, 'error');
      return false;
    }
  }, [user, showToast]);

  const toggleLike = useCallback(async (postId) => {
    try {
      const isLiked = likedPosts.has(postId);
      
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
          : post
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      showToast('Failed to update like', 'error');
    }
  }, [likedPosts, showToast]);

  const toggleBookmark = useCallback(async (postId) => {
    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      
      setBookmarkedPosts(prev => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      showToast(
        isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        'success'
      );
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  }, [bookmarkedPosts, showToast]);

  const handleShare = useCallback(async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content,
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        showToast('Link copied to clipboard', 'success');
      }

      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      ));
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast('Failed to share post', 'error');
      }
    }
  }, [posts, showToast]);

  // Event handlers
  const handleNavigation = useCallback((item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveSection(item.name);
    }
  }, [navigate]);

  const handleNewPost = useCallback(async () => {
    if (!newPostText.trim()) return;
    
    const success = await createPost(newPostText);
    if (success) {
      setNewPostText('');
      setShowNewPost(false);
    }
  }, [newPostText, createPost]);

  const handleRefresh = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (hasMorePosts && !loading) {
      fetchPosts(currentPage + 1);
    }
  }, [hasMorePosts, loading, currentPage, fetchPosts]);

  // Search functionality
  useEffect(() => {
    if (!debouncedSearch) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post => 
      post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );

    setFilteredPosts(filtered);
  }, [debouncedSearch, posts]);

  // Initialize data
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Auto-focus new post
  useEffect(() => {
    if (showNewPost && newPostRef.current) {
      newPostRef.current.focus();
    }
  }, [showNewPost]);

  // Components
const PostCard = React.memo(({ post }) => {
    const isLiked = likedPosts.has(post.id);
    const isBookmarked = bookmarkedPosts.has(post.id);
    const [imageError, setImageError] = useState(false);

    return (
      <article className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 animate-fade-in">
        <header className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg to-blue-300 rounded-full flex items-center justify-center text-lg shadow-lg transform transition-transform duration-300 hover:scale-105">
            {post.user.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold hover:text-blue-400 cursor-pointer transition-colors transform hover:translate-x-1">
                {post.user.name}
              </h3>
              {post.user.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500 animate-fade-in" />
              )}

            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.timestamp)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3 animate-fade-in transform transition-transform duration-200 hover:scale-110" />
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors group transform hover:scale-110">
              <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </header>
        
        <div className="mb-4">
          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
              {post.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors transform hover:scale-105"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {post.type === 'images' && post.images && !imageError && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Post image ${idx + 1}`}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ))}
          </div>
        )}
        
        <footer className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => toggleLike(post.id)}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 transform scale-105' 
                  : 'text-gray-400 hover:text-red-400 transform hover:scale-110'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            
            <button 
              onClick={() => handleShare(post.id)}
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors transform hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>
          
          <button 
            onClick={() => toggleBookmark(post.id)}
            className={`transition-all duration-200 ${
              isBookmarked 
                ? 'text-yellow-400 transform scale-105' 
                : 'text-gray-400 hover:text-yellow-400 transform hover:scale-110'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </footer>
      </article>
    );
  });

  const NotificationItem = React.memo(({ notification }) => (
    <div className={`flex items-center space-x-3 p-3 hover:bg-gray-700/50 rounded-lg transition-all duration-200 cursor-pointer animate-slide-in-right transform hover:scale-[1.01] ${
      !notification.read ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''
    }`}>
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm shadow-lg transform transition-transform duration-300 hover:scale-105">
        {notification.user.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          <span className="font-semibold hover:text-blue-400 transition-colors transform hover:translate-x-1">
            {notification.user.name}
          </span>{' '}
          <span className="text-gray-400">{notification.action}</span>
        </p>
        <p className="text-gray-500 text-xs">{formatTimeAgo(notification.timestamp)}</p>
      </div>
      {notification.type === 'follow_request' && (
        <div className="flex space-x-2 animate-fade-in">
          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full text-xs text-white font-medium transition-colors transform hover:scale-105">
            Accept
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-full text-xs text-white font-medium transition-colors transform hover:scale-105">
            Decline
          </button>
        </div>
      )}
    </div>
  ));

  const NewPostForm = () => (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50 animate-slide-down">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg transform transition-transform duration-300 hover:scale-105">
          {user.avatar}
        </div>
        <div className="flex-1">
          <textarea
            ref={newPostRef}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-lg"
            rows="3"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110">
                <Camera className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110">
                <Video className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110">
                <Globe className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${newPostText.length > 1800 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                {newPostText.length}/2000
              </span>
              <button 
                onClick={handleNewPost}
                disabled={!newPostText.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatItem = React.memo(({ chat }) => (
    <div
      onClick={() => navigate(`/chat/${chat.id}`)}
      className="flex items-center space-x-3 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 group animate-slide-in-right transform hover:scale-[1.01]"
    >
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-sm shadow-lg transform transition-transform duration-300 group-hover:scale-105">
          {chat.avatar}
        </div>
        {chat.online && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors transform hover:translate-x-0.5">
            {chat.name}
          </span>
          <span className="text-gray-500 text-xs">{formatTimeAgo(chat.timestamp)}</span>
        </div>
        <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
      </div>
    </div>
  ));

  const SearchBar = () => (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for posts, people, or topics..."
        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm transform focus:scale-[1.01]"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors animate-fade-in hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const InfiniteScrollTrigger = () => {
    const triggerRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMorePosts && !loading) {
            handleLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      if (triggerRef.current) {
        observer.observe(triggerRef.current);
      }

      return () => observer.disconnect();
    }, [hasMorePosts, loading]);

    return (
      <div ref={triggerRef} className="py-8">
        {loading && (
          <div className="flex justify-center animate-fade-in">
            <LoadingSpinner size="lg" className="text-blue-500" />
          </div>
        )}
      </div>
    );
  };

  const EmptyState = ({ message, action }) => (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once transform hover:scale-105"> {/* Added a subtle bounce */}
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No posts found</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors transform hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  // Main render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Sidebar */}
<aside className="w-72 bg-slate-800 border-r border-gray-700 flex flex-col">
  <div className="p-6 border-b border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md transform transition-transform duration-300 hover:rotate-6"> {/* Subtle rotation on hover */}
        <MessageCircle className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white">
        <span className="text-blue-500">ChatBuzz</span>
      </h1>
    </div>
  </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <nav className="space-y-2 mb-8">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === item.name
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white transform hover:translate-x-1' 
                  }`}
                >
                  <item.icon className="w-5 h-5 transform transition-transform duration-200 group-hover:scale-110" /> {/* Icon animation */}
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          <div className="flex-1 max-w-2xl">
            {/* Header */}
            <header className="p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-lg sticky top-0 z-10 animate-fade-in">
              <div className="flex items-center space-x-4">
                <SearchBar />
                <button 
                  onClick={() => setShowNewPost(!showNewPost)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className={`w-5 h-5 transition-transform duration-200 ${showNewPost ? 'rotate-45' : ''}`} />
                  <span className="hidden sm:inline">Post</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all duration-200 transform hover:rotate-180" 
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="bg-red-800/50 border border-red-600/50 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm animate-slide-down">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {showNewPost && <NewPostForm />}
              
              {filteredPosts.length === 0 && !loading ? (
                <EmptyState
                  message={searchQuery ? `No posts found for "${searchQuery}"` : "No posts to show"}
                  action={searchQuery ? { label: 'Clear search', onClick: () => setSearchQuery('') } : null}
                />
              ) : (
                <>
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  <InfiniteScrollTrigger />
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-80 bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50 flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg transform transition-transform duration-300 hover:scale-105">
                  {user.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold transform transition-transform duration-200 hover:translate-x-0.5">{user.name}</span>
                    {user.verified && <CheckCircle className="w-4 h-4 text-blue-500 animate-fade-in" />}
                  </div>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700/50 rounded-full transition-colors transform hover:rotate-12"> {/* Bell icon rotation */}
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Recent Chats
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {recentChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce-once transform hover:scale-110">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>



      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-5px); }
          40% { transform: translateY(0); }
          60% { transform: translateY(-2px); }
          80% { transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default ChatBuzzDashboard;