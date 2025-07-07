import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MessageCircle, MoreHorizontal, Heart, Share, Bookmark, Bell, Upload, Image as ImageIcon, Send, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants (consider moving to a separate constants file if project grows) ---
const DEFAULT_AVATAR = 'https://via.placeholder.com/40/0A0A0A/FFFFFF?text=NA';
const DEFAULT_COVER_IMAGE = 'https://via.placeholder.com/1200x300/0A0A0A/FFFFFF?text=No+Cover';

const AboutPage = () => {
    // Core state management
    const [activeTab, setActiveTab] = useState('About'); // Default to 'About' tab
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // User and profile state (mock data)
    const [currentUser] = useState({
        id: 'current-user-123',
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=40&h=40&fit=crop&crop=face'
    });

    const [profileUser, setProfileUser] = useState({
        id: 'Hitesh',
        name: 'hitesh',
        subtitle: 'Exploring the world through my lens.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=96&h=96&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=300&fit=crop',
        followersCount: 1250,
        followingCount: 840,
        postsCount: 127,
        isFollowing: false,
        // New about section content
        about: {
            bio: "Coder by day, bug-fixer by night, and part-time overthinker who still misses his ex more than missing semicolons. I love tech, build cool stuff, and occasionally cry in dark mode. Hit me up if you want to talk code... or heartbreak. Either works.",
            location: "Hawaii, USA",
            joined: "January 2069",
            website: "www.gitPushHerAway.com",
            interests: 
            [
                "Photography",
                "Debugging Life",
                "Solo Travel",
                "Dark Mode Dev",
                "Reading Old Chats",
                "Overthinking",
                "Late Night Coding",
                "Crying in Lo-fi",
            ],
            socialLinks: {
                twitter: "hitesh_tweets",
                instagram: "hitesh_visuals",
                linkedin: "hitesh-profile"
            }
        }
    });

    // Favorites state (mock data)
    const [favorites] = useState([
        { id: 'fav-1', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop', alt: 'Autumn leaves' },
        { id: 'fav-2', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop', alt: 'Flowers' }
    ]);

    // Simulate API calls (kept for consistency, though not directly used for 'About' content)
    const apiCall = useCallback(async (endpoint, options = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            switch (endpoint) {
                case 'follow':
                    return { success: true, isFollowing: !profileUser.isFollowing };
                default:
                    throw new Error('Unknown endpoint');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [profileUser.isFollowing]);

    // Event handlers
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

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    // Utility functions
    const formatCount = useCallback((count) => {
        if (count === null || count === undefined) return '0';
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
        return `${(count / 1000000).toFixed(1)}m`;
    }, []);

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
        <div className="min-h-screen bg-slate-900 text-white font-sans antialiased">
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
                        <AnimatePresence>
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
            <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-800">
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
            <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                        <img
                            src={profileUser.avatar || DEFAULT_AVATAR}
                            alt={`${profileUser.name}'s profile`}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800 shadow-lg ring-4 ring-slate-900"
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
                            className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold ${profileUser.isFollowing
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
                                } else if (tab === 'Posts') { // Navigate to root for Posts
                                    navigate('/profile-feed');
                                } else { // For 'About' tab, stay on this page and set active tab
                                    setActiveTab(tab);
                                }
                            }}
                            role="tab"
                            aria-selected={activeTab === tab}
                            className={`py-3 px-1 border-b-2 transition-all duration-300 text-sm sm:text-base font-medium relative group ${activeTab === tab
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-400 hover:text-white'
                                }`}
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

                {/* Error Display */}
                <AnimatePresence>
                    {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
                </AnimatePresence>

                {/* Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
                                                transition={{ delay: index * 0.05 + 0.3, duration: 0.3 }}
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

                    {/* Main Content - About Section */}
                    <main className="md:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === 'About' && (
                                <motion.div
                                    key="about-tab-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-slate-800 rounded-lg p-6 mb-6 shadow-md"
                                >
                                    <h2 className="text-2xl font-bold mb-4 text-white">About {profileUser.name}</h2>

                                    {profileUser.about && (
                                        <div className="space-y-4 text-slate-200">
                                            {profileUser.about.bio && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Bio</h3>
                                                    <p className="whitespace-pre-wrap">{profileUser.about.bio}</p>
                                                </div>
                                            )}
                                            {profileUser.about.location && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Location</h3>
                                                    <p>{profileUser.about.location}</p>
                                                </div>
                                            )}
                                            {profileUser.about.joined && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Joined</h3>
                                                    <p>{profileUser.about.joined}</p>
                                                </div>
                                            )}
                                            {profileUser.about.website && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Website</h3>
                                                    <a href={profileUser.about.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                        {profileUser.about.website}
                                                    </a>
                                                </div>
                                            )}
                                            {profileUser.about.interests && profileUser.about.interests.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Interests</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profileUser.about.interests.map((interest, idx) => (
                                                            <span key={idx} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                                                                {interest}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {profileUser.about.socialLinks && (
                                                <div>
                                                    <h3 className="font-semibold text-blue-400 mb-1">Social Links</h3>
                                                    <div className="flex space-x-4">
                                                        {profileUser.about.socialLinks.twitter && (
                                                            <a href={`https://twitter.com/${profileUser.about.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                                Twitter
                                                            </a>
                                                        )}
                                                        {profileUser.about.socialLinks.instagram && (
                                                            <a href={`https://instagram.com/${profileUser.about.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                                Instagram
                                                            </a>
                                                        )}
                                                        {profileUser.about.socialLinks.linkedin && (
                                                            <a href={`https://linkedin.com/in/${profileUser.about.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                                LinkedIn
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!profileUser.about && (
                                        <p className="text-slate-400 text-lg text-center">No 'About' information available for this user.</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Other tab content placeholders (if navigated to other tabs) */}
                            {activeTab !== 'About' && (
                                <motion.div
                                    key={`${activeTab}-tab-placeholder`}
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

export default AboutPage;
