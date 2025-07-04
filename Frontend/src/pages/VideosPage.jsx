import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, Heart, Share2, Play, MessageCircle, MoreHorizontal, Bell, Edit, Image, Upload, Send, UserPlus, Bookmark, AlertCircle, Loader2, ChevronUp, Pause, Volume2, VolumeX, Maximize, Clock, Eye, Users, Camera, MapPin, Settings, Calendar, Globe, UploadCloud, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBuzz = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Videos');
  const [postContent, setPostContent] = useState('');

  // --- Start: State from VideosPage ---
  const [isFollowing, setIsFollowing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set()); 
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [videoStats, setVideoStats] = useState({});
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('All'); 

  const mainContentRef = useRef(null);
  const profileInfoRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const videoRefs = useRef({});

  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalVideo, setModalVideo] = useState(null);
  const observerRef = useRef();

  const commentsData = useRef({});
  const [videoComments, setVideoComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  // --- End: State from VideosPage ---

  const tabs = ['Posts', 'About', 'Photos', 'Videos', 'Friends'];

  // --- Start: Data from VideosPage ---
  const currentUser = {
    id: 'current-user-123',
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=40&h=40&fit=crop&crop=face'
  };

  const profileUser = {
    id: 'Hitesh',
    name: 'hitesh',
    subtitle: 'Content Creator & Filmmaker',
    bio: 'Passionate about capturing life through lens. Travel enthusiast and nature lover.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ee?w=96&h=96&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=300&fit=crop',
    followersCount: 1250,
    followingCount: 840,
    postsCount: 127,
    videosCount: 45,
    location: 'San Francisco, CA',
    joinDate: 'March 2022',
    website: 'hitesh.com'
  };

  const videos = [
    {
      id: 'vid-1',
      title: 'Sunset by the Lake',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      duration: '2:15',
      views: 1250,
      likes: 89,
      uploadDate: '2 days ago',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      description: 'Beautiful sunset captured by the lake during golden hour. Perfect moment of tranquility.',
      tags: ['nature', 'sunset', 'landscape', 'photography'],
      category: 'Nature',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      id: 'vid-2',
      title: 'Morning Forest Walk',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      duration: '5:42',
      views: 3420,
      likes: 256,
      uploadDate: '1 week ago',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      description: 'Peaceful morning walk through the misty forest. Listen to the sounds of nature.',
      tags: ['nature', 'forest', 'morning', 'peaceful'],
      category: 'Nature',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    {
      id: 'vid-3',
      title: 'City Architecture',
      thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      duration: '3:28',
      views: 890,
      likes: 67,
      uploadDate: '3 days ago',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      description: 'Modern architecture and urban design exploration. A journey through the city.',
      tags: ['architecture', 'city', 'design', 'urban'],
      category: 'Architecture',
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_10MB.mp4'
    },
    {
      id: 'vid-4',
      title: 'Ocean Waves',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      duration: '4:12',
      views: 2150,
      likes: 178,
      uploadDate: '5 days ago',
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      description: 'Relaxing ocean waves crashing on the shore. Perfect for meditation.',
      tags: ['ocean', 'waves', 'relaxing', 'meditation'],
      category: 'Nature',
      videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    },
    {
      id: 'vid-5',
      title: 'Mountain Hiking',
      thumbnail: 'https://images.unsplash.com/photo-1464822759844-d150baec3e5c?w=400&h=300&fit=crop',
      duration: '7:33',
      views: 4280,
      likes: 342,
      uploadDate: '1 week ago',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      description: 'Epic mountain hiking adventure with breathtaking views. Join the journey!',
      tags: ['mountain', 'hiking', 'adventure', 'travel'],
      category: 'Adventure',
      videoUrl: 'https://file-examples.com/storage/fe306a4b11634b3e390623a/2017/04/file_example_MP4_480_1_5MG.mp4'
    },
    {
      id: 'vid-6',
      title: 'Urban Night Life',
      thumbnail: 'https://images.unsplash.com/photo-1496568816309-51d7c61e70ba?w=400&h=300&fit=crop',
      duration: '6:15',
      views: 1890,
      likes: 145,
      uploadDate: '4 days ago',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      description: 'City lights and urban nightlife captured in motion. Feel the city pulse.',
      tags: ['urban', 'night', 'city', 'lifestyle'],
      category: 'Lifestyle',
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
    },
    {
      id: 'vid-7',
      title: 'Cooking with Friends',
      thumbnail: 'https://images.unsplash.com/photo-1506368249639-73e053d713ee?w=400&h=300&fit=crop',
      duration: '8:01',
      views: 5120,
      likes: 410,
      uploadDate: '2 weeks ago',
      timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
      description: 'A fun and easy recipe for a group cooking session. Great for gatherings!',
      tags: ['cooking', 'food', 'friends', 'recipe', 'lifestyle'],
      category: 'Lifestyle',
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4'
    },
    {
      id: 'vid-8',
      title: 'Deep Sea Exploration',
      thumbnail: 'https://images.unsplash.com/photo-1528114032909-010ccb99742f?w=400&h=300&fit=crop',
      duration: '10:50',
      views: 7890,
      likes: 620,
      uploadDate: '3 weeks ago',
      timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
      description: 'Journey to the depths of the ocean, exploring incredible marine life.',
      tags: ['ocean', 'sea', 'exploration', 'wildlife', 'nature'],
      category: 'Nature',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4'
    }
  ];

  // Dynamically get unique categories from video data (still useful for general filtering)
  const videoCategories = useMemo(() => {
    const categories = new Set(['All']);
    videos.forEach(video => categories.add(video.category));
    return Array.from(categories);
  }, [videos]);

  // Subset of videos for the "Recommended" section in the left sidebar
  const recommendedVideos = useMemo(() => {
    // Select a few videos, e.g., the first 3 or 4, or randomly select
    return videos.slice(0, 4); // Display first 4 videos as recommended
  }, [videos]);
  // --- End: Data from VideosPage ---


  // --- Start: Effects from VideosPage ---
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

  // Initialize video stats
  useEffect(() => {
    const stats = {};
    videos.forEach(video => {
      stats[video.id] = {
        views: video.views,
        likes: video.likes,
        isLiked: likedVideos.has(video.id),
        isBookmarked: bookmarkedVideos.has(video.id)
      };
    });
    setVideoStats(stats);
  }, [videos, likedVideos, bookmarkedVideos]);
  // --- End: Effects from VideosPage ---


  // --- Start: Utility functions from VideosPage ---
  const smoothScrollTo = useCallback((targetPosition, duration = 800) => {
    try {
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

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

  const formatCount = useCallback((count) => {
    if (typeof count !== 'number' || isNaN(count)) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }, []);

  const formatDuration = useCallback((duration) => {
    if (typeof duration !== 'string') return '0:00';
    return duration;
  }, []);

  const formatDate = useCallback((date) => {
    if (typeof date !== 'string') return 'Unknown';
    return date;
  }, []);

  const handleFollow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsFollowing(prev => !prev);

      // Show success message
      setError(isFollowing ? 'Unfollowed successfully!' : 'Following now!');
      setTimeout(() => setError(null), 2000);
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

  const handleOpenVideoModal = useCallback((video) => {
    setModalVideo(video);
    setShowVideoModal(true);
  }, []);

  const handleCloseVideoModal = useCallback(() => {
    setShowVideoModal(false);
    setModalVideo(null);
    setPlayingVideo(null); // Stop playback when modal closes
  }, []);

  const handleVideoPlay = useCallback((videoId) => {
    try {
      // Pause currently playing video if different and not the one clicked for modal
      if (playingVideo && playingVideo !== videoId) {
        const videoElement = videoRefs.current[playingVideo];
        if (videoElement) {
          videoElement.pause();
        }
      }

      setPlayingVideo(playingVideo === videoId ? null : videoId);
      setError(null);

      // Update view count (only increment if it starts playing or opens modal for first time)
      setVideoStats(prev => {
        const currentStats = prev[videoId] || {};
        const newViews = currentStats.views ? currentStats.views + 1 : videos.find(v => v.id === videoId)?.views + 1 || 1;
        return {
          ...prev,
          [videoId]: {
            ...currentStats,
            views: newViews
          }
        };
      });

      // Open video modal
      const videoToOpen = videos.find(v => v.id === videoId);
      if (videoToOpen) {
        handleOpenVideoModal(videoToOpen);
      }

    } catch (err) {
      console.error('Video play error:', err);
      setError('Failed to play video. Please try again.');
    }
  }, [playingVideo, videos, handleOpenVideoModal]);

  const handleVideoLike = useCallback((videoId, e) => {
    e?.stopPropagation(); // Prevent modal from opening if clicked on like button
    try {
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(videoId)) {
          newSet.delete(videoId);
        } else {
          newSet.add(videoId);
        }
        return newSet;
      });

      setVideoStats(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          likes: likedVideos.has(videoId) ? prev[videoId].likes - 1 : prev[videoId].likes + 1,
          isLiked: !prev[videoId]?.isLiked
        }
      }));
    } catch (err) {
      console.error('Like error:', err);
      setError('Failed to like video. Please try again.');
    }
  }, [likedVideos]);

  const handleVideoBookmark = useCallback((videoId, e) => {
    e?.stopPropagation(); // Prevent modal from opening if clicked on bookmark button
    try {
      setBookmarkedVideos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(videoId)) {
          newSet.delete(videoId);
        } else {
          newSet.add(videoId);
        }
        return newSet;
      });

      setVideoStats(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          isBookmarked: !prev[videoId]?.isBookmarked
        }
      }));
    } catch (err) {
      console.error('Bookmark error:', err);
      setError('Failed to bookmark video. Please try again.');
    }
  }, [bookmarkedVideos]);

  const handleVideoShare = useCallback((video, e) => {
    e?.stopPropagation();
    try {
      if (navigator.share) {
        navigator.share({
          title: video.title,
          text: video.description,
          url: `${window.location.origin}/videos/${video.id}`
        });
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/videos/${video.id}`);
        setError('Video link copied to clipboard!');
        setTimeout(() => setError(null), 2000);
      }
    } catch (err) {
      console.error('Share error:', err);
      setError('Failed to share video. Please try again.');
    }
  }, []);

  const scrollToTop = useCallback(() => {
    try {
      setIsScrolling(true);
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

  // Upload Modal Handlers
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setVideoFile(null);
      setVideoPreview(null);
      setError('Please select a valid video file.');
    }
  }, []);

  const handleUploadVideo = useCallback(async () => {
    if (!videoFile || !videoTitle.trim()) {
      setError('Please select a video file and provide a title.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simulate API upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Uploading video:', {
        file: videoFile.name,
        title: videoTitle,
        tags: videoTags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      // In a real app, you'd send the file to a server.

      setError('Video uploaded successfully!');
      setTimeout(() => setError(null), 3000);
      setShowUploadModal(false);
      setVideoFile(null);
      setVideoPreview(null);
      setVideoTitle('');
      setVideoTags('');
      // Optionally add the new video to the 'videos' array state if it's managed locally
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [videoFile, videoTitle, videoTags]);

  const handleAddComment = useCallback(() => {
    if (commentInput.trim() && modalVideo) {
      const newComment = {
        id: `comment-${Date.now()}`,
        author: currentUser.name,
        avatar: currentUser.avatar,
        text: commentInput.trim(),
        timestamp: 'Just now'
      };
      // For demonstration, directly updating state; in a real app, this would involve API call
      commentsData.current[modalVideo.id] = [...(commentsData.current[modalVideo.id] || []), newComment];
      setVideoComments(commentsData.current[modalVideo.id]);
      setCommentInput('');
    }
  }, [commentInput, modalVideo, currentUser]);

  // Handle comments for the currently selected modal video
  useEffect(() => {
    if (modalVideo) {
      setVideoComments(commentsData.current[modalVideo.id] || []);
    }
  }, [modalVideo]);


  // Filter and sort videos based on controls and category
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos.filter(video =>
      (selectedCategory === 'All' || video.category === selectedCategory) && // Keep category filter for main feed if you decide to add it back
      (video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (videoStats[b.id]?.likes || b.likes) - (videoStats[a.id]?.likes || a.likes));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.timestamp - b.timestamp);
    }

    return filtered;
  }, [videos, searchQuery, sortBy, videoStats, selectedCategory]);


  // Image component with error handling
  const SafeImage = useMemo(() => React.memo(({ src, alt, className, ...props }) => {
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


  const VideoCard = useMemo(() => React.memo(({ video }) => {
    const isPlaying = playingVideo === video.id;
    const stats = videoStats[video.id] || {};

    return (
      <div
        className={`bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isScrolling ? 'pointer-events-none opacity-50' : ''
        }`}
        onClick={() => handleVideoPlay(video.id)}
        onKeyDown={(e) => handleKeyDown(e, () => handleVideoPlay(video.id))}
        tabIndex={0}
        role="button"
        aria-label={`Play video: ${video.title}`}
      >
        {/* Video Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <SafeImage
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {formatDuration(video.duration)}
          </div>

          {/* View Count Badge */}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{formatCount(stats.views || video.views)}</span>
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {video.category}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>

          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {video.description}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(video.uploadDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => handleVideoLike(video.id, e)}
                className={`flex items-center space-x-1 text-sm transition-colors hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1 ${
                  stats.isLiked ? 'text-red-400' : 'text-slate-400'
                }`}
                aria-label={`${stats.isLiked ? 'Unlike' : 'Like'} video`}
              >
                <Heart className={`w-4 h-4 ${stats.isLiked ? 'fill-current' : ''}`} />
                <span>{formatCount(stats.likes || video.likes)}</span>
              </button>

              <button
                onClick={(e) => handleVideoShare(video, e)}
                className="flex items-center space-x-1 text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                aria-label="Share video"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={(e) => handleVideoBookmark(video.id, e)}
              className={`text-sm transition-colors hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1 ${
                stats.isBookmarked ? 'text-yellow-400' : 'text-slate-400'
              }`}
              aria-label={`${stats.isBookmarked ? 'Remove bookmark' : 'Bookmark'} video`}
            >
              <Bookmark className={`w-4 h-4 ${stats.isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full hover:bg-slate-600 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-slate-400 text-xs px-2 py-1">
                  +{video.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }), [playingVideo, videoStats, isScrolling, handleVideoPlay, handleKeyDown, handleVideoLike, handleVideoShare, handleVideoBookmark, formatDuration, formatCount, formatDate, SafeImage]);


  // A simplified video card for the recommended section (list view)
  const RecommendedVideoCard = useMemo(() => React.memo(({ video }) => {
    const stats = videoStats[video.id] || {};
    return (
      <div
        className="flex items-center space-x-3 bg-slate-700 rounded-lg p-2 hover:bg-slate-600 transition-colors cursor-pointer"
        onClick={() => handleVideoPlay(video.id)}
        onKeyDown={(e) => handleKeyDown(e, () => handleVideoPlay(video.id))}
        tabIndex={0}
        role="button"
        aria-label={`Play recommended video: ${video.title}`}
      >
        <div className="flex-shrink-0 relative w-24 h-16 rounded overflow-hidden">
          <SafeImage
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-white text-sm font-medium line-clamp-2">
            {video.title}
          </h4>
          <p className="text-slate-400 text-xs mt-1">
            {formatCount(stats.views || video.views)} views • {formatDate(video.uploadDate)}
          </p>
        </div>
      </div>
    );
  }), [handleVideoPlay, handleKeyDown, formatDuration, formatCount, formatDate, SafeImage, videoStats]);
  // --- End: Utility functions and Memoized Components from VideosPage ---


  return (
    <div className="min-h-screen bg-slate-900 text-white" ref={mainContentRef}>
      {/* Header */}
      <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-blue-400">ChatBuzz</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              aria-label="Search posts and videos"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-slate-400" />
          <div className={`w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full`} title={isOnline ? 'Online' : 'Offline'}></div>
          <Edit className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300">{currentUser.name}</span>
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">5</span>
          </div>
        </div>
      </div>

      {/* Hero Banner - Kept for overall profile UI, but could be removed if you only want video Browse */}
      <div className="relative h-64 overflow-hidden" ref={profileInfoRef}>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${profileUser.coverImage})`,
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Profile Info Overlay */}
        <div className="absolute bottom-6 left-6 flex items-end space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-slate-700 bg-slate-800">
            <SafeImage
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profileUser.name}</h2>
            <p className="text-slate-300 text-sm mb-2">{profileUser.subtitle}</p>
            <div className="flex space-x-6 text-sm text-slate-300">
              <span><strong className="text-white">{profileUser.postsCount}</strong> posts</span>
              <span><strong className="text-white">{formatCount(profileUser.followersCount)}</strong> followers</span>
              <span><strong className="text-white">{profileUser.followingCount}</strong> following</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-6 right-6 flex space-x-3">
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-6 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2
              ${isFollowing ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-600 hover:bg-blue-700'}
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-slate-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 p-6">
        {/* Left Sidebar - Now only Recommended Videos */}
        <div className="w-80 space-y-6">
          {activeTab === 'Videos' && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Recommended Videos</span>
              </h3>
              <div className="space-y-3">
                {recommendedVideos.map((video) => (
                  <RecommendedVideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}
          {activeTab !== 'Videos' && (
             <div className="bg-slate-800 rounded-xl p-4 text-center text-slate-400">
               Sidebar content related to "{activeTab}" would go here.
             </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-3 rounded-lg text-sm text-center ${error.includes('successfully') ? 'bg-green-600' : 'bg-red-600'} text-white mb-4`}
                role="alert"
              >
                {error}
              </motion.div>
            </AnimatePresence>
          )}

          {activeTab === 'Posts' && (
            <>
              {/* Post Creation */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <SafeImage
                      src={currentUser.avatar}
                      alt="Current User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      aria-label="Create new post"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors" aria-label="Add image">
                          <Image className="w-5 h-5" />
                        </button>
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors" aria-label="Upload file">
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-400">{postContent.length}/500</span>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                          disabled={!postContent.trim()}
                          aria-label="Publish post"
                        >
                          <Send className="w-4 h-4" />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Placeholder for actual posts content if any */}
              <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
                No posts yet. Be the first to share something!
              </div>
            </>
          )}

          {activeTab === 'Videos' && (
            <>
              {/* Video Controls & Upload Button */}
              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300 text-sm">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-slate-700'} text-white hover:bg-blue-500 transition-colors`}
                    aria-label="Switch to grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v12h12V4H4zm2 2h2v2H6V6zm0 4h2v2H6v-2zm0 4h2v2H6v-2zm4-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" /></svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600' : 'bg-slate-700'} text-white hover:bg-blue-500 transition-colors`}
                    aria-label="Switch to list view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300 text-sm">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    aria-label="Sort videos by"
                  >
                    <option value="recent">Recent</option>
                    <option value="popular">Popular</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    aria-label="Upload new video"
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>Upload Video</span>
                  </button>
                </div>
              </div>

              {/* Main Video Grid/List */}
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6"}>
                {filteredAndSortedVideos.length > 0 ? (
                  filteredAndSortedVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))
                ) : (
                  <p className="text-slate-400 text-center col-span-full py-10">No videos found matching your criteria.</p>
                )}
              </div>
            </>
          )}
          {/* Add other activeTab content here (e.g., About, Photos, Friends) */}
          {activeTab === 'About' && (
            <div className="bg-slate-800 rounded-xl p-6 text-slate-300 space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">About {profileUser.name}</h3>
              <p>{profileUser.bio}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><strong className="text-white">Location:</strong> {profileUser.location}</p>
                <p><strong className="text-white">Joined:</strong> {profileUser.joinDate}</p>
                <p><strong className="text-white">Website:</strong> <a href={`http://${profileUser.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{profileUser.website}</a></p>
                <p><strong className="text-white">Total Videos:</strong> {profileUser.videosCount}</p>
              </div>
            </div>
          )}
          {activeTab === 'Photos' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Placeholder for photos if you had separate photo data */}
                <p className="text-slate-400 col-span-full text-center">No photos available.</p>
              </div>
            </div>
          )}
          {activeTab === 'Friends' && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Friends</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Placeholder for friends list */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-slate-700 rounded-lg">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                      <SafeImage src={`https://randomuser.me/api/portraits/men/${10 + i}.jpg`} alt={`Friend ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-white">Friend {i + 1}</span>
                    <button className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">View Profile</button>
                  </div>
                ))}
                <p className="text-slate-400 col-span-full text-center">More friends coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Video Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-800 rounded-xl p-8 w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-video-title"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                aria-label="Close upload modal"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 id="upload-video-title" className="text-2xl font-bold text-white mb-6">Upload New Video</h2>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="mb-6">
                <label htmlFor="video-file" className="block text-slate-300 text-sm font-medium mb-2">Video File</label>
                <div
                  className={`border-2 border-dashed ${videoFile ? 'border-blue-500' : 'border-slate-600'} rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors relative`}
                >
                  <input
                    type="file"
                    id="video-file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-describedby="file-upload-help"
                  />
                  {videoPreview ? (
                    <video src={videoPreview} controls className="max-h-48 mx-auto rounded-lg mb-3 object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <UploadCloud className="w-12 h-12 mb-2" />
                      <p className="text-sm">Drag & drop your video here, or <span className="text-blue-400 font-medium">click to browse</span></p>
                      <p id="file-upload-help" className="text-xs mt-1">MP4, MOV, AVI, etc. (Max 500MB)</p>
                    </div>
                  )}
                  {videoFile && (
                    <p className="text-green-400 text-sm mt-3">{videoFile.name} ready for upload.</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="video-title" className="block text-slate-300 text-sm font-medium mb-2">Video Title</label>
                <input
                  type="text"
                  id="video-title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full bg-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-required="true"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="video-tags" className="block text-slate-300 text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="video-tags"
                  value={videoTags}
                  onChange={(e) => setVideoTags(e.target.value)}
                  placeholder="e.g., nature, travel, tutorial"
                  className="w-full bg-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleUploadVideo}
                disabled={uploading || !videoFile || !videoTitle.trim()}
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center space-x-2
                  ${uploading || !videoFile || !videoTitle.trim() ? 'bg-blue-800 opacity-60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                `}
                aria-disabled={uploading || !videoFile || !videoTitle.trim()}
              >
                {uploading && <Loader2 className="animate-spin w-5 h-5" />}
                <span>{uploading ? 'Uploading...' : 'Upload Video'}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Playback Modal */}
      <AnimatePresence>
        {showVideoModal && modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[100]"
            onClick={handleCloseVideoModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-800 rounded-xl max-w-4xl w-full flex flex-col lg:flex-row h-full max-h-[90vh] relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-modal-title"
            >
              <button
                onClick={handleCloseVideoModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 rounded-full bg-slate-700/50"
                aria-label="Close video player"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player Section */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[250px] lg:min-h-full">
                <video
                  ref={el => videoRefs.current[modalVideo.id] = el}
                  src={modalVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onPlay={() => setPlayingVideo(modalVideo.id)}
                  onPause={() => setPlayingVideo(null)}
                  onError={(e) => { console.error('Video error:', e); setError('Failed to load video.'); }}
                  tabIndex={0}
                  aria-label={`Video player for ${modalVideo.title}`}
                />
              </div>

              {/* Video Details & Comments Section */}
              <div className="w-full lg:w-96 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                <h3 id="video-modal-title" className="text-xl font-bold text-white mb-3">{modalVideo.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{modalVideo.description}</p>

                {/* Video Stats */}
                <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatCount(videoStats[modalVideo.id]?.views || modalVideo.views)} Views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{modalVideo.uploadDate}</span>
                  </div>
                </div>

                {/* Action Buttons for Modal */}
                <div className="flex items-center space-x-4 mb-6 border-b border-slate-700 pb-4">
                  <button
                    onClick={(e) => handleVideoLike(modalVideo.id, e)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                      videoStats[modalVideo.id]?.isLiked ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    aria-label={`${videoStats[modalVideo.id]?.isLiked ? 'Unlike' : 'Like'} this video`}
                  >
                    <Heart className={`w-5 h-5 ${videoStats[modalVideo.id]?.isLiked ? 'fill-current' : ''}`} />
                    <span>{formatCount(videoStats[modalVideo.id]?.likes || modalVideo.likes)}</span>
                  </button>
                  <button
                    onClick={(e) => handleVideoShare(modalVideo, e)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                    aria-label="Share this video"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={(e) => handleVideoBookmark(modalVideo.id, e)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                      videoStats[modalVideo.id]?.isBookmarked ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    aria-label={`${videoStats[modalVideo.id]?.isBookmarked ? 'Remove bookmark' : 'Bookmark'} this video`}
                  >
                    <Bookmark className={`w-5 h-5 ${videoStats[modalVideo.id]?.isBookmarked ? 'fill-current' : ''}`} />
                    <span>Bookmark</span>
                  </button>
                </div>

                {/* Comments Section */}
                <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                  <h4 className="text-lg font-semibold text-white mb-3">Comments ({videoComments.length})</h4>
                  {videoComments.length > 0 ? (
                    <div className="space-y-4">
                      {videoComments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <SafeImage
                            src={comment.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face'}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-white text-sm font-medium">{comment.author} <span className="text-slate-400 text-xs ml-2">{comment.timestamp}</span></p>
                            <p className="text-slate-300 text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No comments yet. Be the first to comment!</p>
                  )}
                </div>

                {/* Comment Input */}
                <div className="mt-auto pt-4 border-t border-slate-700">
                  <h4 className="text-lg font-semibold text-white mb-3">Add a Comment</h4>
                  <div className="flex items-center space-x-3">
                    <SafeImage
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write your comment..."
                      className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                      aria-label="Write a comment"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentInput.trim()}
                      className={`px-4 py-2 rounded-full font-medium transition-colors ${commentInput.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                      aria-label="Post comment"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBuzz;