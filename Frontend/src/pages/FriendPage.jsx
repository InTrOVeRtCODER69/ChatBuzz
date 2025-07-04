import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, MessageCircle, UserPlus, Bell, Heart, Share, Bookmark, AlertCircle, Loader2, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const mainContentRef = useRef(null);
  const profileInfoRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const navigate = useNavigate();


  // User data with fallback values
  const currentUser = {
    id: 'current-user-123',
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=40&h=40&fit=crop&crop=face'
  };

  const profileUser = {
    id: 'Hitesh',
    name: 'hitesh',
    subtitle: 'Tier 2',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=96&h=96&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=300&fit=crop',
    followersCount: 1250,
    followingCount: 840,
    postsCount: 127,
    friendsCount: 12
  };

  const tabs = ['Posts', 'About', 'Photos', 'Videos', 'Friends'];

  const friends = [
    { id: 1, name: 'Oliver', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 2, name: 'Freya', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 3, name: 'Theo', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face', online: false },
    { id: 4, name: 'Ava', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 5, name: 'Amelia', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face', online: false },
    { id: 6, name: 'George', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 7, name: 'Isla', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=64&h=64&fit=crop&crop=face', online: false },
    { id: 8, name: 'Jackson', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 9, name: 'Harry', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face', online: false },
    { id: 10, name: 'Poppy', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face', online: true },
    { id: 11, name: 'Liam', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=64&h=64&fit=crop&crop=face', online: false },
    { id: 12, name: 'Chloe', tier: 'Tier 2', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&h=64&fit=crop&crop=face', online: true }
  ];

  const favorites = [
    { id: 'fav-1', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop', alt: 'Autumn leaves' },
    { id: 'fav-2', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop', alt: 'Flowers' }
  ];

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Smooth scroll animation function with error handling
  const smoothScrollTo = useCallback((targetPosition, duration = 800) => {
    try {
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic);
        
        if (timeElapsed < duration && progress < 1) {
          requestAnimationFrame(animation);
        } else {
          setIsScrolling(false);
        }
      };

      requestAnimationFrame(animation);
    } catch (err) {
      console.error('Scroll animation error:', err);
      setIsScrolling(false);
    }
  }, []);

  // Utility functions
  const formatCount = useCallback((count) => {
    if (typeof count !== 'number' || isNaN(count)) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }, []);

  const handleFollow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsFollowing(!isFollowing);
    } catch (err) {
      setError('Failed to update follow status. Please try again.');
      console.error('Follow error:', err);
    } finally {
      setLoading(false);
    }
  }, [isFollowing]);

  const handleSearch = useCallback((query) => {
    try {
      setSearchQuery(query);
      setError(null);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    }
  }, []);

  const handleImageError = useCallback((imageId) => {
    setImageErrors(prev => new Set(prev).add(imageId));
  }, []);

  const handleFriendClick = useCallback((friend) => {
    try {
      if (!friend?.id) {
        throw new Error('Invalid friend data');
      }

      setIsScrolling(true);
      setSelectedFriend(friend);
      setError(null);
      
      // First, scroll to profile info section with smooth animation
      if (profileInfoRef.current) {
        const profileInfoTop = profileInfoRef.current.offsetTop - 100;
        smoothScrollTo(profileInfoTop, 1000);
      }
      
      // After scroll animation, simulate navigation
      scrollTimeoutRef.current = setTimeout(() => {
        console.log(`Navigating to ${friend.name}'s profile...`);
        setSelectedFriend(null);
        // Here you would handle actual navigation
      }, 1200);
    } catch (err) {
      console.error('Friend click error:', err);
      setError('Failed to load friend profile. Please try again.');
      setIsScrolling(false);
    }
  }, [smoothScrollTo]);

  const scrollToTop = useCallback(() => {
    try {
      smoothScrollTo(0, 600);
    } catch (err) {
      console.error('Scroll to top error:', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [smoothScrollTo]);

  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  // Image component with error handling
  const SafeImage = useMemo(() => React.memo(({ src, alt, className, fallback, ...props }) => {
    const [hasError, setHasError] = useState(false);
    
    const handleError = () => {
      setHasError(true);
      if (props.onError) props.onError();
    };

    if (hasError) {
      return (
        <div className={`${className} bg-slate-700 flex items-center justify-center`}>
          <div className="text-slate-400 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    );
  }), []);

  const FriendCard = useMemo(() => React.memo(({ friend }) => (
    <div 
      className={`bg-slate-800 rounded-lg p-4 flex flex-col items-center space-y-3 hover:bg-slate-700 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isScrolling ? 'pointer-events-none opacity-50' : ''
      }`}
      onClick={() => handleFriendClick(friend)}
      onKeyDown={(e) => handleKeyDown(e, () => handleFriendClick(friend))}
      tabIndex={0}
      role="button"
      aria-label={`View ${friend.name}'s profile`}
    >
      <div className="relative">
        <SafeImage
          src={friend.avatar}
          alt={`${friend.name}'s avatar`}
          className="w-16 h-16 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {friend.online && (
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"
            aria-label="Online"
          />
        )}
      </div>
      <div className="text-center">
        <h3 className="text-white font-medium transition-colors duration-200 group-hover:text-blue-400">
          {friend.name}
        </h3>
        <p className="text-slate-400 text-sm">{friend.tier}</p>
      </div>
      <button 
        className="p-1 hover:bg-slate-600 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          console.log(`More options for ${friend.name}`);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            console.log(`More options for ${friend.name}`);
          }
        }}
        aria-label={`More options for ${friend.name}`}
      >
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  )), [handleFriendClick, handleKeyDown, isScrolling, SafeImage]);

  // Filtered friends with memoization
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => 
      searchQuery === '' || 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          You are currently offline. Some features may not work properly.
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 hover:bg-red-700 rounded p-1"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      {isScrolling && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-40">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      )}

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 z-40"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <header className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button 
            className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={() => console.log('Navigate to dashboard')}
          >
            ChatBuzz
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === 'Friends' ? "Find in friends" : "Type to search"}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-all duration-200"
              aria-label="Search"
              disabled={!isOnline}
            />
          </div>
        </div>
        <nav className="flex items-center space-x-3">
          <button 
            className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full text-xs animate-pulse" aria-hidden="true"></span>
          </button>
          <SafeImage
            src={currentUser.avatar}
            alt={`${currentUser.name}'s avatar`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{currentUser.name}</span>
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
            5
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <SafeImage
          src={profileUser.coverImage}
          alt="Profile cover"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Profile Info */}
      <div ref={profileInfoRef} className="px-6 -mt-20 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-end space-x-4">
            <SafeImage
              src={profileUser.avatar}
              alt={`${profileUser.name}'s profile`}
              className="w-24 h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800 transition-transform duration-300 hover:scale-110"
            />
            <div className="pb-2">
              <h1 className="text-2xl font-bold">{profileUser.name}</h1>
              {profileUser.subtitle && (
                <p className="text-slate-400">{profileUser.subtitle}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                <span><strong className="text-white">{formatCount(profileUser.postsCount)}</strong> posts</span>
                <span><strong className="text-white">{formatCount(profileUser.followersCount)}</strong> followers</span>
                <span><strong className="text-white">{formatCount(profileUser.followingCount)}</strong> following</span>
                <span><strong className="text-white">{formatCount(profileUser.friendsCount)}</strong> friends</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pb-2">
            <button
              onClick={handleFollow}
              disabled={loading || !isOnline}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                isFollowing
                  ? 'bg-slate-600 text-white hover:bg-slate-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
            <button 
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isOnline}
            >
              Message
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8 border-b border-slate-700 mb-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Posts') {
                   navigate('/posts'); 
                } else {
                  setActiveTab(tab);
                }
              }}
              role="tab"
              aria-selected={activeTab === tab}
              className={`py-3 px-1 border-b-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-slate-800 rounded-lg p-4 mb-6 transform transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <SafeImage
                  src={profileUser.avatar}
                  alt={`${profileUser.name}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{profileUser.name}</p>
                  {profileUser.subtitle && (
                    <p className="text-xs text-slate-400">{profileUser.subtitle}</p>
                  )}
                </div>
                <button 
                  className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" 
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              {favorites.length > 0 && (
                <div>
                  <h2 className="font-medium mb-3">Favorites</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {favorites.map((item) => (
                      <button
                        key={item.id}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`View ${item.alt}`}
                      >
                        <SafeImage
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main ref={mainContentRef} className="col-span-12 lg:col-span-9">
            {activeTab === 'Friends' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Friends ({formatCount(filteredFriends.length)})</h2>
                  <button 
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isOnline}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                </div>

                {/* Friends Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredFriends.map((friend, index) => (
                    <div
                      key={friend.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <FriendCard friend={friend} />
                    </div>
                  ))}
                </div>

                {/* No results message */}
                {searchQuery && filteredFriends.length === 0 && (
                  <div className="text-center py-12 text-slate-400 animate-fadeIn">
                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-lg mb-2">No friends found</p>
                    <p>No friends match "{searchQuery}"</p>
                  </div>
                )}

                {/* Empty state */}
                {friends.length === 0 && (
                  <div className="text-center py-12 text-slate-400 animate-fadeIn">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-lg mb-2">No friends yet</p>
                    <p>Start connecting with people to build your network!</p>
                  </div>
                )}
              </div>
            )}

            {/* Other tab content placeholders */}
            {activeTab !== 'Friends' && activeTab !== 'Posts' && (
              <div className="bg-slate-800 rounded-lg p-8 text-center animate-fadeIn">
                <h2 className="text-xl font-semibold mb-2">{activeTab}</h2>
                <p className="text-slate-400">Content for {activeTab} coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .scrolling {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-pulse,
          .animate-bounce {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FriendPage;