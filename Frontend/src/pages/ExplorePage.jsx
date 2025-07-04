import React, { useState, useEffect, useCallback, memo } from 'react';
import { Search, TrendingUp, Hash, Users, Zap, MapPin, Eye, Heart, MessageCircle, Share, MoreHorizontal, CheckCircle, Flame, Star, Coffee } from 'lucide-react';

// --- Constants  ---
const TRENDING_TOPICS = [
  { tag: '#nocode', posts: '2.4K', growth: '+15%', emoji: '⚡', vibe: 'fire' },
  { tag: '#webdev', posts: '1.8K', growth: '+8%', emoji: '💻', vibe: 'cool' },
  { tag: '#designtok', posts: '1.2K', growth: '+12%', emoji: '🎨', vibe: 'aesthetic' },
  { tag: '#startuplife', posts: '956', growth: '+5%', emoji: '🚀', vibe: 'hustle' },
  { tag: '#mindset', posts: '743', growth: '+18%', emoji: '🧠', vibe: 'deep' },
  { tag: '#buildinpublic', posts: '621', growth: '+22%', emoji: '🔥', vibe: 'raw' }
];

const SUGGESTED_USERS = [
  { name: 'hitesh.codes', username: 'hitesh_creates', followers: '142K', avatar: '🦄', verified: true, category: 'Tech Creator', vibe: 'iconic' },
  { name: 'navneet.builds', username: 'navneetbuilds', followers: '87K', avatar: '🎯', verified: true, category: 'Indie Hacker', vibe: 'goated' },
  { name: 'aryan.designs', username: 'aryan', followers: '203K', avatar: '✨', verified: false, category: 'UI Wizard', vibe: 'clean' },
  { name: 'shailaj', username: 'shialaj', followers: '56K', avatar: '🔮', verified: true, category: 'Code Artist', vibe: 'mystic' }
];

const EXPLORE_CATEGORIES = [
  { name: 'Tech', icon: '⚡', posts: '45.2K', accent: 'border-cyan-400 bg-cyan-400/10 text-cyan-400' },
  { name: 'Design', icon: '🎨', posts: '32.1K', accent: 'border-pink-400 bg-pink-400/10 text-pink-400' },
  { name: 'Startup', icon: '🚀', posts: '28.7K', accent: 'border-green-400 bg-green-400/10 text-green-400' },
  { name: 'Art', icon: '✨', posts: '19.4K', accent: 'border-purple-400 bg-purple-400/10 text-purple-400' },
  { name: 'Music', icon: '🎵', posts: '15.8K', accent: 'border-orange-400 bg-orange-400/10 text-orange-400' },
  { name: 'Gaming', icon: '🎮', posts: '12.3K', accent: 'border-red-400 bg-red-400/10 text-red-400' }
];

const TRENDING_POSTS = [
  {
    user: { name: 'navneet', username: 'navneet_builds', avatar: '🌟', verified: true, vibe: 'legendary' },
    content: 'just shipped my AI side project in 48 hours and it\'s already trending on PH 💀 sometimes you just gotta send it and see what happens fr fr',
    tags: ['#buildinpublic', '#ai', '#sidehustle'],
    timestamp: '2h',
    location: 'SF',
    stats: { views: '12K', likes: 1200, comments: 89, shares: 156 },
    trending: true,
    mood: 'fire'
  },
  {
    user: { name: 'aryan', username: 'aryanesigns', avatar: '🦋', verified: true, vibe: 'aesthetic' },
    content: 'y\'all... just got my figma file featured and i\'m literally crying 😭 6 months of grinding every single night after my 9-5. proof that consistency > everything',
    tags: ['#design', '#figma', '#grindneverstops'],
    timestamp: '4h',
    location: 'NYC',
    stats: { views: '8.9K', likes: 890, comments: 234, shares: 67 },
    trending: true,
    mood: 'wholesome'
  },
  {
    user: { name: 'shailaj', username: 'shailajbuilds', avatar: '🔥', verified: false, vibe: 'hungry' },
    content: 'dropped out of college to code full time and just landed my first $10k month 🎯 to everyone saying it\'s impossible - respectfully, you\'re wrong',
    tags: ['#webdev', '#entrepreneur', '#selfmade'],
    timestamp: '6h',
    location: 'Austin',
    stats: { views: '25K', likes: 2100, comments: 445, shares: 189 },
    trending: true,
    mood: 'flex'
  }
];

// --- Sub-Components ---

// Memoized PostCard for performance
const PostCard = memo(({ post }) => (
  <div className="group bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden transform-gpu will-change-transform">
    {/* Mood indicator */}
    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
      post.mood === 'fire' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
      post.mood === 'wholesome' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
      post.mood === 'flex' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }`}>
      {post.mood === 'fire' && '🔥 FIRE'}
      {post.mood === 'wholesome' && '💕 WHOLESOME'}
      {post.mood === 'flex' && '💪 FLEX'}
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
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-all hover:scale-110 group transform-gpu" aria-label={`Like post, current likes: ${post.stats.likes}`}>
              <Heart size={20} className="group-hover:fill-current transition-colors" />
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
));

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

const Header = memo(({ isScrolled }) => (
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
          />
        </div>
      </div>
    </div>
  </div>
));

const TrendingTopicsCard = memo(({ topics }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700">
    <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-2">
      <Hash className="text-cyan-400" size={20} aria-hidden="true" />
      <span>hot topics</span>
    </h3>
    <div className="space-y-4">
      {topics.map((topic, idx) => (
        <div key={idx} className="group p-4 rounded-2xl hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-600 transform-gpu will-change-transform">
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
const SuggestedUsersCard = memo(({ users }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700">
    <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-2">
      <Star className="text-cyan-400" size={20} aria-hidden="true" />
      <span>top creators</span>
    </h3>
    <div className="space-y-4">
      {users.slice(0, 4).map((user, idx) => (
        <div
          key={idx}
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
                  <button
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105 border border-cyan-400"
                    aria-label={`Follow ${user.name}`}
                  >
                    Follow
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
  


// --- Main Component ---
const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [isScrolled, setIsScrolled] = useState(false);

  // Use useCallback for event handlers to prevent unnecessary re-renders in child components
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-cyan-400 rounded-full animate-bubble-1"></div>
        <div className="absolute top-[30%] right-[15%] w-1 h-1 bg-pink-400 rounded-full animate-bubble-2"></div>
        <div className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-bubble-3"></div>
        <div className="absolute top-[70%] left-[60%] w-2.5 h-2.5 bg-orange-400 rounded-full animate-bubble-4"></div>
        <div className="absolute bottom-[5%] right-[5%] w-3 h-3 bg-green-400 rounded-full animate-bubble-5"></div>
      </div>

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
      `}</style>

      {/* Header */}
      <Header isScrolled={isScrolled} />

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
              {TRENDING_POSTS.map((post, idx) => (
                <PostCard key={idx} post={post} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingTopicsCard topics={TRENDING_TOPICS} />
              <SuggestedUsersCard users={SUGGESTED_USERS} />
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div id="panel-topics" role="tabpanel" aria-labelledby="tab-topics" className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Hash className="text-cyan-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">trending topics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRENDING_TOPICS.map((topic, idx) => (
                <div key={idx} className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-700 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:scale-105 transform-gpu will-change-transform">
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{topic.emoji}</div>
                    <h3 className="text-2xl font-black text-cyan-400 mb-2 group-hover:text-cyan-300">{topic.tag}</h3>
                    <div className="text-gray-400 mb-4">{topic.posts} posts today</div>
                    <div className="inline-flex items-center space-x-2 text-green-400 text-sm font-bold bg-green-400/10 px-3 py-2 rounded-full border border-green-400/30">
                      <TrendingUp size={16} aria-hidden="true" />
                      <span>{topic.growth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <div id="panel-people" role="tabpanel" aria-labelledby="tab-people" className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Star className="text-pink-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">top creators</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {SUGGESTED_USERS.map((user, idx) => (
                <div key={idx} className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-gray-700 hover:border-pink-400 transition-all duration-300 hover:scale-105 transform-gpu will-change-transform">
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
                    <div className="text-sm text-gray-500 mb-3">{user.category}</div>
                    <div className="text-lg font-bold text-white mb-4">{user.followers} followers</div>
                    <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-bold transition-all hover:scale-105 border-2 border-pink-500 hover:border-pink-400 transform-gpu" aria-label={`Follow ${user.name}`}>
                      follow
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
              <Zap className="text-purple-400" size={28} aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">explore by vibe</h2>
            </div>  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXPLORE_CATEGORIES.map((category, idx) => (
                <div key={idx} className={`group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border-2 ${category.accent} transition-all duration-300 hover:scale-105 transform-gpu will-change-transform`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                    <h3 className="text-2xl font-black mb-2">{category.name}</h3>
                    <div className="text-lg font-bold opacity-80">{category.posts} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;