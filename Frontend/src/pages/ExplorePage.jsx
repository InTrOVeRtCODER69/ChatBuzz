import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Search, TrendingUp, Hash, Users, Zap, MapPin, Eye, Heart, MessageCircle, Share, MoreHorizontal, CheckCircle, Flame, Star, Clock, Filter, Coffee } from 'lucide-react'

// --- Constants (Frontend Defaults / Mock Data) ---
// Frontend Note: These constants currently serve as mock data.
// A backend developer will need to implement APIs to fetch this dynamic content.

const TRENDING_TOPICS = [
  { tag: '#nocode', posts: '2.4K', growth: '+15%', emoji: '⚡', vibe: 'fire' },
  { tag: '#webdev', posts: '1.8K', growth: '+8%', emoji: '💻', vibe: 'cool' },
  { tag: '#designtok', posts: '1.2K', growth: '+12%', emoji: '🎨', vibe: 'aesthetic' },
  { tag: '#startuplife', posts: '956', growth: '+5%', emoji: '🚀', vibe: 'hustle' },
  { tag: '#mindset', posts: '743', growth: '+18%', emoji: '🧠', vibe: 'deep' },
  { tag: '#buildinpublic', posts: '621', growth: '+22%', emoji: '🔥', vibe: 'raw' }
];

const SUGGESTED_USERS = [
  { id: 'user-hitesh', name: 'hitesh.codes', username: 'hitesh_creates', followers: '142K', avatar: '🦄', verified: true, category: 'Tech Creator', vibe: 'iconic', isFollowing: false },
  { id: 'user-navneet', name: 'navneet.builds', username: 'navneetbuilds', followers: '87K', avatar: '🎯', verified: true, category: 'Indie Hacker', vibe: 'goated', isFollowing: false },
  { id: 'user-aryan', name: 'aryan.designs', username: 'aryan', followers: '203K', avatar: '✨', verified: false, category: 'UI Wizard', vibe: 'clean', isFollowing: false },
  { id: 'user-shailaj', name: 'shailaj', username: 'shialaj', followers: '56K', avatar: '🔮', verified: true, category: 'Code Artist', vibe: 'mystic', isFollowing: false }
];

const EXPLORE_CATEGORIES = [
  { name: 'Tech', icon: '⚡', posts: '45.2K', accent: 'border-cyan-400 bg-cyan-400/10 text-cyan-400', id: 'cat-tech' },
  { name: 'Design', icon: '🎨', posts: '32.1K', accent: 'border-pink-400 bg-pink-400/10 text-pink-400', id: 'cat-design' },
  { name: 'Startup', icon: '🚀', posts: '28.7K', accent: 'border-green-400 bg-green-400/10 text-green-400', id: 'cat-startup' },
  { name: 'Art', icon: '✨', posts: '19.4K', accent: 'border-purple-400 bg-purple-400/10 text-purple-400', id: 'cat-art' },
  { name: 'Music', icon: '🎵', posts: '15.8K', accent: 'border-orange-400 bg-orange-400/10 text-orange-400', id: 'cat-music' },
  { name: 'Gaming', icon: '🎮', posts: '12.3K', accent: 'border-red-400 bg-red-400/10 text-red-400', id: 'cat-gaming' }
];

const INITIAL_TRENDING_POSTS = [
  {
    id: 'post-1',
    user: { name: 'navneet', username: 'navneet_builds', avatar: '🌟', verified: true, vibe: 'legendary', tier: 'OG' },
    content: 'just shipped my AI side project in 48 hours and it\'s already trending on PH 💀 sometimes you just gotta send it and see what happens fr fr',
    tags: ['#buildinpublic', '#ai', '#sidehustle'],
    timestamp: '2h',
    location: 'SF',
    stats: { views: '12K', likes: 1200, comments: 89, shares: 156 },
    trending: true,
    mood: 'fire',
    isLiked: false
  },
  {
    id: 'post-2',
    user: { name: 'aryan', username: 'aryanesigns', avatar: '🦋', verified: true, vibe: 'aesthetic', tier: 'Pro' },
    content: 'y\'all... just got my figma file featured and i\'m literally crying 😭 6 months of grinding every single night after my 9-5. proof that consistency > everything',
    tags: ['#design', '#figma', '#grindneverstops'],
    timestamp: '4h',
    location: 'NYC',
    stats: { views: '8.9K', likes: 890, comments: 234, shares: 67 },
    trending: true,
    mood: 'wholesome',
    isLiked: false
  },
  {
    id: 'post-3',
    user: { name: 'shailaj', username: 'shailajbuilds', avatar: '🔥', verified: false, vibe: 'hungry', tier: 'Newbie' },
    content: 'dropped out of college to code full time and just landed my first $10k month 🎯 to everyone saying it\'s impossible - respectfully, you\'re wrong',
    tags: ['#webdev', '#entrepreneur', '#selfmade'],
    timestamp: '6h',
    location: 'Austin',
    stats: { views: '25K', likes: 2100, comments: 445, shares: 189 },
    trending: true,
    mood: 'flex',
    isLiked: false
  }
];

// Mock for "loading more posts"
const MORE_TRENDING_POSTS = [
  {
    id: 'post-4',
    user: { name: 'CoderGirl', username: 'code_queen', avatar: '👩‍💻', verified: true, vibe: 'insightful', tier: 'Pro' },
    content: 'Deep diving into web3 security patterns. The future is decentralised but also requires robust audits. What are your thoughts on ZK-Rollups for dApps?',
    tags: ['#web3', '#security', '#blockchain'],
    timestamp: '8h',
    location: 'Berlin',
    stats: { views: '15K', likes: 1500, comments: 110, shares: 90 },
    trending: false, // Not necessarily trending when loaded later
    mood: 'deep',
    isLiked: false
  },
  {
    id: 'post-5',
    user: { name: 'DesignKid', username: 'pixel_perfect', avatar: '🌟', verified: false, vibe: 'creative', tier: 'Newbie' },
    content: 'Just finished my first full UI/UX case study! It took me weeks but I\'m so proud. Any feedback would be awesome 🙏',
    tags: ['#uiux', '#casestudy', '#design'],
    timestamp: '10h',
    location: 'London',
    stats: { views: '7.5K', likes: 750, comments: 180, shares: 50 },
    trending: false,
    mood: 'wholesome',
    isLiked: false
  },
  {
    id: 'post-6',
    user: { name: 'GrowthGuru', username: 'marketing_maven', avatar: '📈', verified: true, vibe: 'strategic', tier: 'Pro' },
    content: 'Mastering SEO in 2025 is all about E-E-A-T. Anyone else seeing huge shifts from the latest algorithm updates?',
    tags: ['#seo', '#marketing', '#growth'],
    timestamp: '12h',
    location: 'Sydney',
    stats: { views: '10K', likes: 980, comments: 75, shares: 40 },
    trending: false,
    mood: 'deep',
    isLiked: false
  },
];


// --- Sub-Components ---

/**
 * @typedef {Object} UserData
 * @property {string} id - Unique identifier for the user.
 * @property {string} name
 * @property {string} username
 * @property {string} avatar - Emoji or URL to avatar image.
 * @property {boolean} verified
 * @property {string} [vibe] - Optional, for frontend display.
 * @property {string} [tier] - Optional, e.g., 'OG', 'Pro', 'Newbie'.
 * @property {boolean} [isFollowing] - Frontend specific: whether the current user follows this user.
 *
 * @typedef {Object} PostStats
 * @property {string} views
 * @property {number} likes
 * @property {number} comments
 * @property {number} shares
 *
 * @typedef {Object} PostData
 * @property {string} id - Unique identifier for the post.
 * @property {UserData} user
 * @property {string} content
 * @property {string[]} tags
 * @property {string} timestamp - e.g., "2h", "1d".
 * @property {string} [location] - Optional location.
 * @property {PostStats} stats
 * @property {boolean} trending
 * @property {'fire' | 'wholesome' | 'flex' | 'deep'} mood
 * @property {boolean} [isLiked] - Frontend specific: whether the current user has liked this post.
 */

/**
 * PostCard Component
 * Displays a single post with user information, content, tags, and engagement stats.
 * Now includes interactive like functionality.
 *
 * @param {object} props
 * @param {PostData} props.post - The post data object.
 * @param {function} props.onLikeToggle - Callback for when the like button is clicked.
 *
 * @Backend_Developer_Note:
 * This component expects a `PostData` object.
 * - `user.avatar`: Currently uses emojis. In a real app, this would likely be a URL to a user's profile picture.
 * - `post.stats.likes`, `comments`, `shares`: These should be dynamic and update when a user interacts.
 * - Liking a post: Needs an API endpoint like `POST /api/posts/{postId}/like` or `DELETE /api/posts/{postId}/like`
 * to toggle like status. Frontend will send `postId` and current user ID. Frontend expects a success response and will update UI.
 * - Commenting: `POST /api/posts/{postId}/comment`.
 * - Sharing: `POST /api/posts/{postId}/share`.
 * - `post.trending`: This flag determines the 'TRENDING' badge. Backend should calculate and provide this.
 * - `post.mood`: Frontend uses this for styling the mood badge. Backend can derive this from post content analysis or manual tagging.
 * - `post.isLiked`: This boolean should come from the backend, indicating if the *current authenticated user* has liked the post.
 */
const PostCard = memo(({ post, onLikeToggle }) => {
  const handleLikeClick = () => {
    // Frontend provides optimistic UI update
    onLikeToggle(post.id);
    // Backend Call would go here:
    // try {
    //   await api.post(`/api/posts/${post.id}/like`, { userId: currentUser.id });
    //   // If successful, local state update is sufficient.
    // } catch (error) {
    //   // Revert optimistic update if API call fails
    //   onLikeToggle(post.id);
    //   console.error("Failed to toggle like:", error);
    // }
  };

  return (
    <div className="group bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden transform-gpu will-change-transform">
      {/* Mood indicator */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
        post.mood === 'fire' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
        post.mood === 'wholesome' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
        post.mood === 'flex' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
        post.mood === 'deep' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      }`}>
        {post.mood === 'fire' && '🔥 FIRE'}
        {post.mood === 'wholesome' && '💕 WHOLESOME'}
        {post.mood === 'flex' && '💪 FLEX'}
        {post.mood === 'deep' && '🧠 DEEP'}
      </div>

      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center text-xl border-2 border-gray-600 group-hover:border-gray-500 transition-colors">
            {post.user.avatar}
          </div>
          {post.user.verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
              <CheckCircle size={12} className="text-white fill-current" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
            <span className="font-bold text-white">{post.user.name}</span>
            {/* Frontend Note: 'tier' is currently hardcoded in mock data. Backend could provide this based on user activity/status. */}
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              post.user.tier === 'OG' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              post.user.tier === 'Pro' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {post.user.tier}
            </span>
            {post.trending && (
              <div className="flex items-center space-x-1 text-orange-400 text-xs bg-orange-400/20 px-2 py-1 rounded-full border border-orange-400/30">
                <Flame size={12} />
                <span>TRENDING</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400 mb-3">
            <span>@{post.user.username}</span>
            <span aria-hidden="true">•</span>
            <span>{post.timestamp}</span>
            {post.location && (
              <>
                <span aria-hidden="true">•</span>
                <div className="flex items-center space-x-1">
                  <MapPin size={12} aria-hidden="true" />
                  <span>{post.location}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-gray-100 leading-relaxed mb-4 text-lg">{post.content}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold text-sm hover:scale-110 transition-transform transform-gpu">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            {/* Interactive Like Button */}
            <div className="flex items-center space-x-6">
              <button
                className={`flex items-center space-x-2 transition-all hover:scale-110 group transform-gpu ${
                  post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
                aria-label={`Like post, current likes: ${post.stats.likes}`}
                onClick={handleLikeClick}
              >
                <Heart size={20} className={`${post.isLiked ? 'fill-red-400' : 'group-hover:fill-current'} transition-colors`} />
                <span className="font-bold">{post.stats.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all hover:scale-110 transform-gpu" aria-label={`View comments, current comments: ${post.stats.comments}`}>
                <MessageCircle size={20} className="transition-colors" />
                <span className="font-bold">{post.stats.comments}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-all hover:scale-110 transform-gpu" aria-label={`Share post, current shares: ${post.stats.shares}`}>
                <Share size={20} className="transition-colors" />
                <span className="font-bold">{post.stats.shares}</span>
              </button>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Eye size={16} aria-hidden="true" />
              <span className="font-bold">{post.stats.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// TabButton component with accessibility attributes
const TabButton = ({ id, label, icon: Icon, active, onClick, accent }) => (
  <button
    id={`tab-${id}`}
    role="tab"
    aria-controls={`panel-${id}`}
    aria-selected={active}
    tabIndex={active ? 0 : -1}
    onClick={() => onClick(id)}
    className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 border-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 ${
      active
        ? `${accent} shadow-lg transform scale-105`
        : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:scale-105'
    } transform-gpu will-change-transform`}
  >
    <Icon size={20} className="group-hover:rotate-12 transition-transform duration-200" aria-hidden="true" />
    <span>{label}</span>
  </button>
);

/**
 * Header Component
 * Contains the page title, a "what's poppin" indicator, and a search bar.
 *
 * @param {object} props
 * @param {boolean} props.isScrolled - Indicates if the page has scrolled, for visual effects.
 * @param {string} props.searchQuery - Current value of the search input.
 * @param {function} props.onSearchChange - Handler for search input changes.
 *
 * @Backend_Developer_Note:
 * - Search: The search input will need a dedicated API endpoint, e.g., `GET /api/search?q={query}`.
 * The frontend expects a debounced search query to prevent excessive API calls while typing.
 */
const Header = memo(({ isScrolled, searchQuery, onSearchChange }) => (
  <div className={`sticky top-0 bg-gray-900/90 backdrop-blur-xl border-b-2 border-gray-800 z-50 transition-all duration-300 ${
    isScrolled ? 'shadow-2xl shadow-cyan-500/5' : ''
  }`}>
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-black text-white">
            Explore
          </h1>
          <div className="flex items-center space-x-1 text-cyan-400 text-sm animate-pulse-fast">
            <Zap size={16} aria-hidden="true" />
            <span className="font-bold">what's poppin</span>
          </div>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" size={20} aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">Search the vibes</label>
          <input
            id="search-input"
            type="text"
            placeholder="search the vibes..."
            className="bg-gray-800 border-2 border-gray-700 rounded-2xl py-3 pl-12 pr-6 w-full focus:outline-none focus:border-cyan-400 focus:bg-gray-700 transition-all duration-300 font-medium placeholder-gray-500"
            aria-label="Search the vibes"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  </div>
));

/**
 * TrendingTopicsCard Component
 * Displays a list of trending topics.
 *
 * @param {object} props
 * @param {Array<object>} props.topics - List of topic objects.
 * @param {function} props.onTopicClick - Callback when a topic card is clicked.
 *
 * @Backend_Developer_Note:
 * - Data Source: This list should be fetched from an API, e.g., `GET /api/explore/trending-topics`.
 * - Fields required: `tag` (string), `posts` (string, e.g., "2.4K"), `growth` (string, e.g., "+15%"),
 * `emoji` (string, for display).
 * - Sorting/Ranking: Backend is responsible for determining "trending" based on post volume, growth, etc.
 * - Topic Click: If `onTopicClick` leads to a dedicated topic page, backend should provide a way to filter posts by tag, e.g., `GET /api/posts?tag={topicName}`.
 * This dedicated topic page would then likely have infinite scrolling for its content.
 */
const TrendingTopicsCard = memo(({ topics, onTopicClick }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700">
    <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-2">
      <Hash className="text-cyan-400" size={20} aria-hidden="true" />
      <span>hot topics</span>
    </h3>
    <div className="space-y-4">
      {topics.map((topic, idx) => (
        <div
          key={idx}
          className="group p-4 rounded-2xl hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-600 transform-gpu will-change-transform"
          onClick={() => onTopicClick(topic.tag)}
          role="button"
          tabIndex={0}
          aria-label={`Explore topic ${topic.tag}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{topic.emoji}</span>
              <div>
                <div className="font-bold text-cyan-400 group-hover:text-cyan-300">{topic.tag}</div>
                <div className="text-sm text-gray-400">{topic.posts} posts</div>
              </div>
            </div>
            <div className="text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded-full border border-green-400/30 flex items-center gap-1">
              <TrendingUp size={14} aria-hidden="true" />
              {topic.growth}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

/**
 * SuggestedUsersCard Component
 * Displays a list of suggested users/creators to follow with interactive follow button.
 *
 * @param {object} props
 * @param {Array<UserData>} props.users - List of user objects.
 * @param {function} props.onFollowToggle - Callback for when a follow button is clicked.
 *
 * @Backend_Developer_Note:
 * - Data Source: This list should be fetched from an API, e.g., `GET /api/users/suggested-creators` or `/api/explore/top-creators`.
 * - Fields required: `id`, `name`, `username`, `followers` (string, e.g., "142K"), `avatar` (emoji or URL), `verified` (boolean),
 * `category` (string, e.g., "Tech Creator"), `isFollowing` (boolean - indicates if the current user is already following).
 * - Follow Action: The "Follow" button requires a `POST /api/users/{userId}/follow` or `DELETE /api/users/{userId}/follow` endpoint.
 * Frontend will send the `userId` of the creator to follow/unfollow. Backend should handle the follow logic and return success/failure.
 * Frontend will optimistically update or re-fetch data after a successful follow.
 * - Infinite Scrolling on this section: If you have a very large pool of suggested users, this section could also implement infinite scrolling to load more.
 */
const SuggestedUsersCard = memo(({ users, onFollowToggle }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700">
    <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-2">
      <Star className="text-cyan-400" size={20} aria-hidden="true" />
      <span>top creators</span>
    </h3>
    <div className="space-y-4">
      {users.slice(0, 4).map((user) => ( // Limiting to first 4 for display, backend could handle pagination
        <div
          key={user.id}
          className="group p-4 rounded-2xl hover:bg-gray-700/50 transition-all duration-200 border border-transparent hover:border-gray-600 transform-gpu will-change-transform"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center text-xl">
                  {user.avatar}
                </div>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                    <CheckCircle size={10} className="text-white fill-current" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between space-x-2">
                  <span className="font-bold text-white group-hover:text-cyan-400">{user.name}</span>
                  {/* Interactive Follow Button */}
                  <button
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105 border ${
                      user.isFollowing
                        ? 'bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-400'
                    }`}
                    aria-label={user.isFollowing ? `Following ${user.name}` : `Follow ${user.name}`}
                    disabled={user.isFollowing}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
                <div className="text-sm text-gray-400">@{user.username}</div>
                <div className="text-xs text-gray-500">{user.followers} followers</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

/**
 * ExploreCategoryCard Component
 * Displays a single category with icon and post count.
 *
 * @param {object} props
 * @param {object} props.category - Category data.
 * @param {function} props.onCategoryClick - Callback when category card is clicked.
 *
 * @Backend_Developer_Note:
 * - Category Click: If `onCategoryClick` leads to a dedicated category page, backend should provide a way to filter posts by category, e.g., `GET /api/posts?category={categoryId}`.
 * This dedicated category page would then likely have infinite scrolling for its content.
 */
const ExploreCategoryCard = memo(({ category, onCategoryClick }) => (
  <div
    className={`group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border-2 ${category.accent} transition-all duration-300 hover:scale-105 transform-gpu will-change-transform`}
    onClick={() => onCategoryClick(category.id)}
    role="button"
    tabIndex={0}
    aria-label={`Explore posts in ${category.name} category`}
  >
    <div className="text-center">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
      <h3 className="text-2xl font-black mb-2">{category.name}</h3>
      <div className="text-lg font-bold opacity-80">{category.posts} posts</div>
    </div>
  </div>
));

// --- Main Component ---
/**
 * ExplorePage Component
 * This is the main page for exploring trending content, topics, creators, and categories.
 * It manages active tabs, scroll-based header effects, and now frontend interactions.
 *
 * @Frontend_Developer_Note:
 * - State Management: `activeTab`, `isScrolled`, `trendingPosts`, `suggestedUsers`, `searchQuery`,
 * `sortBy`, `timeframe`, and `isLoadingMore` are managed locally.
 * - Data Fetching: In a real application, `useEffect` would be used here to fetch data for each tab
 * (e.g., `TRENDING_POSTS`, `TRENDING_TOPICS`, `SUGGESTED_USERS`, `EXPLORE_CATEGORIES`)
 * from backend APIs when the component mounts or when the active tab changes, as well as for infinite scrolling.
 * Consider using a data fetching library (e.g., React Query, SWR) for better caching and loading states.
 * - Loading States: For a professional app, implement skeleton loaders or spinners while data is being fetched.
 * - Error Handling: Display user-friendly messages if API calls fail.
 * - Infinite Scrolling: Implemented for the 'trending' tab using `IntersectionObserver`. When the `loaderRef`
 * element (at the bottom of the posts list) enters the viewport, `handleLoadMorePosts` is triggered.
 * Ensure your backend API supports pagination (e.g., `page` and `limit` parameters).
 *
 * @Backend_Developer_Note:
 * - API Endpoints:
 * - Trending Posts (for 'trending' tab): `GET /api/explore/trending-posts`
 * - Supports pagination: `?page={pageNumber}&limit={itemsPerPage}`
 * - Supports sorting: `?sort={top|newest|oldest}`
 * - Supports timeframe: `?timeframe={daily|weekly|alltime}`
 * - Expected response: An array of `PostData` objects.
 * - Trending Topics (for 'topics' tab and sidebar): `GET /api/explore/topics/trending`
 * - Expected response: An array of topic objects (like `TRENDING_TOPICS` constant).
 * - Top Creators (for 'people' tab and sidebar): `GET /api/explore/creators/top`
 * - Expected response: An array of user objects (like `SUGGESTED_USERS` constant, including `isFollowing` for current user).
 * - Could also support pagination `?page={pageNumber}&limit={itemsPerPage}` for loading more suggested users.
 * - Explore Categories (for 'categories' tab): `GET /api/explore/categories`
 * - Expected response: An array of category objects (like `EXPLORE_CATEGORIES` constant).
 * - Authentication: Most explore data might be publicly accessible, but actions like "follow" or "like" will require user authentication.
 * - Real-time Updates: For truly "trending" or "happening now" data, consider websockets or frequent polling.
 */
const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [isScrolled, setIsScrolled] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState(INITIAL_TRENDING_POSTS);
  const [suggestedUsers, setSuggestedUsers] = useState(SUGGESTED_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for infinite scroll loading
  const [currentPage, setCurrentPage] = useState(1); // For infinite scrolling pagination
  const [hasMorePosts, setHasMorePosts] = useState(true); // To stop infinite scrolling
  const [sortBy, setSortBy] = useState('top'); // 'top', 'newest', 'oldest'
  const [timeframe, setTimeframe] = useState('today'); // 'today', 'thisWeek', 'allTime'

  const loaderRef = useRef(null); // Ref for the element to observe for infinite scrolling

  // Simulate fetching more posts (for infinite scrolling)
  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    // In a real app: make API call to fetch next page of posts based on currentPage, sortBy, timeframe
    console.log(`Frontend: Fetching page ${currentPage + 1} of posts (Sort: ${sortBy}, Time: ${timeframe})`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newPostsBatch = MORE_TRENDING_POSTS.slice((currentPage - 1) * 2, currentPage * 2 + 2); // Simple slice for mock data
    // In a real app, `newPostsBatch` would come from the API response
    // const response = await fetch(`/api/explore/trending-posts?page=${currentPage + 1}&limit=3&sort=${sortBy}&timeframe=${timeframe}`);
    // const newPostsBatch = await response.json();

    if (newPostsBatch.length > 0) {
      setTrendingPosts((prevPosts) => [...prevPosts, ...newPostsBatch]);
      setCurrentPage((prevPage) => prevPage + 1);
      setHasMorePosts(newPostsBatch.length === MORE_TRENDING_POSTS.length || (currentPage + 1) * 2 <= MORE_TRENDING_POSTS.length); // Adjust condition based on total mock data
    } else {
      setHasMorePosts(false); // No more posts to load
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts, currentPage, sortBy, timeframe]); // Dependencies for useCallback

  // Effect for IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (activeTab !== 'trending') return; // Only apply infinite scroll to trending tab

    const options = {
      root: null, // viewport
      rootMargin: '200px', // When 200px from bottom of viewport
      threshold: 0.1, // 10% visible
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMorePosts && !isLoadingMore) {
        fetchMorePosts();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMorePosts, isLoadingMore, fetchMorePosts, activeTab]);

  // Effect to re-fetch/reset posts when sort/timeframe changes or tab changes
  useEffect(() => {
    if (activeTab === 'trending') {
      // In a real app, this would trigger a fresh API call for trending posts
      // based on current sortBy and timeframe.
      // For mock data, we just reset to initial and allow infinite scroll to fetch more.
      setTrendingPosts(INITIAL_TRENDING_POSTS);
      setCurrentPage(1); // Reset page for fresh fetch
      setHasMorePosts(true); // Assume there are more posts for new filter
      setIsLoadingMore(false); // Reset loading state
      console.log(`Frontend: Resetting trending posts for sort=${sortBy}, time=${timeframe}`);
    }
  }, [sortBy, timeframe, activeTab]);


  // Toggle like status on a post
  const handlePostLikeToggle = useCallback((postId) => {
    setTrendingPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post
      )
    );
  }, []);

  // Toggle follow status for a user
  const handleFollowToggle = useCallback((userId) => {
    setSuggestedUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
    // Backend call to follow/unfollow user would go here
    // e.g., api.post(`/api/users/${userId}/follow`)
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
    // Backend: Implement debounced search here
    // e.g., debounce(() => fetch(`/api/search?q=${event.target.value}`), 300);
  }, []);

  // Handle click on a trending topic card
  const handleTopicClick = useCallback((tagName) => {
    console.log(`Frontend: Navigating to page for topic: ${tagName}`);
    // In a real app: router.push(`/explore/topic/${tagName}`);
    // Or set a filter state to show posts for this topic.
  }, []);

  // Handle click on an explore category card
  const handleCategoryClick = useCallback((categoryId) => {
    console.log(`Frontend: Navigating to page for category ID: ${categoryId}`);
    // In a real app: router.push(`/explore/category/${categoryId}`);
    // Or set a filter state to show posts for this category.
  }, []);

  // Handle scroll effect for header
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-x-hidden">
      {/* Animated background elements - purely decorative frontend effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-cyan-400 rounded-full animate-bubble-1"></div>
        <div className="absolute top-[30%] right-[15%] w-1 h-1 bg-pink-400 rounded-full animate-bubble-2"></div>
        <div className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-bubble-3"></div>
        <div className="absolute top-[70%] left-[60%] w-2.5 h-2.5 bg-orange-400 rounded-full animate-bubble-4"></div>
        <div className="absolute bottom-[5%] right-[5%] w-3 h-3 bg-green-400 rounded-full animate-bubble-5"></div>
      </div>

      {/* Tailwind JIT or Next.js `style jsx` would typically handle this, but for standalone
          demonstration, inline style block is used for keyframes. */}
      <style jsx>{`
        @keyframes bubble-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(20px, 50px) scale(1.2); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        }
        @keyframes bubble-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-30px, -20px) scale(0.8); opacity: 0.4; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
        }
        @keyframes bubble-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(40px, -30px) scale(1.1); opacity: 0.3; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        }
        @keyframes bubble-4 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          50% { transform: translate(-20px, 40px) scale(1.3); opacity: 0.6; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.9; }
        }
        @keyframes bubble-5 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.75; }
          50% { transform: translate(15px, -10px) scale(0.9); opacity: 0.45; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.75; }
        }
        .animate-bubble-1 { animation: bubble-1 15s infinite alternate ease-in-out; }
        .animate-bubble-2 { animation: bubble-2 18s infinite alternate ease-in-out; }
        .animate-bubble-3 { animation: bubble-3 12s infinite alternate ease-in-out; }
        .animate-bubble-4 { animation: bubble-4 20s infinite alternate ease-in-out; }
        .animate-bubble-5 { animation: bubble-5 16s infinite alternate ease-in-out; }
        .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        /* Custom fade-in for tab content transitions */
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header with controlled search input */}
      <Header isScrolled={isScrolled} searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Explore Categories" className="flex flex-wrap gap-4 mb-8">
          <TabButton
            id="trending"
            label="trending"
            icon={Flame}
            active={activeTab === 'trending'}
            onClick={setActiveTab}
            accent="border-orange-400 bg-orange-400/10 text-orange-400"
          />
          <TabButton
            id="topics"
            label="topics"
            icon={Hash}
            active={activeTab === 'topics'}
            onClick={setActiveTab}
            accent="border-cyan-400 bg-cyan-400/10 text-cyan-400"
          />
          <TabButton
            id="people"
            label="creators"
            icon={Users}
            active={activeTab === 'people'}
            onClick={setActiveTab}
            accent="border-pink-400 bg-pink-400/10 text-pink-400"
          />
          <TabButton
            id="categories"
            label="vibes"
            icon={Star}
            active={activeTab === 'categories'}
            onClick={setActiveTab}
            accent="border-purple-400 bg-purple-400/10 text-purple-400"
          />
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'trending' && (
          <div id="panel-trending" role="tabpanel" aria-labelledby="tab-trending" className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-fade-in">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Flame className="text-orange-400" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-black text-white">what's trending rn</h2>
              </div>

              {/* Filter and Sort Options */}
              <div className="flex flex-wrap gap-4 mb-6 justify-end">
                <div className="relative">
                  <label htmlFor="sort-by-select" className="sr-only">Sort By</label>
                  <select
                    id="sort-by-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-800 border-2 border-gray-700 rounded-xl py-2 pl-4 pr-10 text-white font-medium focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="top">Top</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <label htmlFor="timeframe-select" className="sr-only">Timeframe</label>
                  <select
                    id="timeframe-select"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="appearance-none bg-gray-800 border-2 border-gray-700 rounded-xl py-2 pl-4 pr-10 text-white font-medium focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="allTime">All Time</option>
                  </select>
                  <Clock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Happening Now (Conceptual Section) */}
              <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-700 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap size={24} className="text-pink-400 animate-pulse-fast" />
                  <span className="text-lg font-bold text-white">Happening Now:</span>
                  <span className="text-pink-200">2 Live Streams & Breaking News!</span>
                </div>
                <button className="text-pink-300 hover:text-white text-sm font-semibold underline transition-colors">
                  View All
                </button>
              </div>

              {/* Trending Posts List */}
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} onLikeToggle={handlePostLikeToggle} />
              ))}

              {/* Infinite Scroll Loader */}
              {hasMorePosts && (
                <div ref={loaderRef} className="flex justify-center py-6">
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading more posts...</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Scroll down to load more</span>
                  )}
                </div>
              )}
              {!hasMorePosts && (
                <div className="flex justify-center py-6 text-gray-500 text-sm">
                  You've reached the end of the trending posts for this filter.
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingTopicsCard topics={TRENDING_TOPICS} onTopicClick={handleTopicClick} />
              <SuggestedUsersCard users={suggestedUsers} onFollowToggle={handleFollowToggle} />
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div id="panel-topics" role="tabpanel" aria-labelledby="tab-topics" className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Hash className="text-cyan-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">trending topics</h2>
            </div>
            <p className="text-gray-400 text-lg mb-6">
              Discover what the community is buzzing about. Click a topic to explore its dedicated feed.
              <span className="block text-sm text-gray-500 mt-1">
                (A dedicated topic feed would implement infinite scrolling.)
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRENDING_TOPICS.map((topic, idx) => (
                <TrendingTopicsCard
                  key={idx}
                  topics={[topic]}
                  onTopicClick={handleTopicClick}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <div id="panel-people" role="tabpanel" aria-labelledby="tab-people" className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Users className="text-pink-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">top creators</h2>
            </div>
            <p className="text-gray-400 text-lg mb-6">
              Follow influential creators shaping the conversation.
              <span className="block text-sm text-gray-500 mt-1">
                (This list could also implement infinite scrolling for more suggestions.)
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {SUGGESTED_USERS.map((user) => (
                <div key={user.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700 hover:border-pink-400 transition-all duration-300 hover:scale-105 transform-gpu will-change-transform">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-3xl bg-gray-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {user.avatar}
                      </div>
                      {user.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-gray-800">
                          <CheckCircle size={16} className="text-white fill-current" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-black text-white text-xl mb-1 group-hover:text-pink-400">{user.name}</h3>
                    <div className="text-gray-400 mb-2">@{user.username}</div>
                    <div className="text-sm text-gray-500 mb-3">{user.followers} followers</div>
                    <button
                      onClick={() => handleFollowToggle(user.id)}
                      className={`py-3 px-8 rounded-2xl font-bold transition-all hover:scale-105 border-2 transform-gpu block mx-auto max-w-xs ${
                        user.isFollowing
                          ? 'bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed'
                          : 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-400'
                      }`}
                      aria-label={user.isFollowing ? `Following ${user.name}` : `Follow ${user.name}`}
                      disabled={user.isFollowing}
                    >
                      {user.isFollowing ? 'Following' : 'follow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div id="panel-categories" role="tabpanel" aria-labelledby="tab-categories" className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Star className="text-purple-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">explore by vibe</h2>
            </div>
            <p className="text-gray-400 text-lg mb-6">
              Dive into content categorized by popular themes and "vibes". Clicking a category will take you to a curated feed.
              <span className="block text-sm text-gray-500 mt-1">
                (A dedicated category feed would implement infinite scrolling.)
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXPLORE_CATEGORIES.map((category) => (
                <ExploreCategoryCard
                  key={category.id}
                  category={category}
                  onCategoryClick={handleCategoryClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;