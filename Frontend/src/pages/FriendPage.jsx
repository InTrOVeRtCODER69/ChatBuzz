import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    UserPlus,
    UserMinus,
    Bell,
    Users,
    ChevronUp,
    X,
    MessageSquare,
    Info,
    Clock,
    UserX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants (consider moving to a separate constants file if project grows) ---

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_AVATAR = 'https://via.placeholder.com/40/0A0A0A/FFFFFF?text=NA';
const DEFAULT_COVER_IMAGE = 'https://via.placeholder.com/1200x300/0A0A0A/FFFFFF?text=No+Cover';
const FRIENDS_PER_LOAD = 8; // Number of friends to load per "Load More" click

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

// Component for a single friend card
function FriendCard({ friend, onToggleFollow }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const cardRef = useRef(null); // Ref for the entire card

    const handleCardClick = useCallback((event) => {
        // Only toggle if the click originated on the card itself, not the dropdown items
        if (cardRef.current && cardRef.current.contains(event.target)) {
            // Prevent clicks on dropdown items from closing the dropdown immediately after opening
            if (!dropdownRef.current || !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen((prev) => !prev);
            }
        }
    }, []);

    // Ref for the dropdown content itself (needed for click outside logic)
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the dropdown is open and the click is outside the entire card
            if (isDropdownOpen && cardRef.current && !cardRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]); // Re-run effect when dropdown state changes

    return (
        <motion.div
            ref={cardRef} // Attach ref to the entire card
            layout // Essential for smooth re-positioning of other grid items
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, layout: { type: "spring", damping: 20, stiffness: 300 } }}
            whileHover={{ scale: 1.02, backgroundColor: "#334155" }} // Subtle scale up and darker background on hover
            whileTap={{ scale: 0.98 }} // Slight squash on tap/click
            className={`bg-slate-800 rounded-xl shadow-lg p-4 transition-colors duration-200 cursor-pointer relative flex flex-row items-center space-x-3 pr-4 ${
                isDropdownOpen ? 'bg-slate-700' : 'hover:bg-slate-700'
            }`}
            onClick={handleCardClick}
        >
            {/* Friend's Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={friend.avatar || DEFAULT_AVATAR}
                    alt={`${friend.name}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 bg-slate-700"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                />
            </div>

            {/* Friend's Name and Subtitle */}
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white truncate">{friend.name}</h3>
                <p className="text-sm text-slate-400 truncate">Text 2</p>
            </div>

            {/* Dropdown Menu - appears below the main card content and pushes down */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        ref={dropdownRef} // Attach ref to the dropdown content for click outside logic
                        initial={{ opacity: 0, height: 0, y: -5 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-slate-700 rounded-lg shadow-xl z-20 overflow-hidden border border-slate-600 p-2"
                        onClick={(e) => e.stopPropagation()} // Prevent card click from toggling when clicking dropdown
                    >
                        <ul className="flex flex-col space-y-1">
                            <li>
                                <motion.button
                                    whileHover={{ backgroundColor: '#475569' }} // Tailwind slate-600
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full text-left px-3 py-2 cursor-pointer text-sm flex items-center space-x-2 text-white rounded-md transition-colors duration-100"
                                    onClick={() => { setIsDropdownOpen(false); console.log("About Section Clicked"); }}
                                >
                                    <Info className="w-4 h-4" />
                                    <span>About Section</span>
                                </motion.button>
                            </li>
                            <li>
                                <motion.button
                                    whileHover={{ backgroundColor: '#475569' }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full text-left px-3 py-2 cursor-pointer text-sm flex items-center space-x-2 text-white rounded-md transition-colors duration-100"
                                    onClick={() => { setIsDropdownOpen(false); console.log("Message Clicked"); }}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Message {friend.name}</span>
                                </motion.button>
                            </li>
                            <li>
                                <motion.button
                                    whileHover={{ backgroundColor: '#991B1B' }} // Tailwind red-800
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full text-left px-3 py-2 cursor-pointer text-sm flex items-center space-x-2 text-red-400 rounded-md transition-colors duration-100"
                                    onClick={() => { setIsDropdownOpen(false); console.log("Block Clicked"); }}
                                >
                                    <UserX className="w-4 h-4" />
                                    <span>Block {friend.name}</span>
                                </motion.button>
                            </li>
                            <li>
                                <motion.button
                                    whileHover={{ backgroundColor: '#475569' }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full text-left px-3 py-2 cursor-pointer text-sm flex items-center space-x-2 text-white rounded-md transition-colors duration-100"
                                    onClick={() => { setIsDropdownOpen(false); console.log("Recent From Clicked"); }}
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>Recent From {friend.name}</span>
                                </motion.button>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

FriendCard.propTypes = {
    friend: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        subtitle: PropTypes.string,
        avatar: PropTypes.string,
        isFollowing: PropTypes.bool.isRequired,
    }).isRequired,
    onToggleFollow: PropTypes.func.isRequired,
};

// --- Main FriendPage Component (no changes needed here) ---
export default function FriendPage() {
    const navigate = useNavigate();

    const profileInfoRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const mainContentRef = useRef(null);

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

    const mockAllFriends = [
        { id: '1', name: 'Oliver', subtitle: 'Aspiring photographer', avatar: 'https://images.unsplash.com/photo-1539571696388-f8ee963d42ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwwfHx8fDE3MTk3NDAwMTJ8MA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '2', name: 'Freya', subtitle: 'Digital artist', avatar: 'https://images.unsplash.com/photo-1500048993953-d23a43626167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDB8fHx8MTcxOTc0MDAwOHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '3', name: 'Theo', subtitle: 'Software engineer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwzMXx8cG9ydHJhaXQlMjBtYW58ZW58MHx8fHwxNzE5NzQwMDc2fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '4', name: 'Ava', subtitle: 'Content creator', avatar: 'https://images.unsplash.com/photo-1520813792240-56ff4260cea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw5fHxwb3J0cmFpdCUyMHdvbWFufGVufDB8fHx8MTcxOTc0MDA0MHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '5', name: 'Amelia', subtitle: 'Travel enthusiast', avatar: 'https://images.unsplash.com/photo-1529629730598-a83d781b0a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw4fHxwb3J0cmFpdCUyMHdvbWFufGVufDB8fHx8MTcxOTc0MDA0MHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '6', name: 'George', subtitle: 'Fitness coach', avatar: 'https://images.unsplash.com/photo-1503443207922-cf52d60f8929?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw2fHxwb3J0cmFpdCUyMG1hbnxlbnwwfHx8fDE3MTk3NDAwMTJ8MA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '7', name: 'Isla', subtitle: 'Fashion blogger', avatar: 'https://images.unsplash.com/photo-1520813792240-56ff4260cea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw3fHxwb3J0cmFpdCUyMHdvbWFufGVufDB8fHx8MTcxOTc0MDA0MHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '8', name: 'Jackson', subtitle: 'Musician & producer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwzNHx8cG9ydHJhaXQlMjBtYW58ZW58MHx8fHwxNzE5NzQwMDc5fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '9', name: 'Harry', subtitle: 'Graphic designer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a6dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZXxlbnwwfHx8fDE3MTk3NDAxNDN8MA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '10', name: 'Poppy', subtitle: 'Student & vlogger', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwyMHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMTUyfDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '11', name: 'Liam', subtitle: 'Entrepreneur', avatar: 'https://images.unsplash.com/photo-1530268729831-4b0b9e1702f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxNXx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMTQ2fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '12', name: 'Chloe', subtitle: 'Chef & food blogger', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwzNHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMTU5fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '13', name: 'Noah', subtitle: 'Web developer', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw1OHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMjA4fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '14', name: 'Sophia', subtitle: 'Illustrator', avatar: 'https://images.unsplash.com/photo-1496302662231-155513271708?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxMzJ8fHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fHx8MTcxOTc0MDI1MHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '15', name: 'Ethan', subtitle: 'AI researcher', avatar: 'https://images.unsplash.com/photo-1463453091185-6156198c8901?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxMjR8fHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fHx8MTcxOTc0MDI0N3ww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '16', name: 'Mia', subtitle: 'Interior designer', avatar: 'https://images.unsplash.com/photo-1499952127937-873094260278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwyMHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMTUyfDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '17', name: 'William', subtitle: 'Environmentalist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwzMXx8cG9ydHJhaXQlMjBtYW58ZW58MHx8fHwxNzE5NzQwMDc2fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '18', name: 'Charlotte', subtitle: 'Fashion designer', avatar: 'https://images.unsplash.com/photo-1508214751196-cadf41b31cd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwzNHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8fHwxNzE5NzQwMTU5fDA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
        { id: '19', name: 'James', subtitle: 'Game developer', avatar: 'https://images.unsplash.com/photo-1520813792240-56ff4260cea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHw3fHxwb3J0cmFpdCUyMHdvbWFufGVufDB8fHx8MTcxOTc0MDA0MHww&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: true },
        { id: '20', name: 'Harper', subtitle: 'Journalist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a6dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzM0NDR8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZXxlbnwwfHx8fDE3MTk3NDAxNDN8MA&ixlib=rb-4.0.3&q=80&w=1080', isFollowing: false },
    ];


    // --- State Management ---
    const [activeTab, setActiveTab] = useState('Friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [profileUser, setProfileUser] = useState(mockProfileUser);
    const [allFriends, setAllFriends] = useState(mockAllFriends);
    const [friendsLoadedCount, setFriendsLoadedCount] = useState(FRIENDS_PER_LOAD);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(true);

    const currentUser = useMemo(() => ({
        id: 'current-user-123',
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    }), []);

    const [displayedFriends, setDisplayedFriends] = useState(mockAllFriends.slice(0, FRIENDS_PER_LOAD));


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


    const handleToggleFollow = useCallback(async (id) => {
        setAllFriends((prev) =>
            prev.map((friend) =>
                friend.id === id ? { ...friend, isFollowing: !friend.isFollowing } : friend
            )
        );
        setDisplayedFriends((prev) =>
            prev.map((friend) =>
                friend.id === id ? { ...friend, isFollowing: !friend.isFollowing } : friend
            )
        );
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            console.log(`Updated follow status for friend ${id}`);
        } catch (err) {
            console.error(`Failed to update follow for friend ${id}:`, err);
            setAllFriends((prev) =>
                prev.map((friend) =>
                    friend.id === id ? { ...friend, isFollowing: !friend.isFollowing } : friend
                )
            );
            setDisplayedFriends((prev) =>
                prev.map((friend) =>
                    friend.id === id ? { ...friend, isFollowing: !friend.isFollowing } : friend
                )
            );
        }
    }, []);


    const handleProfileFollowToggle = useCallback(async () => {
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
        }
    }, [profileUser]);


    const handleLoadMoreFriends = useCallback(() => {
        const nextFriends = allFriends.slice(friendsLoadedCount, friendsLoadedCount + FRIENDS_PER_LOAD);
        setDisplayedFriends((prev) => [...prev, ...nextFriends]);
        setFriendsLoadedCount((prev) => prev + FRIENDS_PER_LOAD);
    }, [allFriends, friendsLoadedCount]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const filteredFriends = useMemo(() => {
        if (!searchQuery) {
            return displayedFriends;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        return allFriends.filter(
            (friend) =>
                friend.name.toLowerCase().includes(lowerCaseQuery) ||
                (friend.subtitle && friend.subtitle.toLowerCase().includes(lowerCaseQuery))
        );
    }, [displayedFriends, searchQuery, allFriends]);

    const hasMoreFriends = friendsLoadedCount < allFriends.length;


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
            <div ref={profileInfoRef} className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
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
                            onClick={handleProfileFollowToggle}
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
                    {activeTab === 'Friends' && (
                        <motion.section
                            key="friends-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="mb-16"
                            role="tabpanel"
                            aria-labelledby="Friends"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-white">Friends ({filteredFriends.length} {searchQuery ? 'matching' : 'of'} {allFriends.length})</h2>
                            {filteredFriends.length > 0 ? (
                                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {filteredFriends.map((friend) => (
                                            <FriendCard
                                                key={friend.id}
                                                friend={friend}
                                                onToggleFollow={handleToggleFollow}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                    <p className="text-lg font-medium">
                                        {searchQuery ? 'No friends found matching your criteria.' : 'No friends to display yet.'}
                                    </p>
                                    {searchQuery && (
                                        <button onClick={handleClearSearch} className="mt-4 text-blue-400 hover:underline">
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            )}

                            
                            {hasMoreFriends && !searchQuery && (
                                <div className="flex justify-center mt-8">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLoadMoreFriends}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
                                    >
                                        Load More Friends
                                    </motion.button>
                                </div>
                            )}
                        </motion.section>
                    )}

                    {activeTab !== 'Friends' && (
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