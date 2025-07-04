import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Search,
  Heart,
  Bookmark,
  Bell,
  Image as ImageIcon,
  Loader2, // Still useful if you want to keep it for other loading animations
  Send,
  MessageCircle,
  Share2,
  ChevronUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants (consider moving to a separate constants file if project grows) ---

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_AVATAR = 'https://via.placeholder.com/40/0A0A0A/FFFFFF?text=NA';
const DEFAULT_COVER_IMAGE = 'https://via.placeholder.com/1200x300/0A0A0A/FFFFFF?text=No+Cover';
const PHOTOS_PER_LOAD = 8; // Number of photos to load per "Load More" click

// --- Utility Functions (consider moving to a separate utils file) ---
const formatCount = (count) => {
  if (count === null || count === undefined) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
};

// --- Reusable Components ---

// Component for displaying user stats (followers, following, posts)
function UserStats({ count, label }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center sm:block" // Center for mobile
    >
      <strong className="text-white text-lg sm:text-xl font-bold">{formatCount(count)}</strong>{' '}
      <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
    </motion.span>
  );
}

UserStats.propTypes = {
  count: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

// Component for a single photo in the gallery
function PhotoCard({ photo, onToggleLike, onToggleBookmark }) {
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const handlePostComment = () => {
    if (commentText.trim()) {
      console.log(`Commenting "${commentText}" on photo ${photo.id}`);
      // TODO: Integrate with backend API to post comment
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-xl shadow-lg bg-slate-800 flex flex-col"
    >
      <div className="relative w-full h-48 sm:h-64 overflow-hidden">
        <img
          src={photo.src || DEFAULT_COVER_IMAGE}
          alt={photo.alt || `Photo by ${photo.author || 'unknown'}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_COVER_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleLike(photo.id)}
              className={`${photo.liked ? 'text-red-500' : 'text-white'} p-2 rounded-full bg-slate-900/50 backdrop-blur-sm`}
              aria-label={photo.liked ? 'Unlike photo' : 'Like photo'}
            >
              <Heart className={`w-5 h-5 ${photo.liked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleBookmark(photo.id)}
              className={`${photo.bookmarked ? 'text-yellow-400' : 'text-white'} p-2 rounded-full bg-slate-900/50 backdrop-blur-sm`}
              aria-label={photo.bookmarked ? 'Remove bookmark' : 'Bookmark photo'}
            >
              <Bookmark className={`w-5 h-5 ${photo.bookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="text-white p-2 rounded-full bg-slate-900/50 backdrop-blur-sm"
              aria-label="Comment on photo"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white p-2 rounded-full bg-slate-900/50 backdrop-blur-sm"
              aria-label="Share photo"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <p className="text-sm font-semibold text-white truncate">{photo.alt || 'Untitled Photo'}</p>
        <p className="text-xs text-slate-400">by {photo.author || 'Unknown'}</p>
        <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
          <span>{formatCount(photo.likes || 0)} Likes</span>
          <span>{formatCount(photo.commentsCount || 0)} Comments</span>
        </div>
        <AnimatePresence>
          {showCommentInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Comment input"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePostComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  aria-label="Post comment"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

PhotoCard.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    src: PropTypes.string,
    alt: PropTypes.string,
    author: PropTypes.string,
    liked: PropTypes.bool.isRequired,
    bookmarked: PropTypes.bool.isRequired,
    likes: PropTypes.number,
    commentsCount: PropTypes.number,
  }).isRequired,
  onToggleLike: PropTypes.func.isRequired,
  onToggleBookmark: PropTypes.func.isRequired,
};

// --- Main PhotoPage Component ---
export default function PhotoPage() {
  const navigate = useNavigate();

  // Mock Data - Directly initialized
  const mockProfileUser = {
    id: 'Hitesh',
    name: 'hitesh',
    subtitle: 'Exploring the world through my lens.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=300&fit=crop',
    followersCount: 1250,
    followingCount: 840,
    postsCount: 127,
    isFollowing: false,
  };

  const mockAllPhotos = Array.from({ length: 20 }, (_, i) => ({
    id: `img${i + 1}`,
    src: `https://picsum.photos/seed/${Math.random()}/400/300`, // Random images
    alt: `Beautiful scenic view ${i + 1}`,
    author: `PhotoBy_${String.fromCharCode(65 + i)}`,
    liked: i % 3 === 0, // Some are liked
    bookmarked: i % 5 === 0, // Some are bookmarked
    likes: Math.floor(Math.random() * 500) + 50,
    commentsCount: Math.floor(Math.random() * 50) + 5,
  }));

  // --- State Management ---
  const [activeTab, setActiveTab] = useState('Photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileUser, setProfileUser] = useState(mockProfileUser); // Initialize directly
  const [allPhotoGallery, setAllPhotoGallery] = useState(mockAllPhotos); // Initialize directly
  const [photosLoadedCount, setPhotosLoadedCount] = useState(PHOTOS_PER_LOAD); // For "Load More"
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Simulate notifications

  // Mock current user data (ideally fetched from authentication context/API)
  const currentUser = useMemo(() => ({
    id: 'current-user-123',
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
  }), []);

  // Initialize displayedPhotos based on initial mock data and PHOTOS_PER_LOAD
  const [displayedPhotos, setDisplayedPhotos] = useState(mockAllPhotos.slice(0, PHOTOS_PER_LOAD));


  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Event Handlers ---
  const handleToggleLike = useCallback(async (id) => {
    setDisplayedPhotos((prev) =>
      prev.map((img) => (img.id === id ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 } : img))
    );
    try {
      // Simulate API call for liking/unliking
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`Updated like status for photo ${id}`);
    } catch (err) {
      console.error(`Failed to update like for photo ${id}:`, err);
      setDisplayedPhotos((prev) =>
        prev.map((img) => (img.id === id ? { ...img, liked: !img.liked, likes: img.liked ? img.likes + 1 : img.likes - 1 } : img))
      );
      // In a real app, show a toast notification here
    }
  }, []);

  const handleToggleBookmark = useCallback(async (id) => {
    setDisplayedPhotos((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, bookmarked: !img.bookmarked } : img
      )
    );
    try {
      // Simulate API call for bookmarking/unbookmarking
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`Updated bookmark status for photo ${id}`);
    } catch (err) {
      console.error(`Failed to update bookmark for photo ${id}:`, err);
      setDisplayedPhotos((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, bookmarked: !img.bookmarked } : img
        )
      );
      // In a real app, show a toast notification here
    }
  }, []);

  const handleFollowToggle = useCallback(async () => {
    if (!profileUser) return;
    const newFollowingStatus = !profileUser.isFollowing;
    setProfileUser((prev) => ({
      ...prev,
      isFollowing: newFollowingStatus,
      followersCount: newFollowingStatus ? prev.followersCount + 1 : prev.followersCount - 1,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Updated follow status for ${profileUser.name}`);
    } catch (err) {
      console.error(`Failed to update follow status for ${profileUser.name}:`, err);
      setProfileUser((prev) => ({
        ...prev,
        isFollowing: !newFollowingStatus,
        followersCount: !newFollowingStatus ? prev.followersCount + 1 : prev.followersCount - 1,
      }));
      // In a real app, show a toast notification here
    }
  }, [profileUser]);

  const handleLoadMorePhotos = useCallback(() => {
    const nextPhotos = allPhotoGallery.slice(photosLoadedCount, photosLoadedCount + PHOTOS_PER_LOAD);
    setDisplayedPhotos((prev) => [...prev, ...nextPhotos]);
    setPhotosLoadedCount((prev) => prev + PHOTOS_PER_LOAD);
  }, [allPhotoGallery, photosLoadedCount]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const filteredPhotos = useMemo(() => {
    // If there's a search query, filter the *entire* gallery, not just displayed photos
    if (!searchQuery) {
      return displayedPhotos; // Show currently loaded photos if no search
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    // Filter from the entire gallery to allow searching across all available photos
    return allPhotoGallery.filter(
      (photo) =>
        photo.alt.toLowerCase().includes(lowerCaseQuery) ||
        photo.author.toLowerCase().includes(lowerCaseQuery)
    );
  }, [displayedPhotos, searchQuery, allPhotoGallery]); // Depend on allPhotoGallery as well

  // This should only track if there are more photos *in the full gallery* to load
  const hasMorePhotos = photosLoadedCount < allPhotoGallery.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans antialiased relative">
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
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs animate-pulse ring-2 ring-slate-800" aria-label="New notifications"></span>
            )}
            <span className="sr-only group-hover:not-sr-only absolute bg-slate-700 text-white text-xs px-2 py-1 rounded bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Notifications</span>
          </button>
          <img src={currentUser.avatar || DEFAULT_AVATAR} alt={`${currentUser.name}'s avatar`} className="w-8 h-8 rounded-full object-cover border border-slate-600 shadow-sm" />
          <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
        </nav>
      </motion.header>

      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-800">
        <img
          src={profileUser.coverImage || DEFAULT_COVER_IMAGE}
          alt={`${profileUser.name}'s cover`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_COVER_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <img
              src={profileUser.avatar || DEFAULT_AVATAR}
              alt={`${profileUser.name}'s profile`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800 shadow-lg ring-4 ring-slate-900"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="pb-2">
              <h1 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-0">{profileUser.name}</h1>
              <p className="text-slate-400 text-sm sm:text-base">{profileUser.subtitle}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-slate-400">
                <UserStats count={profileUser.postsCount} label="posts" />
                <UserStats count={profileUser.followersCount} label="followers" />
                <UserStats count={profileUser.followingCount} label="following" />
              </div>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0 pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold ${profileUser.isFollowing ? 'bg-slate-700 text-white hover:bg-slate-600 shadow-md' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}
              aria-label={profileUser.isFollowing ? 'Unfollow user' : 'Follow user'}
            >
              {profileUser.isFollowing ? 'Following' : 'Follow'}
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

        {/* Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap space-x-6 border-b border-slate-700 mb-6 custom-scrollbar" role="tablist">
          {['Posts', 'About', 'Photos', 'Videos', 'Friends'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 transition-all duration-300 text-sm sm:text-base font-medium relative group ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'Photos' && (
            <motion.section
              key="photos-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
              role="tabpanel"
              aria-labelledby="Photos"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Photos ({filteredPhotos.length} {searchQuery ? 'matching' : 'of'} {allPhotoGallery.length})</h2>
              {filteredPhotos.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {filteredPhotos.map((img) => (
                      <PhotoCard
                        key={img.id}
                        photo={img}
                        onToggleLike={handleToggleLike}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg font-medium">No photos found matching your criteria.</p>
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="mt-4 text-blue-400 hover:underline">
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Show "Load More" only if not searching and there are more photos to load */}
              {hasMorePhotos && !searchQuery && (
                <div className="flex justify-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadMorePhotos}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
                  >
                    Load More Photos
                  </motion.button>
                </div>
              )}
            </motion.section>
          )}

          {activeTab !== 'Photos' && (
            <motion.div
              key={`${activeTab}-tab`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center"
              role="tabpanel"
              aria-labelledby={activeTab}
            >
              <h2 className="text-2xl font-bold mb-4 text-white">{activeTab}</h2>
              <p className="text-slate-400 text-lg">Content for {activeTab} is under construction. Please check back later!</p>
              <p className="text-slate-500 text-sm mt-2">We're working hard to bring you more exciting features.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 p-3 rounded-full shadow-lg text-white hover:bg-blue-700 transition-colors duration-200 z-40"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}   