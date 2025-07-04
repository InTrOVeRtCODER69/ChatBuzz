import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import {
  Bookmark,
  Grid,
  List,
  Search,
  Trash2,
  FolderPlus,
  Loader2,
  X,
  Heart,
  MessageCircle,
  Share,
  Video,
  Link2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Context for managing bookmarks and folders
const BookmarkContext = createContext();

// Custom Hook for Notifications
const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  return { notification, showNotification, clearNotification: () => setNotification(null) };
};

// Notification Component
const Notification = React.memo(({ notification, clearNotification }) => {
  if (!notification) return null;

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[notification.type] || Info;

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[notification.type];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white flex items-center space-x-3 z-[100] transform transition-all duration-300 ease-out animate-slideInUp ${bgColor}`}
      role="alert"
    >
      <Icon className="w-5 h-5" />
      <span>{notification.message}</span>
      <button onClick={clearNotification} className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

// Custom Confirmation Dialog Component
const ConfirmationDialog = React.memo(({ message, onConfirm, onCancel, title = "Confirm Action" }) => (
  <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirmation-dialog-title"
  >
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-xl relative animate-scaleIn">
      <h2 id="confirmation-dialog-title" className="text-lg font-semibold text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 transform hover:scale-105"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
));

// Centralized utility for date formatting to keep logic out of components
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Handle both Date objects and ISO strings
  const date = (dateString instanceof Date) ? dateString : new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Reusable Bookmark Card Components
const PostCard = React.memo(({ bookmark }) => {
  const { showConfirmation, showNotification, handleRemoveBookmark } = useContext(BookmarkContext);

  const confirmRemove = () => {
    showConfirmation(
      'Are you sure you want to remove this post bookmark?',
      () => handleRemoveBookmark(bookmark.id),
      () => showNotification('Bookmark removal cancelled.', 'info')
    );
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white font-bold">
            {bookmark.authorAvatar}
          </div>
          <div>
            <p className="font-semibold text-white">{bookmark.author}</p>
            <p className="text-sm text-gray-400">{bookmark.authorUsername} • {bookmark.timestamp}</p>
          </div>
        </div>
        <button
          onClick={confirmRemove}
          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700"
          aria-label={`Remove post bookmark ${bookmark.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-white mb-2">{bookmark.content}</p>
      <div className="flex gap-2 text-gray-400 text-sm">
        <span><Heart className="inline w-4 h-4 mr-1" /> {bookmark.stats?.likes || 0}</span>
        <span><MessageCircle className="inline w-4 h-4 mr-1" /> {bookmark.stats?.comments || 0}</span>
        <span><Share className="inline w-4 h-4 mr-1" /> {bookmark.stats?.shares || 0}</span>
      </div>
      <p className="text-xs text-gray-500 mt-3">Saved {formatDate(bookmark.savedAt)}</p>
    </div>
  );
});

const VideoCard = React.memo(({ bookmark }) => {
  const { showConfirmation, showNotification, handleRemoveBookmark } = useContext(BookmarkContext);

  const confirmRemove = () => {
    showConfirmation(
      'Are you sure you want to remove this video bookmark?',
      () => handleRemoveBookmark(bookmark.id),
      () => showNotification('Bookmark removal cancelled.', 'info')
    );
  };

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex flex-col h-full hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-48 bg-gray-700 flex items-center justify-center relative">
        {bookmark.thumbnail ? (
          <img src={bookmark.thumbnail} alt={bookmark.title} className="w-full h-full object-cover" />
        ) : (
          <Video className="w-10 h-10 text-gray-500" />
        )}
        {bookmark.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {bookmark.duration}
          </span>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-white font-semibold mb-1 truncate">{bookmark.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{bookmark.views} • {formatDate(bookmark.savedAt)}</p>
        </div>
        <button
          onClick={confirmRemove}
          className="text-red-400 hover:text-red-300 self-end mt-2 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700"
          aria-label={`Remove video bookmark ${bookmark.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

const LinkCard = React.memo(({ bookmark }) => {
  const { showConfirmation, showNotification, handleRemoveBookmark } = useContext(BookmarkContext);

  const confirmRemove = () => {
    showConfirmation(
      'Are you sure you want to remove this link bookmark?',
      () => handleRemoveBookmark(bookmark.id),
      () => showNotification('Bookmark removal cancelled.', 'info')
    );
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex flex-col h-full hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start flex-grow">
        <div className="w-16 h-16 bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0">
          {bookmark.image ? (
            <img src={bookmark.image} alt={bookmark.title} className="w-full h-full object-cover" />
          ) : (
            <Link2 className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold mb-1 truncate">{bookmark.title}</h4>
          <p className="text-sm text-gray-400 line-clamp-2">{bookmark.description}</p>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline mt-2 inline-block truncate hover:text-blue-300 transition-colors duration-200"
          >
            {bookmark.domain}
          </a>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">Saved {formatDate(bookmark.savedAt)}</p>
        <button
          onClick={confirmRemove}
          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700"
          aria-label={`Remove link bookmark ${bookmark.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

// Create New Folder Modal Component
const CreateFolderModal = React.memo(({ show, onClose, onCreate, newFolderName, setNewFolderName }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-folder-title"
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-xl relative animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 id="create-folder-title" className="text-lg font-semibold text-white">Create New Folder</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:rotate-90"
            aria-label="Close create folder dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Enter folder name"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition-colors duration-200"
          aria-label="Folder name input"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!newFolderName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
});

// Mock Data for Frontend Simulation
const MOCK_BOOKMARKS = [
  {
    id: 'b1',
    type: 'post',
    title: 'Project Insights',
    author: 'John Smith',
    authorUsername: '@john_smith',
    authorAvatar: 'JS',
    content: 'Amazing project updates and a deep dive into the new features coming next quarter. Stay tuned for more!',
    timestamp: '2h ago',
    tags: ['#project', '#update'],
    stats: { likes: 24, comments: 8, shares: 3 },
    category: 'work',
    savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'b2',
    type: 'video',
    title: 'Sunset Views Over the Himalayas - 4K',
    author: 'Nature Channel',
    duration: '07:23',
    views: '1.3k views',
    thumbnail: 'https://placehold.co/320x180/4A5568/CBD5E0?text=Video+Thumbnail',
    tags: ['#nature', '#travel'],
    savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'b3',
    type: 'link',
    title: 'Mastering Modern React Patterns in 2024',
    url: 'https://reactpatterns.com/article/modern-patterns',
    domain: 'reactpatterns.com',
    description: 'An in-depth guide to the most important and effective React patterns you should be using in your applications today to improve performance and maintainability.',
    image: 'https://placehold.co/64x64/6B46C1/E9D8FD?text=Link',
    savedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'b4',
    type: 'post',
    title: 'Weekend Reads',
    author: 'Jane Doe',
    authorUsername: '@jane_doe',
    authorAvatar: 'JD',
    content: 'Just finished a fantastic book on AI. Highly recommend it!',
    timestamp: '1d ago',
    tags: ['#books', '#AI'],
    stats: { likes: 15, comments: 5, shares: 1 },
    category: 'personal',
    savedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'b5',
    type: 'video',
    title: 'Quick Guide to Sourdough Baking',
    author: 'Bake With Me',
    duration: '12:00',
    views: '5.2k views',
    thumbnail: 'https://placehold.co/320x180/718096/F7FAFC?text=Baking+Video',
    tags: ['#cooking', '#baking'],
    savedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    id: 'b6',
    type: 'link',
    title: 'The Future of Web Development',
    url: 'https://webdevtrends.org/report-2024',
    domain: 'webdevtrends.org',
    description: 'Exploring the upcoming trends and technologies that will shape web development in the next decade.',
    image: 'https://placehold.co/64x64/2C5282/A0C8F0?text=Web',
    savedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  // Add more mock data for pagination simulation
  {
    id: 'b7',
    type: 'post',
    title: 'New Design System Rollout',
    author: 'Design Team',
    authorUsername: '@design_buzz',
    authorAvatar: 'DT',
    content: 'Our new design system is live! Check out the updated components and guidelines.',
    timestamp: '6h ago',
    tags: ['#design', '#frontend'],
    stats: { likes: 30, comments: 10, shares: 5 },
    category: 'work',
    savedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b8',
    type: 'video',
    title: 'Beginner\'s Guide to Chess Openings',
    author: 'Chess Master',
    duration: '25:00',
    views: '8.1k views',
    thumbnail: 'https://placehold.co/320x180/3182CE/EBF8FF?text=Chess+Video',
    tags: ['#chess', '#tutorial'],
    savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b9',
    type: 'link',
    title: 'The Art of Clean Code',
    url: 'https://cleancode.dev/principles',
    domain: 'cleancode.dev',
    description: 'Essential principles and practices for writing maintainable and readable code.',
    image: 'https://placehold.co/64x64/805AD5/D6BCFA?text=Code',
    savedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
];

// Bookmark Provider Component
const BookmarkProvider = ({ children }) => {
  const [userId, setUserId] = useState('mock-user-id-123'); // Mock user ID for frontend
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Current page for mock pagination
  const [hasMore, setHasMore] = useState(true);

  const { notification, showNotification, clearNotification } = useNotification();
  const [confirmation, setConfirmation] = useState(null);

  // Simulate initial data fetch
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Backend would fetch initial bookmarks (e.g., first 10)
      const initialBookmarks = MOCK_BOOKMARKS.slice(0, 6); // Load first 6 for demo
      setBookmarks(initialBookmarks);
      setFolders([{ id: 'f1', name: 'Work' }, { id: 'f2', name: 'Personal' }]); // Mock folders
      setPage(1); // Set current page to 1 after initial load
      setHasMore(initialBookmarks.length === 6); // Check if more data exists
      setLoading(false);
      showNotification("Bookmarks loaded successfully!", "success");
    }, 1000);
  }, []); // Empty dependency array to run once on mount

  const loadMoreBookmarks = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    showNotification("Loading more bookmarks...", "info", 1500);

    // Simulate API call for next page of bookmarks
    setTimeout(() => {
      const startIndex = page * 6; // Get next set of 6 items
      const newBookmarks = MOCK_BOOKMARKS.slice(startIndex, startIndex + 6);

      setBookmarks(prev => [...prev, ...newBookmarks]);
      setPage(prev => prev + 1);
      setHasMore(newBookmarks.length === 6); // If less than 6, no more to load
      setLoading(false);
      showNotification(`Loaded ${newBookmarks.length} more bookmarks.`, 'info');
    }, 1000);
  }, [loading, hasMore, page, showNotification]);

  const handleRemoveBookmark = useCallback(async (id) => {
    setLoading(true);
    // Simulate API call to delete a bookmark
    // Backend API: DELETE /api/bookmarks/{id}
    setTimeout(() => {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      setLoading(false);
      showNotification("Bookmark removed successfully!", "success");
      setConfirmation(null); // Close confirmation dialog
    }, 500);
  }, [showNotification]);

  const handleCreateFolder = useCallback(async (folderName) => {
    if (!folderName.trim()) {
      showNotification("Folder name cannot be empty.", "error");
      return;
    }
    setLoading(true);
    // Simulate API call to create a new folder
    // Backend API: POST /api/folders with { name: folderName }
    setTimeout(() => {
      const newFolder = { id: `f-${Date.now()}`, name: folderName.trim() };
      setFolders(prev => [...prev, newFolder]);
      setLoading(false);
      showNotification(`Folder "${folderName}" created successfully!`, "success");
    }, 500);
  }, [showNotification]);

  const showConfirmation = useCallback((message, onConfirm, onCancel, title) => {
    setConfirmation({ message, onConfirm, onCancel, title });
  }, []);

  const contextValue = useMemo(() => ({
    bookmarks,
    folders,
    loading,
    hasMore,
    userId,
    loadMoreBookmarks,
    handleRemoveBookmark,
    handleCreateFolder,
    showConfirmation,
    showNotification
  }), [
    bookmarks, folders, loading, hasMore, userId,
    loadMoreBookmarks, handleRemoveBookmark, handleCreateFolder, showConfirmation, showNotification
  ]);

  return (
    <BookmarkContext.Provider value={contextValue}>
      {children}
      <Notification notification={notification} clearNotification={clearNotification} />
      {confirmation && (
        <ConfirmationDialog
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
          title={confirmation.title}
        />
      )}
    </BookmarkContext.Provider>
  );
};

// Main App Component
export default function ChatBuzzBookmarks() {
  return (
    <BookmarkProvider>
      <ChatBuzzBookmarksContent />
    </BookmarkProvider>
  );
}

// Content component that consumes the context
const ChatBuzzBookmarksContent = () => {
  const {
    bookmarks,
    folders,
    loading,
    hasMore,
    userId,
    loadMoreBookmarks,
    handleCreateFolder,
    showNotification
  } = useContext(BookmarkContext);

  const observerRef = useRef(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreBookmarks();
      }
    }, { threshold: 0.1 });

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loading, hasMore, loadMoreBookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) {
      return bookmarks;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return bookmarks.filter(b =>
      b.title?.toLowerCase().includes(lowerCaseQuery) ||
      b.content?.toLowerCase().includes(lowerCaseQuery) ||
      b.author?.toLowerCase().includes(lowerCaseQuery) ||
      b.url?.toLowerCase().includes(lowerCaseQuery) ||
      b.domain?.toLowerCase().includes(lowerCaseQuery) ||
      b.description?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [bookmarks, searchQuery]);

  const renderBookmark = useCallback((bookmark) => {
    switch (bookmark.type) {
      case 'post':
        return <PostCard key={bookmark.id} bookmark={bookmark} />;
      case 'video':
        return <VideoCard key={bookmark.id} bookmark={bookmark} />;
      case 'link':
        return <LinkCard key={bookmark.id} bookmark={bookmark} />;
      default:
        console.warn(`Unknown bookmark type: ${bookmark.type}`);
        return null;
    }
  }, []);

  const onCreateFolder = useCallback(() => {
    handleCreateFolder(newFolderName);
    setNewFolderName('');
    setShowCreateFolder(false);
  }, [newFolderName, handleCreateFolder]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-inter">
      {/* Tailwind CSS CDN - Ensure it's loaded once in your HTML */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter Font - Ensure it's loaded once in your HTML */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        {`
        body { font-family: 'Inter', sans-serif; }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.3s ease-out forwards; }
        `}
      </style>

      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-6 h-6 text-blue-400" aria-hidden="true" />
          <h1 className="text-xl font-bold">Bookmarks</h1>
        </div>
        <div className="flex items-center space-x-4">
          {userId && (
            <span className="text-sm text-gray-400 hidden md:block">User ID: <span className="font-mono text-gray-300">{userId}</span></span>
          )}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105"
            aria-label="Create new folder"
          >
            <FolderPlus className="w-4 h-4 mr-2" aria-hidden="true" /> New Folder
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-6 flex-grow w-full">
        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search bookmarks by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-500"
              aria-label="Search bookmarks"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-700 hover:text-white'} transform hover:scale-105`}
              aria-label="Switch to grid view"
              title="Grid View"
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-700 hover:text-white'} transform hover:scale-105`}
              aria-label="Switch to list view"
              title="List View"
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bookmarks Display Area */}
        {loading && bookmarks.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" aria-label="Loading bookmarks" />
            <p className="text-gray-400">Loading your bookmarks...</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Bookmark className="w-12 h-12 text-gray-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-400">No bookmarks found</h3>
            {searchQuery && (
              <p className="text-gray-500 mt-2">Try adjusting your search or clearing the filter.</p>
            )}
            {!searchQuery && (
              <p className="text-gray-500 mt-2">Add some bookmarks to get started!</p>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredBookmarks.map(renderBookmark)}
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div ref={observerRef} className="h-10 flex items-center justify-center">
            {loading && (
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" aria-label="Loading more bookmarks" />
            )}
          </div>
        )}
        {!hasMore && filteredBookmarks.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            You've reached the end of your bookmarks!
          </div>
        )}
      </main>

      <CreateFolderModal
        show={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreate={onCreateFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
      />
    </div>
  );
};
