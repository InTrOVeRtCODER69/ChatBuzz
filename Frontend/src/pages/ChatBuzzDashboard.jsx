import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Home, User, Heart, Users, Share2, Camera, Video,
  MessageCircle, MoreHorizontal, Bell, Settings, Plus, Send,
  Bookmark, TrendingUp, Hash, Globe, X, CheckCircle, AlertCircle,
  Loader2, RefreshCw, ImageIcon, Smile, MapPin, Calendar,
  Eye, UserPlus, UserMinus, Edit3, Trash2, Flag, Copy, ExternalLink, EyeOff, UserX
} from 'lucide-react';

import DraggableCommentsModal from './DraggableCommentsModal';
import PostOptionsMenu from './PostOptionsMenu';


// =============================================================
// Backend Developer Comments:
// This section defines constants and utility functions.
// Pay attention to API_CONFIG for base URL and timeouts.
// =============================================================

// Constants
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api', // <-- Backend: Configure your API base URL here.
  TIMEOUT: 10000, // Frontend expects API response within 10 seconds.
  RETRY_ATTEMPTS: 3, // Frontend will retry failed API calls up to 3 times (though current useApi doesn't implement retries yet, it's a future consideration).
  RETRY_DELAY: 1000
};

const TOAST_DURATION = 4000;
const DEBOUNCE_DELAY = 300;

const POSTS_PER_PAGE = 10; // Frontend requests this many posts per page for infinite scroll.




// Utility functions
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const formatTimeAgo = (timestamp) => {
  // Backend: Ensure timestamps are sent in ISO 8601 format (e.g., "2025-07-05T14:30:00.000Z")
  // for correct parsing by new Date().
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  const options = { month: 'short', day: 'numeric' };
  if (now.getFullYear() !== time.getFullYear()) {
    options.year = 'numeric';
  }
  return time.toLocaleDateString('en-US', options);
};

const validatePostContent = (content) => {
  // Frontend validates content length. Backend should also validate to prevent abuse.
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
          // Backend: This is where authentication tokens (e.g., Bearer Token) would be added.
          // Example: 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          // Backend: If an error occurs, return JSON with a 'message' field for display.
          // Example: { "message": "Post not found" }
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, stick to the default HTTP error message
        }
        throw new Error(errorMessage);
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

// Components (React.memo added where appropriate)
const Toast = React.memo(({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Bell
  };

  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    info: 'from-purple-500 to-purple-600'
  };

  const Icon = icons[toast.type] || Bell;

  return (
    <div className={`animate-slide-in-right ${colors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        type="button"
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});


const ToastContainer = React.memo(({ toasts, removeToast }) => ( // Changed 'onRemove' to 'removeToast' here
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <Toast key={toast.id} toast={toast} onRemove={removeToast} />
    ))}
  </div>
));

const LoadingSpinner = React.memo(({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
  );
});

const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    // In a real app, consider using React's Error Boundaries (componentDidCatch or getDerivedStateFromError)
    // for more robust error handling in the component tree. This catches generic JS errors.
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
            type="button"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
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
  // =============================================================
  // Backend Developer Comments:
  // User Authentication & Data:
  // `user` state needs to be populated from backend authentication.
  // The `id` field is crucial for determining 'my posts' vs. others.
  // =============================================================
  const [user, setUser] = useState({
    id: 'user-1', // <-- Backend: This ID should come from the authenticated user's session/token.
                  //     It needs to match user IDs associated with posts in the database.
    name: 'Hitesh Gai',
    username: 'hiteshxg',
    avatar: 'H', // In a real app, this would be a URL to an image.
    verified: true
  });

  // State management
  const [activeSection, setActiveSection] = useState('Home');
  const [likedPosts, setLikedPosts] = useState(new Set()); // Frontend manages liked status locally for responsiveness.
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set()); // Frontend manages bookmarked status locally.
  const [newPostText, setNewPostText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState([]); // Main array of posts.
  const [filteredPosts, setFilteredPosts] = useState([]); // Used for search results.
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true); // For infinite scroll.
  const [refreshing, setRefreshing] = useState(false);

  // Notifications state.
  // Backend: These notifications should come from a database.
  // Consider WebSockets for real-time notification updates (e.g., new follow request, like, comment).
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      user: { id: 'user-5', name: 'Ex', username: 'Hitesh_ex', avatar: '👩‍💼' },
      action: 'requested to follow you',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'follow_request',
      read: false,
      accepted: false
    },
    {
      id: '2',
      user: { id: 'user-6', name: 'Ex', username: 'Hitesh_ex', avatar: '👩‍💼' },
      action: 'liked your post',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: 'like',
      read: false
    },
    {
      id: '3',
      user: { id: 'user-7', name: 'Ex', username: 'hitesh_ex', avatar: '👩‍💼' },
      action: 'commented on your post',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'comment',
      read: true
    }
  ]);

  // STATE FOR COMMENTS MODAL
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);



  // Hooks
  const navigate = useNavigate();
  const { apiCall, loading, error } = useApi(); // `apiCall` is the wrapper for fetch, `loading` & `error` reflect its state.
  const { toasts, showToast, removeToast } = useToast(); // Destructure removeToast here
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const newPostRef = useRef(null);


  // Navigation items (mostly for UI, paths are handled by react-router)
  const sidebarItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: TrendingUp, path: '/explore' },
    { name: 'Messages', icon: MessageCircle, path: '/chat' },
    { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { name: 'Profile', icon: User, path: '/profile-feed' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  
  // =============================================================
  // Backend Developer Comments:
  // Mock Data:
  // This `mockPosts` array represents the data structure frontend expects from your API.
  // Key fields: `id`, `user` (with `id`, `name`, `username`, `avatar`, `verified`),
  // `content`, `type` (`text` or `images`), `images` (array of URLs if type is 'images'),
  // `likes`, `comments`, `shares`, `views`, `timestamp` (ISO 8601), `location`, `hashtags`.
  // `mockComments` is nested for frontend demo, in reality, comments might be fetched via a separate API call.
  // =============================================================

  const mockPosts = useMemo(() => [
    {
      id: '1',
      user: {
        id: 'user-1', // IMPORTANT: This ID needs to match `user.id` for 'Edit/Delete Post' options to show.
        name: 'Hitesh Gai',
        username: 'hiteshxg',
        avatar: 'H', // Placeholder, ideally a URL to user's profile picture.
        verified: true
      },
      content: 'Let him cook!',
      type: 'text',
      likes: 24,
      comments: 8, // Total comment count.
      shares: 3,
      views: 156,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 'San Francisco, CA',
      hashtags: ['#project', '#teamwork', '#excited'],
      mockComments: [ // Frontend mock for initial comments.
        // Backend: Real comments should be fetched from an endpoint like GET /api/posts/:id/comments
        { id: 'c1', user: { id: 'u1', name: 'Alisha P.', username: 'alishap', avatar: '👩‍💻' }, comment: 'Great work, team!', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { id: 'c2', user: { id: 'u2', name: 'Bob T.', username: 'bobt', avatar: '🧔' }, comment: 'Agreed! Looking forward to the launch.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      ]
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
      hashtags: ['#mindfulness', '#grateful'],
      mockComments: [
        { id: 'c3', user: { id: 'u3', name: 'Sara L.', username: 'saral', avatar: '👧' }, comment: 'Keep it up! Consistency is key.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'c4', user: { id: 'u4', name: 'Chris W.', username: 'chrisw', avatar: '🧑‍💻' }, comment: 'Any tips for dynamic programming?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ]
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
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop', // Example image URL
      ],
      likes: 95,
      comments: 34,
      shares: 21,
      views: 512,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      hashtags: ['#coder'],
      mockComments: []
    }
  ], []);

  // =============================================================
  // Backend Developer Comments:
  // Recent Chats Mock Data:
  // Frontend expects chat data with `id`, `name`, `username`, `avatar`, `online` status,
  // `lastMessage`, and `timestamp`.
  // Consider an endpoint like GET /api/chats or /api/users/:id/chats for active conversations.
  // Real-time updates for `online` status and `lastMessage` via WebSockets would be ideal.
  // =============================================================
  const recentChats = [
    { id: '1', name: 'Navneet', username: 'navneet', avatar: '👨‍💻', online: true, lastMessage: 'finish this project fast', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { id: '2', name: 'Keshav ', username: 'keshav', avatar: '👨‍🦱', online: false, lastMessage: 'Thanks for the help!', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  ];

  // =============================================================
  // Backend Developer Comments:
  // API Functions:
  // These functions outline the expected API interactions.
  // Replace frontend's mock `await new Promise(...)` with actual `apiCall` from `useApi` hook.
  // =============================================================

  // Fetches posts with pagination.
  // Endpoint: GET /api/posts?page=<page_number>&limit=<posts_per_page>&sortBy=timestamp&order=desc
  // Response: { posts: [...], hasMore: true/false, total: <number> }
  const fetchPosts = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);

      // Backend: Replace this mock implementation with actual API call:
      // const response = await apiCall(`/posts?page=${page}&limit=${POSTS_PER_PAGE}`, { method: 'GET' });
      // console.log("API Response for posts:", response); // For debugging
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
        }, 1000); // Simulate network delay
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
      // Backend: Ensure error messages from API are descriptive.
    } finally {
      if (refresh) {
        setRefreshing(false);
      }
    }
  }, [mockPosts, showToast]); // mockPosts dependency should be removed once real API is used.

  // Creates a new post.
  // Endpoint: POST /api/posts
  // Request Payload: { content: string, type: 'text' | 'images', attachments?: string[] (URLs), location?: string, hashtags?: string[] }
  // Response: { id: string, ... (full new post object, matching `mockPosts` structure) }
  const createPost = useCallback(async (content, type = 'text', attachments = []) => {
    if (!validatePostContent(content)) {
      showToast('Please enter valid content (1-2000 characters)', 'error');
      return false;
    }

    try {
      // Backend: Replace this mock implementation with actual API call:
      /*
      const newPostData = await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id, // Authenticated user ID should be used
          content: content.trim(),
          type,
          attachments,
          // Backend should handle `likes`, `comments`, `shares`, `views`, `timestamp`, `hashtags` generation
          // and potentially `location` if gathered from user.
        })
      });
      setPosts(prev => [newPostData, ...prev]);
      */

      const newPost = {
        id: `post-${Date.now()}`, // Backend generates this ID.
        user: user, // Backend attaches user object from authenticated session.
        content: content.trim(),
        type,
        attachments,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        timestamp: new Date().toISOString(), // Backend generates timestamp.
        hashtags: content.match(/#\w+/g) || [], // Backend can parse hashtags or frontend sends.
        mockComments: []
      };

      setPosts(prev => [newPost, ...prev]);
      showToast('Post created successfully', 'success');
      return true;
    } catch (err) {
      showToast(`Failed to create post: ${err.message}`, 'error');
      return false;
    }
  }, [user, showToast]);

  // Toggles like status for a post.
  // Endpoint: PUT /api/posts/:id/like or POST /api/likes (toggle endpoint is common)
  // Request Payload: { userId: string, postId: string } (if using POST /api/likes)
  // Response: { success: true } or updated like count. Frontend updates optimisticallly.
  const toggleLike = useCallback(async (postId) => {
    let isLikedLocally; // Declare isLikedLocally here
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      isLikedLocally = newSet.has(postId); // Assign value here
      if (isLikedLocally) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + (isLikedLocally ? -1 : 1) } // Use isLikedLocally
        : post
    ));

    try {
      // Backend: Replace this mock with actual API call:
      // await apiCall(`/posts/${postId}/like`, { method: isLikedLocally ? 'DELETE' : 'PUT' });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    } catch (err) {
      // If API call fails, revert UI changes (rollback):
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLikedLocally) { // If it was liked, remove it on fail
          newSet.add(postId);
        } else { // If it was unliked, add it back on fail
          newSet.delete(postId);
        }
        return newSet;
      });
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + (isLikedLocally ? 1 : -1) } // Revert like count using isLikedLocally
          : post
      ));
      showToast('Failed to update like', 'error');
    }
  }, [likedPosts, showToast]);

  // Toggles bookmark status for a post.
  // Endpoint: PUT /api/posts/:id/bookmark or POST /api/bookmarks (toggle endpoint is common)
  // Request Payload: { userId: string, postId: string }
  // Response: { success: true }
  const toggleBookmark = useCallback(async (postId) => {
    let isBookmarkedLocally; // Declare isBookmarkedLocally here
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      isBookmarkedLocally = newSet.has(postId); // Assign value here
      if (isBookmarkedLocally) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      // Backend: Replace this mock with actual API call:
      // await apiCall(`/posts/${postId}/bookmark`, { method: isBookmarkedLocally ? 'DELETE' : 'PUT' });
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      showToast(
        isBookmarkedLocally ? 'Removed from bookmarks' : 'Added to bookmarks', // Use isBookmarkedLocally
        'success'
      );
    } catch (err) {
      // Rollback UI changes if API fails:
      setBookmarkedPosts(prev => {
        const newSet = new Set(prev);
        if (isBookmarkedLocally) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      showToast('Failed to update bookmark', 'error');
    }
  }, [bookmarkedPosts, showToast]);

  // Handles sharing a post (copies link or uses native share).
  // Endpoint: POST /api/posts/:id/share (to increment share count on backend)
  // Request Payload: { userId: string, postId: string }
  // Response: { success: true } or updated share count. Frontend updates optimisticallly.
  const handleShare = useCallback(async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (navigator.share) {
        // Native Web Share API
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content,
          url: `${window.location.origin}/post/${postId}` // Backend: Ensure this URL leads to a viewable post page.
        });
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        showToast('Link copied to clipboard', 'success');
      }

      // Backend: Call API to increment share count after successful share/copy
      // await apiCall(`/posts/${postId}/share`, { method: 'POST' });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      ));
    } catch (err) {
      if (err.name !== 'AbortError') { // Ignore user canceling native share dialog
        showToast('Failed to share post', 'error');
      }
    }
  }, [posts, showToast]);

  // Opens the comments modal for a specific post.
  // Backend: When this modal opens, frontend might need to fetch a full list of comments
  // if `post.mockComments` isn't comprehensive.
  // Endpoint: GET /api/posts/:id/comments
  // Response: [{ id: string, user: { id, name, username, avatar }, comment: string, timestamp: string }, ...]
  const handleCommentClick = useCallback((post) => {
    setSelectedPostForComments(post);
    setShowCommentsModal(true);
  }, []);

  const handleCloseCommentsModal = useCallback(() => {
    setShowCommentsModal(false);
    setSelectedPostForComments(null);
  }, []);

  // Handles accepting a follow request.
  // Endpoint: PUT /api/users/:userId/follow-requests/:requestId/accept
  // Request Payload: None
  // Response: { success: true }
  // Backend: This should update the database (e.g., add relationship, mark request as accepted).
  const handleAcceptFollow = useCallback((notificationId) => {
    // Frontend updates optimistically.
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true, accepted: true, action: 'started following you' }
          : notif
      )
    );
    showToast('Follow request accepted! 🤝', 'success');
    // Backend: Implement API call here.
    // try { await apiCall(`/notifications/${notificationId}/accept-follow`, { method: 'PUT' }); }
    // catch (e) { showToast('Failed to accept follow request', 'error'); /* rollback UI */ }
  }, [showToast]);

  // Handles declining a follow request.
  // Endpoint: DELETE /api/users/:userId/follow-requests/:requestId
  // Response: { success: true }
  // Backend: This should delete the request from the database.
  const handleDeclineFollow = useCallback((notificationId) => {
    // Frontend updates optimistically.
    setNotifications(prevNotifications =>
      prevNotifications.filter(notif => notif.id !== notificationId)
    );
    showToast('Follow request declined. No cap. 🙅‍♀️', 'info');
    // Backend: Implement API call here.
    // try { await apiCall(`/notifications/${notificationId}/decline-follow`, { method: 'DELETE' }); }
    // catch (e) { showToast('Failed to decline follow request', 'error'); /* rollback UI */ }
  }, [showToast]);

  // =============================================================
  // Backend Developer Comments:
  // Post Option Menu Handlers:
  // These are for actions taken from the "three dots" menu on each post.
  // All actions should communicate with the backend.
  // =============================================================

  // Edits an existing post.
  // Endpoint: PUT /api/posts/:id
  // Request Payload: { content?: string, type?: 'text' | 'images', images?: string[], location?: string, hashtags?: string[] }
  // Response: { ...updated post object... }
  // Backend: Ensure proper authorization (only post owner can edit).
  const handleEditPost = useCallback((postId) => {
    showToast(`Feature: Edit post ${postId} (not implemented yet)`, 'info');
    // Backend: Implement API call to update post data.
    // e.g., navigate to an edit form, or open a modal to modify post.
  }, [showToast]);

  // Deletes a post.
  // Endpoint: DELETE /api/posts/:id
  // Response: { success: true } or 204 No Content
  // Backend: Ensure proper authorization (only post owner or admin can delete).
  // Also, consider soft deletes vs. hard deletes for data retention.
  const handleDeletePost = useCallback((postId) => {
    if (window.confirm('Are you sure you want to delete this post? This is irreversible!')) {
      // Frontend updates optimistically
      setPosts(prev => prev.filter(post => post.id !== postId));
      showToast('Post deleted. RIP. 💀', 'success');
      // Backend: Implement API call to delete the post.
      // try { await apiCall(`/posts/${postId}`, { method: 'DELETE' }); }
      // catch (e) { showToast('Failed to delete post', 'error'); /* rollback UI, re-add post */ }
    }
  }, [showToast]);

  // Reports a post.
  // Endpoint: POST /api/reports/posts
  // Request Payload: { postId: string, reporterUserId: string, reason?: string }
  // Response: { success: true, reportId: string }
  // Backend: Store report, potentially notify moderators.
  const handleReportPost = useCallback((postId) => {
    showToast(`Reported post ${postId}. We'll check it out.`, 'info');
    // Backend: Implement API call to report the post.
    // try { await apiCall('/reports/posts', { method: 'POST', body: JSON.stringify({ postId, reporterUserId: user.id }) }); }
    // catch (e) { showToast('Failed to report post', 'error'); }
  }, [showToast, user.id]);

  // Mutes a user.
  // Endpoint: POST /api/users/:userId/mute or PUT /api/relationships/:id (to update mute status)
  // Request Payload: { mutingUserId: string, mutedUserId: string }
  // Response: { success: true }
  // Backend: This should prevent muted user's posts/comments from appearing for the muting user.
  const handleMuteUser = useCallback((userId) => {
    showToast(`User ${userId} muted. They're on mute now. 🔇`, 'info');
    // Backend: Implement API call to mute the user.
    // try { await apiCall(`/users/${user.id}/mute/${userId}`, { method: 'POST' }); }
    // catch (e) { showToast('Failed to mute user', 'error'); }
  }, [showToast, user.id]);

  // Blocks a user.
  // Endpoint: POST /api/users/:userId/block or PUT /api/relationships/:id (to update block status)
  // Request Payload: { blockingUserId: string, blockedUserId: string }
  // Response: { success: true }
  // Backend: This should prevent all interaction and visibility between blocked users.
  // It should also remove any existing follow relationships.
  const handleBlockUser = useCallback((userId) => {
    showToast(`User ${userId} blocked. They're blocked, period. 🚫`, 'error');
    // Backend: Implement API call to block the user.
    // try { await apiCall(`/users/${user.id}/block/${userId}`, { method: 'POST' }); }
    // catch (e) { showToast('Failed to block user', 'error'); }
  }, [showToast, user.id]);
  // --- END Backend Dev Comments for Post Option Menu Handlers ---


  // Event handlers (for UI interactions)
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
    fetchPosts(1, true); // Fetches first page and refreshes content
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (hasMorePosts && !loading) {
      fetchPosts(currentPage + 1); // Fetches next page of posts
    }
  }, [hasMorePosts, loading, currentPage, fetchPosts]);

  // Search functionality
  useEffect(() => {
    // Frontend filters based on debounced search query.
    // Backend: For large datasets, implement server-side search via a dedicated API endpoint:
    // GET /api/posts/search?q=<query>&page=<page>&limit=<limit>
    if (!debouncedSearch) {
      setFilteredPosts(posts); // Show all posts if search is empty
      return;
    }

    const filtered = posts.filter(post =>
      post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );

    setFilteredPosts(filtered);
  }, [debouncedSearch, posts]);

  // Initialize data on component mount
  useEffect(() => {
    fetchPosts(1); // Initial fetch of posts
  }, [fetchPosts]);

  // Auto-focus new post textarea
  useEffect(() => {
    if (showNewPost && newPostRef.current) {
      newPostRef.current.focus();
    }
  }, [showNewPost]);

  // Components (React.memo added for optimization)
  const PostCard = React.memo(({ post }) => {
    const isLiked = likedPosts.has(post.id); // Define isLiked here
    const isBookmarked = bookmarkedPosts.has(post.id); // Define isBookmarked here
    const [imageError, setImageError] = useState(false);

    return (
      <article className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 animate-fade-in">
        <header className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-lg shadow-lg transform transition-transform duration-300 hover:scale-105 animate-pulse-light">
            {/* Backend: This should be an <img> tag pointing to user's avatar URL. */}
            {post.user.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold hover:text-purple-400 cursor-pointer transition-colors transform hover:translate-x-1">
                {post.user.name}
              </h3>
              {post.user.verified && (
                <CheckCircle className="w-4 h-4 text-purple-500 animate-pop-in" />
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
              <span>{post.views}</span> {/* Backend: Ensure views count is sent with post data. */}
            </div>
            <PostOptionsMenu
              postId={post.id}
              postUserId={post.user.id}
              currentUserId={user.id}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onReport={handleReportPost}
              onCopyLink={handleShare}
              onMuteUser={handleMuteUser}
              onBlockUser={handleBlockUser}
            />
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
                  className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors transform hover:scale-105 animate-tag-pop"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.type === 'images' && post.images && !imageError && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-scale">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img} // Backend: Provide accessible URLs for images.
                alt={`Post image ${idx + 1}`}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                onError={() => setImageError(true)} // Handles broken image links
                loading="lazy"
              />
            ))}
          </div>
        )}

        <footer className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => toggleLike(post.id)}
              type="button"
              className={`flex items-center space-x-2 transition-all duration-200 animate-heart-beat ${
                isLiked // This is now correctly defined in PostCard's scope
                  ? 'text-red-500 transform scale-105'
                  : 'text-gray-400 hover:text-red-400 transform hover:scale-110'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{post.likes}</span> {/* Backend: Ensure this count is accurate from DB. */}
            </button>

            <button
              onClick={() => handleCommentClick(post)}
              type="button"
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 animate-pop-in"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span> {/* Backend: Ensure this count is accurate from DB. */}
            </button>

            <button
              onClick={() => handleShare(post.id)}
              type="button"
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors transform hover:scale-110 animate-fade-in-up"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.shares}</span> {/* Backend: Ensure this count is accurate from DB. */}
            </button>
          </div>

          <button
            onClick={() => toggleBookmark(post.id)}
            type="button"
            className={`transition-all duration-200 animate-bookmark-bounce ${
              isBookmarked // This is now correctly defined in PostCard's scope
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

  const NotificationItem = React.memo(({ notification, onAcceptFollow, onDeclineFollow }) => (
    <div className={`flex items-center space-x-3 p-3 hover:bg-gray-700/50 rounded-lg transition-all duration-200 cursor-pointer animate-slide-in-right transform hover:scale-[1.01] ${
      !notification.read ? 'bg-purple-900/20 border-l-2 border-purple-500 animate-pulse-fast' : ''
    }`}>
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-sm shadow-lg transform transition-transform duration-300 hover:scale-105 animate-bubble-bounce">
        {/* Backend: This should be an <img> tag pointing to user's avatar URL. */}
        {notification.user.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          <span className="font-semibold hover:text-purple-400 transition-colors transform hover:translate-x-0.5">
            {notification.user.name}
          </span>{' '}
          <span className="text-gray-400">{notification.action}</span>
        </p>
        <p className="text-gray-500 text-xs">{formatTimeAgo(notification.timestamp)}</p>
      </div>
      {notification.type === 'follow_request' && !notification.accepted && (
        <div className="flex space-x-2 animate-fade-in">
          <button
            onClick={() => onAcceptFollow(notification.id)}
            type="button"
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-full text-xs text-white font-medium transition-colors transform hover:scale-105 animate-pop-in">
            Accept
          </button>
          <button
            onClick={() => onDeclineFollow(notification.id)}
            type="button"
            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-full text-xs text-white font-medium transition-colors transform hover:scale-105 animate-pop-in">
            Decline
          </button>
        </div>
      )}
      {notification.type === 'follow_request' && notification.accepted && (
        <div className="flex items-center space-x-1 text-green-400 text-xs font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Accepted</span>
        </div>
      )}
    </div>
  ));

  const NewPostForm = React.memo(() => (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50 animate-slide-down">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-lg transform transition-transform duration-300 hover:scale-105 animate-pulse-light">
          {/* Backend: This should be an <img> tag pointing to user's avatar URL. */}
          {user.avatar}
        </div>
        <div className="flex-1">
          <textarea
            ref={newPostRef}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's the tea? Spill it..."
            className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-lg"
            rows="3"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {/* Backend: If allowing image/video uploads, these buttons would trigger file input.
                  Needs API endpoint for file uploads (e.g., POST /api/upload/images)
                  Response should be a URL to the uploaded file.
              */}
              <button
                type="button"
                className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110 animate-icon-bounce">
                <Camera className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110 animate-icon-bounce">
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-fuchsia-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110 animate-icon-bounce">
                <Globe className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-700/50 transform hover:scale-110 animate-icon-bounce">
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
                type="button"
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105 animate-button-pop"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  const ChatItem = React.memo(({ chat }) => (
    <div
      onClick={() => navigate(`/chat/${chat.id}`)}
      className="flex items-center space-x-3 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 group animate-slide-in-right transform hover:scale-[1.01]"
    >
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-sm shadow-lg transform transition-transform duration-300 group-hover:scale-105 animate-pulse-light">
          {/* Backend: This should be an <img> tag pointing to user's avatar URL. */}
          {chat.avatar}
        </div>
        {chat.online && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-ping-once" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors transform hover:translate-x-0.5">
            {chat.name}
          </span>
          <span className="text-gray-500 text-xs">{formatTimeAgo(chat.timestamp)}</span>
        </div>
        <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
      </div>
    </div>
  ));

  const SearchBar = React.memo(() => (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-fade-in" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for posts, people, or topics... lowkey"
        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm transform focus:scale-[1.01] animate-search-bar-expand"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors animate-fade-in hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  ));

  const InfiniteScrollTrigger = React.memo(() => {
    const triggerRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMorePosts && !loading) {
            handleLoadMore(); // Trigger loading more posts when trigger is visible
          }
        },
        { threshold: 0.1 }
      );

      if (triggerRef.current) {
        observer.observe(triggerRef.current);
      }

      return () => observer.disconnect();
    }, [hasMorePosts, loading, handleLoadMore]);

    return (
      <div ref={triggerRef} className="py-8">
        {loading && (
          <div className="flex justify-center animate-fade-in">
            <LoadingSpinner size="lg" className="text-purple-500" />
          </div>
        )}
      </div>
    );
  });

  const EmptyState = React.memo(({ message, action }) => (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once transform hover:scale-105">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No posts found... that's cap 🧐</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          type="button"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors transform hover:scale-105 animate-button-pop"
        >
          {action.label}
        </button>
      )}
    </div>
  ));

  // Main render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white relative overflow-x-hidden">
    
        {/* Main layout wrapper to ensure content is above bubbles */}
        <div className="relative z-10 flex min-h-screen">
          <ToastContainer toasts={toasts} removeToast={removeToast} /> {/* Pass removeToast directly */}

          {/* Comments Modal */}
          {/* Backend: This modal expects `post` data and `userAvatar` (from current user).
              It will send new comments via an internal handler, which will need an API endpoint.
          */}
          {showCommentsModal && selectedPostForComments && (
            <DraggableCommentsModal
              post={selectedPostForComments}
              onClose={handleCloseCommentsModal}
              userAvatar={user.avatar} // Pass current user's avatar to the modal
            />
          )}

          {/* Sidebar */}
          <aside className="w-72 bg-slate-800/80 backdrop-blur-md border-r border-gray-700 flex flex-col animate-slide-in-left">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md transform transition-transform duration-300 hover:rotate-6 animate-pulse-light">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-purple-500">ChatBuzz</span>
                </h1>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <nav className="space-y-2 mb-8">
                {sidebarItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    type="button"
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      activeSection === item.name
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg transform scale-[1.02] animate-sidebar-item-active'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white transform hover:translate-x-1'
                    }`}
                  >
                    <item.icon className="w-5 h-5 transform transition-transform duration-200 group-hover:scale-110" />
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
                    type="button"
                    className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg transform hover:scale-105 animate-button-pop"
                  >
                    <Plus className={`w-5 h-5 transition-transform duration-200 ${showNewPost ? 'rotate-45' : ''}`} />
                    <span className="hidden sm:inline">Post</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    type="button"
                    className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all duration-200 transform hover:rotate-180 animate-refresh-spin"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </header>

              {/* Content */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-800/50 border border-red-600/50 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm animate-slide-down animate-error-shake">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span> {/* Backend: Error message from API is displayed here. */}
                    </div>
                  </div>
                )}

                {showNewPost && <NewPostForm />}

                {filteredPosts.length === 0 && !loading ? (
                  <EmptyState
                    message={searchQuery ? `No posts found for "${searchQuery}"` : "No posts to show, fam. Time to drop some content! 🤙"}
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
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg transform transition-transform duration-300 hover:scale-105 animate-pulse-light">
                    {/* Backend: This should be an <img> tag pointing to user's avatar URL. */}
                    {user.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold transform transition-transform duration-200 hover:translate-x-0.5">{user.name}</span>
                      {user.verified && <CheckCircle className="w-4 h-4 text-purple-500 animate-pop-in" />}
                    </div>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-700/50 rounded-full transition-colors transform hover:rotate-12 animate-bell-ring">
                  <Bell className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Recent Chats
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {/* Backend: Fetch recent chat list from API. */}
                  {recentChats.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                  {notifications.filter(n => !n.read && !n.accepted).length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-ping-once transform hover:scale-110">
                      {notifications.filter(n => !n.read && !n.accepted).length}
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {/* Backend: Fetch notifications from API. Consider real-time updates (WebSockets). */}
                  {notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onAcceptFollow={handleAcceptFollow}
                      onDeclineFollow={handleDeclineFollow}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>


      {/* Global CSS for animations and scrollbar */}
      <style jsx>{`
        /* Existing animations */
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

        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
        .animate-bounce-once { animation: bounce-once 0.6s ease-out; }

        /* New Gen Z Animations */
        @keyframes bubble-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          25% { transform: translate(20px, -30px) scale(1.1); opacity: 0.6; }
          50% { transform: translate(-10px, 50px) scale(0.9); opacity: 0.7; }
          75% { transform: translate(30px, -15px) scale(1.2); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        }
        @keyframes bubble-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          25% { transform: translate(-30px, 20px) scale(0.8); opacity: 0.4; }
          50% { transform: translate(40px, -40px) scale(1.1); opacity: 0.6; }
          75% { transform: translate(-10px, 30px) scale(0.9); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
        }
        @keyframes bubble-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(40px, 30px) scale(1.1); opacity: 0.3; }
          50% { transform: translate(-20px, -50px) scale(0.8); opacity: 0.5; }
          75% { transform: translate(15px, 25px) scale(1.0); opacity: 0.4; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        }
        @keyframes bubble-4 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          25% { transform: translate(-20px, -40px) scale(1.3); opacity: 0.6; }
          50% { transform: translate(50px, 10px) scale(1.0); opacity: 0.7; }
          75% { transform: translate(-30px, -20px) scale(1.1); opacity: 0.8; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.9; }
        }
        @keyframes bubble-5 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.75; }
          25% { transform: translate(15px, 10px) scale(0.9); opacity: 0.45; }
          50% { transform: translate(-25px, -30px) scale(1.2); opacity: 0.6; }
          75% { transform: translate(10px, 5px) scale(0.8); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.75; }
        }

        .animate-bubble-1 { animation: bubble-1 20s infinite alternate ease-in-out; }
        .animate-bubble-2 { animation: bubble-2 22s infinite alternate ease-in-out; }
        .animate-bubble-3 { animation: bubble-3 18s infinite alternate ease-in-out; }
        .animate-bubble-4 { animation: bubble-4 25s infinite alternate ease-in-out; }
        .animate-bubble-5 { animation: bubble-5 19s infinite alternate ease-in-out; }

        @keyframes pulse-light {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
        }
        .animate-pulse-light { animation: pulse-light 2s infinite ease-in-out; }

        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8); }
          80% { opacity: 1; transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.4s ease-out forwards; }

        @keyframes sidebar-item-active {
          0% { transform: scale(1); box-shadow: none; }
          50% { transform: scale(1.03); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
          100% { transform: scale(1.02); }
        }
        .animate-sidebar-item-active { animation: sidebar-item-active 0.3s ease-out forwards; }

        @keyframes refresh-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-refresh-spin:hover { animation: refresh-spin 0.8s infinite linear; }

        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-error-shake { animation: error-shake 0.5s ease-in-out; }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
        }
        .animate-heart-beat:hover { animation: heart-beat 0.6s ease-in-out; }

        @keyframes bookmark-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-5px) scale(1.05); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(-2px) scale(1.02); }
        }
        .animate-bookmark-bounce:hover { animation: bookmark-bounce 0.5s ease-out; }

        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-icon-bounce:hover { animation: icon-bounce 0.3s ease-out; }

        @keyframes button-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-button-pop:active { animation: button-pop 0.2s ease-out; }

        @keyframes ping-once {
          0% { transform: scale(0.2); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1) forwards; }

        @keyframes search-bar-expand {
          from { width: 100%; } /* Assuming initial width is 100% of flex container */
          to { width: 105%; } /* Slightly expand on focus */
        }
        .animate-search-bar-expand:focus { animation: search-bar-expand 0.2s ease-out forwards; }


        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }

        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.5s ease-out forwards; }

        @keyframes tag-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-tag-pop:hover { animation: tag-pop 0.2s ease-out; }

        @keyframes bubble-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bubble-bounce:hover { animation: bubble-bounce 0.3s ease-out; }

        /* New Animation for PostOptionsMenu (also in PostOptionsMenu.jsx directly) */
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.15s ease-out forwards; }


        /* Custom Scrollbar for CommentsModal and other scrollable areas */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333; /* Dark track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555; /* Darker thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666; /* Even darker thumb on hover */
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default ChatBuzzDashboard;