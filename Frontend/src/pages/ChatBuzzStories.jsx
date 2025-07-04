import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Send, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';

// replace with API calls

const MOCK_STORIES = [
  {
    id: '1',
    userId: 'user_1',
    username: 'alonearyan',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    timestamp: Date.now() - 3600000, 
    media: {
      url: 'https://images.unsplash.com/photo-1581804928342-4e3405e39c91?w=400&h=600&fit=crop',
      type: 'image',
      duration: 5000 
    },
    isViewed: false

  },

  


  {
    id: '2',
    userId: 'user_2', 
    username: 'hitesh ki ex',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    timestamp: Date.now() - 7200000, 
    media: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      duration: 10000 
    },
    isViewed: true
  },
  {
    id: '3',
    userId: 'user_3',
    username: 'navneet',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: Date.now() - 10800000, // 3 hours ago
    media: {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      type: 'image',
      duration: 5000
    },
    isViewed: false
  }
];

const MOCK_USER = {
  id: 'current_user',
  username: 'Hitesh',
  avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
};

// Utility functions
const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
};

const preloadMedia = (url, type) => {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.onloadeddata = () => resolve(video);
      video.onerror = reject;
      video.src = url;
      video.load();
    }
  });
};

// Custom hooks
const useKeyboard = (onNext, onPrev, onPause) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowRight':
        case 'Space':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'KeyP':
          e.preventDefault();
          onPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onPause]);
};

const useSwipeGestures = (onSwipeLeft, onSwipeRight) => {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Components
const ProgressBar = ({ progress, segments }) => (
  <div className="flex gap-1 w-full">
    {Array.from({ length: segments }, (_, i) => (
      <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ 
            width: i < Math.floor(progress / (100 / segments)) ? '100%' : 
                   i === Math.floor(progress / (100 / segments)) ? `${(progress % (100 / segments)) * segments}%` : '0%'
          }}
        />
      </div>
    ))}
  </div>
);

const StoryControls = ({ 
  isPaused, 
  onPause, 
  isMuted, 
  onMute, 
  onClose, 
  isVideo 
}) => (
  <div className="absolute top-16 right-4 flex gap-2">
    {isVideo && (
      <button
        onClick={onMute}
        className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>
    )}
    <button
      onClick={onPause}
      className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
      aria-label={isPaused ? 'Play' : 'Pause'}
    >
      {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
    </button>
    <button
      onClick={onClose}
      className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
      aria-label="Close"
    >
      <X className="w-5 h-5 text-white" />
    </button>
  </div>
);

const StoryViewer = ({ 
  story, 
  progress, 
  isPaused, 
  isMuted, 
  onNext, 
  onPrev, 
  onPause, 
  onMute,
  onClose,
  hasNext, 
  hasPrev 
}) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const swipeHandlers = useSwipeGestures(onNext, onPrev);

  useEffect(() => {
    if (story?.media?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;
      
      if (isPaused) {
        video.pause();
      } else {
        video.play().catch(console.error);
      }
    }
  }, [isPaused, isMuted, story]);

  const handleMediaLoad = () => setIsLoading(false);
  const handleMediaError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (!story) return null;

  return (
    <div 
      className="flex-1 flex items-center justify-center relative overflow-hidden bg-black"
      {...swipeHandlers}
    >
      {/* Progress Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2/3 z-20">
        <ProgressBar progress={progress} segments={1} />
      </div>

      {/* User Info */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
        <img 
          src={story.avatar} 
          className="w-10 h-10 rounded-full border-2 border-white" 
          alt={story.username}
          onError={(e) => e.target.src = 'https://via.placeholder.com/40x40/666/fff?text=U'}
        />
        <span className="font-medium text-white">{story.username}</span>
        <span className="text-sm text-white/70">{formatTime(story.timestamp)}</span>
      </div>

      {/* Controls */}
      <StoryControls
        isPaused={isPaused}
        onPause={onPause}
        isMuted={isMuted}
        onMute={onMute}
        onClose={onClose}
        isVideo={story.media.type === 'video'}
      />

      {/* Media Content */}
      <div className="rounded-xl overflow-hidden shadow-2xl w-[320px] h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-white">Failed to load media</p>
          </div>
        ) : story.media.type === 'image' ? (
          <img
            src={story.media.url}
            alt={story.username}
            className="w-full h-full object-cover"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
          />
        ) : (
          <video
            ref={videoRef}
            src={story.media.url}
            className="w-full h-full object-cover"
            muted={isMuted}
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            onEnded={onNext}
            playsInline
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Message Input */}
      <div className="absolute bottom-6 w-[320px] z-20">
        <div className="flex items-center bg-[#2b2841] rounded-full px-4 py-3 shadow-lg">
          <Plus className="w-5 h-5 text-gray-400 mr-3 cursor-pointer hover:text-white transition-colors" />
          <input
            type="text"
            placeholder="Reply to story..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
          />
          <Send className="w-5 h-5 text-gray-400 ml-3 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

const StoriesSidebar = ({ 
  currentUser, 
  stories, 
  activeIndex, 
  onStorySelect, 
  onAddStory 
}) => (
  <div className="w-80 border-r border-white/10 p-6 flex flex-col bg-[#1a1625]">
    <h1 className="text-2xl font-bold mb-8 text-white">ChatBuzz</h1>
    
    {/* Current User Story */}
    <div className="mb-6">
      <h2 className="text-sm text-gray-300 mb-3 font-medium">Your Story</h2>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#25223d] hover:bg-[#2a2740] transition-colors cursor-pointer">
        <div className="relative">
          <img
            src={currentUser.avatar}
            className="w-12 h-12 rounded-full border-2 border-blue-500"
            alt={currentUser.username}
            onError={(e) => e.target.src = 'https://via.placeholder.com/48x48/666/fff?text=U'}
          />
          <button
            onClick={onAddStory}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            aria-label="Add story"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{currentUser.username}</p>
          <p className="text-xs text-gray-400">Add to story</p>
        </div>
      </div>
    </div>

    {/* Friends Stories */}
    <div className="flex-1">
      <h2 className="text-sm text-gray-300 mb-3 font-medium">Stories</h2>
      <div className="space-y-2 overflow-y-auto">
        {stories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => onStorySelect(index)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              index === activeIndex 
                ? 'bg-purple-600 shadow-lg' 
                : 'hover:bg-[#25223d]'
            }`}
          >
            <div className="relative">
              <img
                src={story.avatar}
                className={`w-12 h-12 rounded-full border-2 ${
                  story.isViewed ? 'border-gray-400' : 'border-green-500'
                }`}
                alt={story.username}
                onError={(e) => e.target.src = 'https://via.placeholder.com/48x48/666/fff?text=U'}
              />
              {story.media.type === 'video' && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Play className="w-2 h-2 text-white fill-current" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                index === activeIndex ? 'text-white' : 'text-white'
              }`}>
                {story.username}
              </p>
              <p className={`text-xs truncate ${
                index === activeIndex ? 'text-purple-200' : 'text-gray-400'
              }`}>
                {formatTime(story.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main Component
const ChatBuzzStories = () => {
  const [stories] = useState(MOCK_STORIES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  
  const progressRef = useRef(null);
  const activeStory = stories[activeIndex];

  // Memoized values
  const hasNextStory = useMemo(() => activeIndex < stories.length - 1, [activeIndex, stories.length]);
  const hasPrevStory = useMemo(() => activeIndex > 0, [activeIndex]);

  // Handlers
  const handleNext = useCallback(() => {
    if (hasNextStory) {
      setActiveIndex(prev => prev + 1);
      setProgress(0);
    }
  }, [hasNextStory]);

  const handlePrev = useCallback(() => {
    if (hasPrevStory) {
      setActiveIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [hasPrevStory]);

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // In a real app, this would navigate back or close the modal
  }, []);

  const handleStorySelect = useCallback((index) => {
    setActiveIndex(index);
    setProgress(0);
    setIsPaused(false);
  }, []);

  const handleAddStory = useCallback(() => {
    // In a real app, this would open the story creation interface
    console.log('Add story clicked');
  }, []);

  // Progress management
  useEffect(() => {
    if (!activeStory || isPaused) return;

    const duration = activeStory.media.duration;
    const increment = 100 / (duration / 100); // Update every 100ms

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressRef.current);
          if (hasNextStory) {
            handleNext();
          }
          return 100;
        }
        return prev + increment;
      });
    }, 100);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [activeIndex, isPaused, activeStory, hasNextStory, handleNext]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  // Keyboard controls
  useKeyboard(handleNext, handlePrev, handlePause);

  // Preload next story
  useEffect(() => {
    if (hasNextStory) {
      const nextStory = stories[activeIndex + 1];
      preloadMedia(nextStory.media.url, nextStory.media.type).catch(console.error);
    }
  }, [activeIndex, hasNextStory, stories]);

  if (!isVisible) {
    return (
      <div className="flex h-screen bg-[#181628] text-white font-sans items-center justify-center">
        <p>Stories closed</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#181628] text-white font-sans overflow-hidden">
      <StoriesSidebar
        currentUser={MOCK_USER}
        stories={stories}
        activeIndex={activeIndex}
        onStorySelect={handleStorySelect}
        onAddStory={handleAddStory}
      />
      
      <StoryViewer
        story={activeStory}
        progress={progress}
        isPaused={isPaused}
        isMuted={isMuted}
        onNext={handleNext}
        onPrev={handlePrev}
        onPause={handlePause}
        onMute={handleMute}
        onClose={handleClose}
        hasNext={hasNextStory}
        hasPrev={hasPrevStory}
      />
    </div>
  );
};

export default ChatBuzzStories;