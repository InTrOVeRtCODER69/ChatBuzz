import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Send, Pause, Play, Volume2, VolumeX, X, Image, Video, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================================================================================
// TODO: BACKEND INTEGRATION - MOCK DATA REPLACEMENT
// These mock data structures should be replaced with actual data fetched from your backend API endpoints.
// The backend should manage user profiles, story content, and story interactions (views, replies).
// =====================================================================================================================

// MOCK_STORY_GROUPS: Represents a collection of stories, grouped by the user who posted them.
// Each group contains user metadata and an array of individual story objects.
const MOCK_STORY_GROUPS = [
  {
    userId: 'user_1',
    username: 'alonearyan',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    stories: [
      {
        id: '1_1', // Unique ID for this specific story item
        timestamp: Date.now() - 3600000, // Unix timestamp (milliseconds)
        media: {
          url: 'https://images.unsplash.com/photo-1581804928342-4e3405e39c91?w=400&h=600&fit=crop',
          type: 'image', // 'image' or 'video'
          duration: 5000 // Duration in milliseconds for how long to display this story
        },
        isViewed: false, // Boolean: true if the current user has viewed this specific story
        caption: "Just chilling! 😌" // Optional text caption for the story
      },
      {
        id: '1_2',
        timestamp: Date.now() - 3000000,
        media: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          type: 'video',
          duration: 8000
        },
        isViewed: false,
        caption: "New video out now! 🔥"
      }
    ]
  },
  {
    userId: 'user_2',
    username: 'hitesh ki ex',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    stories: [
      {
        id: '2_1',
        timestamp: Date.now() - 7200000,
        media: {
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
          type: 'image',
          duration: 5000
        },
        isViewed: true,
        caption: "Beautiful sunset! 🌅"
      }
    ]
  },
  {
    userId: 'user_3',
    username: 'navneet',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    stories: [
      {
        id: '3_1',
        timestamp: Date.now() - 10800000,
        media: {
          url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
          type: 'image',
          duration: 5000
        },
        isViewed: false,
        caption: "Good vibes only. ✨"
      },
      {
        id: '3_2',
        timestamp: Date.now() - 10000000,
        media: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          type: 'video',
          duration: 12000
        },
        isViewed: false,
        caption: "Weekend adventures! 🚗"
      }
    ]
  }
];

// MOCK_USER: Represents the currently authenticated user.
// This data would typically come from an authentication service after login.
const MOCK_USER = {
  id: 'current_user',
  username: 'Hitesh',
  avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
};

// =====================================================================================================================
// Utility functions
// =====================================================================================================================
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

// =====================================================================================================================
// Custom hooks
// =====================================================================================================================
const useKeyboard = (onNext, onPrev, onPause) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowRight':
        case 'Space': // Space bar also advances story
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'KeyP': // 'P' to pause/play
          e.preventDefault();
          onPause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onPause]);
};

const useSwipeGestures = (onSwipeLeft, onSwipeRight) => {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null; // Reset on new touch start
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (distance > minSwipeDistance) {
      onSwipeLeft();
    } else if (distance < -minSwipeDistance) {
      onSwipeRight();
    }
    touchStartX.current = null; // Reset for next swipe
    touchEndX.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// =====================================================================================================================
// Components
// =====================================================================================================================
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
  onTogglePause,
  isMuted,
  onToggleMute,
  onClose,
  isVideo
}) => (
  <div className="absolute top-16 right-4 flex gap-2 z-30">
    {isVideo && (
      <button
        onClick={onToggleMute}
        className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>
    )}
    <button
      onClick={onTogglePause}
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

// SingleStoryContent: Renders the media (image/video) and caption for one story item.
const SingleStoryContent = ({ story, isPaused, isMuted, onVideoEnded }) => {
  const videoRef = useRef(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [hasMediaError, setHasMediaError] = useState(false);

  useEffect(() => {
    if (story?.media?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;

      if (isPaused) {
        video.pause();
      } else {
        // Attempt to play video, catch potential errors (e.g., autoplay policy)
        video.play().catch(e => console.error("Video play error:", e));
      }
    }
  }, [isPaused, isMuted, story]);

  useEffect(() => {
    // Reset loading/error state when story changes to prepare for new media
    setIsLoadingMedia(true);
    setHasMediaError(false);
  }, [story]);

  const handleMediaLoad = () => setIsLoadingMedia(false);
  const handleMediaError = () => {
    setHasMediaError(true);
    setIsLoadingMedia(false);
  };

  if (!story) return null;

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-black rounded-xl overflow-hidden">
      {isLoadingMedia && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMediaError ? (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-center p-4">
          <p>Failed to load media for this story.</p>
        </div>
      ) : story.media.type === 'image' ? (
        <img
          src={story.media.url}
          alt={story.caption || "Story image"}
          className="w-full h-full object-contain" // Use object-contain to prevent cropping and fit content
          onLoad={handleMediaLoad}
          onError={handleMediaError}
        />
      ) : (
        <video
          ref={videoRef}
          src={story.media.url}
          className="w-full h-full object-contain" // Use object-contain for videos too
          muted={isMuted}
          onLoadedData={handleMediaLoad}
          onError={handleMediaError}
          onEnded={onVideoEnded} // Callback when video finishes playing
          playsInline // Important for mobile autoplay behavior
          preload="auto" // Suggests browser should preload the entire file
        />
      )}
      {story.caption && (
        <div className="absolute bottom-16 left-0 right-0 p-4 text-white text-center text-lg font-semibold bg-gradient-to-t from-black/50 to-transparent z-10">
          {story.caption}
        </div>
      )}
    </div>
  );
};

// StoryViewer: Manages the display of the active story group and individual stories within it.
// It also handles transitions between story groups.
const StoryViewer = ({
  storyGroups,
  activeGroupIndex,
  activeStoryIndex,
  progress,
  isPaused,
  isMuted,
  onNextStoryInGroup,
  onPrevStoryInGroup,
  onNextGroup,
  onPrevGroup,
  onTogglePause,
  onToggleMute,
  onClose,
  onStoryViewed // Callback to mark story as viewed in parent state and backend
}) => {
  const currentStoryGroup = storyGroups[activeGroupIndex];
  const currentStory = currentStoryGroup?.stories[activeStoryIndex];

  const hasNextStoryInGroup = useMemo(() => activeStoryIndex < (currentStoryGroup?.stories.length || 0) - 1, [activeStoryIndex, currentStoryGroup]);
  const hasPrevStoryInGroup = useMemo(() => activeStoryIndex > 0, [activeStoryIndex]);
  const hasNextGroup = useMemo(() => activeGroupIndex < storyGroups.length - 1, [activeGroupIndex, storyGroups.length]);
  const hasPrevGroup = useMemo(() => activeGroupIndex > 0, [activeGroupIndex, storyGroups.length]);

  // Swipe gestures for navigating between *story groups* (left/right swipe on main viewer)
  const swipeHandlers = useSwipeGestures(onNextGroup, onPrevGroup);

  // Mark story as viewed when it becomes active
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      // =================================================================================================================
      // TODO: BACKEND INTEGRATION - MARK STORY AS VIEWED
      // When a story becomes active and hasn't been viewed by the current user, send an API call to your backend.
      // API Endpoint: `POST /api/stories/{storyId}/view` or `PUT /api/users/{userId}/viewedStories`
      // Request Body: `{ storyId: currentStory.id, viewerId: MOCK_USER.id }`
      // Backend Logic:
      // 1. Record the view in a `story_views` table or update a `viewed_by` array on the story object.
      // 2. Increment a `views_count` for the story.
      // 3. Potentially trigger real-time updates (e.g., via WebSockets) to the story owner about new views.
      // =================================================================================================================
      onStoryViewed(currentStoryGroup.userId, currentStory.id);
    }
  }, [currentStory, currentStoryGroup, onStoryViewed]);


  if (!currentStoryGroup || !currentStory) return (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <p className="text-white text-lg">No stories to display.</p>
    </div>
  );

  return (
    <div
      className="flex-1 flex items-center justify-center relative overflow-hidden bg-black"
      {...swipeHandlers} // Apply swipe handlers to the whole viewer
    >
      {/* Progress Bars for current story group */}
      {/* Each segment represents a story within the current user's active story group */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2/3 z-20 flex gap-1">
        {currentStoryGroup.stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: idx < activeStoryIndex ? '100%' : // Fully filled for previous stories
                       idx === activeStoryIndex ? `${progress}%` : '0%' // Current story fills based on progress
              }}
            />
          </div>
        ))}
      </div>

      {/* User Info (of the current story's owner) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
        <img
          src={currentStoryGroup.avatar}
          className="w-10 h-10 rounded-full border-2 border-white"
          alt={currentStoryGroup.username}
          onError={(e) => e.target.src = 'https://via.placeholder.com/40x40/666/fff?text=U'}
        />
        <span className="font-medium text-white">{currentStoryGroup.username}</span>
        <span className="text-sm text-white/70">{formatTime(currentStory.timestamp)}</span>
      </div>

      {/* Controls (Pause/Play, Mute/Unmute, Close) */}
      <StoryControls
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onClose={onClose}
        isVideo={currentStory.media.type === 'video'}
      />

      {/* Main Story Content Area - Carousel for story groups */}
      {/* This section implements the visual queue of story groups (current, prev, next) */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false}>
          {storyGroups.map((group, groupIdx) => {
            const offset = groupIdx - activeGroupIndex; // Offset from the active group
            const isCurrent = offset === 0;
            const isPrev = offset === -1;
            const isNext = offset === 1;
            const isVisibleInQueue = isCurrent || isPrev || isNext; // Only render these for performance

            if (!isVisibleInQueue) return null;

            return (
              <motion.div
                key={group.userId}
                // Initial, animate, and exit properties for the sliding/scaling transition
                initial={{ opacity: 0, x: offset * 400, scale: 0.8 }} // Start off-screen, smaller
                animate={{
                  opacity: isCurrent ? 1 : 0.5, // Current is fully opaque, others are faded
                  x: offset * 400, // Position: 0 for current, -400 for prev, +400 for next (adjust 400 for spacing)
                  scale: isCurrent ? 1 : 0.8, // Current is full size, others are smaller
                  pointerEvents: isCurrent ? 'auto' : 'none' // Only the current story is interactive
                }}
                exit={{ opacity: 0, x: offset > 0 ? 400 : -400, scale: 0.8 }} // Exit animation (slide out)
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Spring animation for natural feel
                className="absolute w-[320px] h-[500px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
                style={{ zIndex: isCurrent ? 10 : (offset < 0 ? 9 : 8) }} // Z-index for layering (current on top)
              >
                {/* Render the specific story within the group if it's the active group */}
                {isCurrent ? (
                  <SingleStoryContent
                    story={currentStory} // Pass the currently active story of the active group
                    isPaused={isPaused}
                    isMuted={isMuted}
                    onVideoEnded={onNextStoryInGroup} // Video ending triggers next story in group
                  />
                ) : (
                  // Placeholder for prev/next group's active story (faded/smaller preview)
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/70 text-center">
                    {group.stories[0]?.media?.type === 'image' ? (
                      <img
                        src={group.stories[0]?.media?.url}
                        alt={group.username}
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : group.stories[0]?.media?.type === 'video' ? (
                      <video
                        src={group.stories[0]?.media?.url}
                        className="w-full h-full object-cover opacity-50"
                        preload="metadata" // Only preload metadata for side videos
                      />
                    ) : (
                      <p>{group.username}'s Story</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons for stories *within* a group (click to advance/go back in current user's stories) */}
      {hasPrevStoryInGroup && (
        <button
          onClick={onPrevStoryInGroup}
          className="absolute left-1/2 -translate-x-[200px] top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors z-20"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {hasNextStoryInGroup && (
        <button
          onClick={onNextStoryInGroup}
          className="absolute right-1/2 translate-x-[200px] top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors z-20"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Message Input for replying to the current story */}
      <div className="absolute bottom-6 w-[320px] z-20">
        <div className="flex items-center bg-[#2b2841] rounded-full px-4 py-3 shadow-lg">
          <Plus className="w-5 h-5 text-gray-400 mr-3 cursor-pointer hover:text-white transition-colors" />
          <input
            type="text"
            placeholder="Reply to story..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            // =========================================================================================================
            // TODO: BACKEND INTEGRATION - STORY REPLIES
            // On pressing Enter or Send:
            // API Endpoint: `POST /api/stories/{storyId}/reply` or `POST /api/replies`
            // Request Body: `{ storyId: currentStory.id, senderId: MOCK_USER.id, text: "reply_text_here", timestamp: Date.now() }`
            // Backend Logic:
            // 1. Store the reply in a `story_replies` collection/table.
            // 2. Notify the story owner (via WebSockets/push notifications) about the new reply.
            // 3. Consider if replies are public or private (usually private, only seen by story owner).
            // =========================================================================================================
          />
          <Send className="w-5 h-5 text-gray-400 ml-3 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

// StoriesSidebar: Displays the list of user story groups (avatars) and manages selection.
const StoriesSidebar = ({
  currentUser,
  storyGroups,
  activeGroupIndex,
  onStoryGroupSelect,
  onAddStory,
  onStoryViewed // Passed down to update UI when a story is marked viewed
}) => {
  // Filter stories to only show groups with unviewed stories or the current user's group
  const visibleStoryGroups = useMemo(() => {
    return storyGroups.filter(group =>
      group.stories.some(story => !story.isViewed) || group.userId === currentUser.id // Always show current user's group
    );
  }, [storyGroups, currentUser.id]);

  return (
    <div className="w-80 border-r border-white/10 p-6 flex flex-col bg-[#1a1625] h-full">
      <h1 className="text-2xl font-bold mb-8 text-white">ChatBuzz</h1>

      {/* Current User Story (Add Story button) */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-300 mb-3 font-medium">Your Story</h2>
        <div
          onClick={onAddStory} // Clicking this triggers the create story modal
          className="flex items-center gap-3 p-3 rounded-xl bg-[#25223d] hover:bg-[#2a2740] transition-colors cursor-pointer"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              className="w-12 h-12 rounded-full border-2 border-blue-500"
              alt={currentUser.username}
              onError={(e) => e.target.src = 'https://via.placeholder.com/48x48/666/fff?text=U'}
            />
            <button
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              aria-label="Add story"
            >
              <Plus className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUser.username}</p>
            {/* =========================================================================================================
            TODO: BACKEND INTEGRATION - DISPLAY USER STORY STATUS
            Display dynamic status here:
            - "Add to story" if no current stories or all viewed.
            - "2 new stories" if there are unviewed stories.
            - "Viewed by 5" if it's the current user's story and it has views.
            This would require fetching view counts/unread status from the backend for the current user's stories.
            ========================================================================================================= */}
            <p className="text-xs text-gray-400">Add to story</p>
          </div>
        </div>
      </div>

      {/* Friends Stories List */}
      <div className="flex-1 overflow-y-auto pr-2">
        <h2 className="text-sm text-gray-300 mb-3 font-medium">Stories</h2>
        <div className="space-y-2">
          {visibleStoryGroups.map((group, index) => (
            <div
              key={group.userId}
              onClick={() => onStoryGroupSelect(index)} // Select the entire group to view its stories
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                index === activeGroupIndex
                  ? 'bg-purple-600 shadow-lg'
                  : 'hover:bg-[#25223d]'
              }`}
            >
              <div className="relative">
                <img
                  src={group.avatar}
                  className={`w-12 h-12 rounded-full border-2 ${
                    group.stories.every(story => story.isViewed) ? 'border-gray-400' : 'border-green-500' // Ring color based on all stories viewed
                  }`}
                  alt={group.username}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/48x48/666/fff?text=U'}
                />
                {/* Optional: Indicator for new stories (e.g., small dot) */}
                {group.stories.some(story => !story.isViewed) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-[#1a1625]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  index === activeGroupIndex ? 'text-white' : 'text-white'
                }`}>
                  {group.username}
                </p>
                <p className={`text-xs truncate ${
                  index === activeGroupIndex ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  {/* TODO: Backend Integration - Display more specific info for friend's stories:
                  - "2 new stories" if there are unviewed stories in this group.
                  - "1h ago" (last story timestamp) if all stories are viewed.
                  This would require fetching unread status or last story timestamp from the backend.
                  */}
                  {formatTime(group.stories[group.stories.length - 1].timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Story Page Component: Orchestrates all story-related functionality.
const StoryPage = () => {
  const navigate = useNavigate();
  // =====================================================================================================================
  // TODO: BACKEND INTEGRATION - INITIAL STORY DATA FETCH
  // Replace `MOCK_STORY_GROUPS` with an API call to fetch all relevant story groups for the current user.
  // API Endpoint: `GET /api/stories/feed` or `GET /api/users/{userId}/stories`
  // Response should be structured similar to `MOCK_STORY_GROUPS`, including `isViewed` status for each story
  // specific to the authenticated user.
  // Consider WebSockets for real-time updates (new stories, views, replies).
  // =====================================================================================================================
  const [storyGroups, setStoryGroups] = useState(MOCK_STORY_GROUPS);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryFile, setNewStoryFile] = useState(null);
  const [loadingStoryUpload, setLoadingStoryUpload] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const progressIntervalRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input in create story modal

  const currentStoryGroup = storyGroups[activeGroupIndex];
  const currentStory = currentStoryGroup?.stories[activeStoryIndex];

  // Memoized values for navigation (optimizes re-renders)
  const hasNextStoryInGroup = useMemo(() => activeStoryIndex < (currentStoryGroup?.stories.length || 0) - 1, [activeStoryIndex, currentStoryGroup]);
  const hasPrevStoryInGroup = useMemo(() => activeStoryIndex > 0, [activeStoryIndex]);
  const hasNextGroup = useMemo(() => activeGroupIndex < storyGroups.length - 1, [activeGroupIndex, storyGroups.length]);
  const hasPrevGroup = useMemo(() => activeGroupIndex > 0, [activeGroupIndex, storyGroups.length]);

  // --- Story Navigation Handlers ---
const handleNextGroup = useCallback(() => {
  if (hasNextGroup) {
    setActiveGroupIndex(prev => prev + 1);
    setActiveStoryIndex(0); // Always start from first story of next group
    setProgress(0);
    setIsPaused(false);
  }
}, [hasNextGroup]);

const handlePrevGroup = useCallback(() => {
  if (hasPrevGroup) {
    setActiveGroupIndex(prev => prev - 1);
    // Optional: Start from the last story of the previous group if desired
    // setActiveStoryIndex(storyGroups[prev - 1].stories.length - 1);
    setActiveStoryIndex(0); // For now, always start from first story of previous group
    setProgress(0);
    setIsPaused(false);
  }
}, [hasPrevGroup]);

const handleNextStoryInGroup = useCallback(() => {
  if (hasNextStoryInGroup) {
    setActiveStoryIndex(prev => prev + 1);
    setProgress(0);
    setIsPaused(false); // Auto-play next story
  } else if (hasNextGroup) {
    handleNextGroup(); // ✅ now it's already declared
  } else {
    console.log("End of all stories.");
    // TODO: NAVIGATION - END OF STORIES
    // navigate('/');
  }
}, [hasNextStoryInGroup, hasNextGroup, handleNextGroup]);

const handlePrevStoryInGroup = useCallback(() => {
  if (hasPrevStoryInGroup) {
    setActiveStoryIndex(prev => prev - 1);
    setProgress(0);
    setIsPaused(false); // Auto-play previous story
  } else if (hasPrevGroup) {
    handlePrevGroup(); // ✅ now it's already declared
  }
}, [hasPrevStoryInGroup, hasPrevGroup, handlePrevGroup]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleCloseViewer = useCallback(() => {
    navigate('/'); // Go back to chat interface
  }, [navigate]);

  const handleStoryGroupSelect = useCallback((groupIndex) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0); // Always start from the first story of the selected group
    setProgress(0);
    setIsPaused(false);
  }, []);

  // Callback to update the `isViewed` status in the local state and trigger backend update
  const handleStoryViewed = useCallback((userId, storyId) => {
    setStoryGroups(prevGroups => prevGroups.map(group => {
      if (group.userId === userId) {
        return {
          ...group,
          stories: group.stories.map(story =>
            story.id === storyId ? { ...story, isViewed: true } : story
          )
        };
      }
      return group;
    }));
    // =========================================================================================================
    // TODO: BACKEND INTEGRATION - MARK STORY AS VIEWED (API CALL)
    // This is where you'd send the actual API call to your backend to record the view.
    // Example: `fetch('/api/stories/view', { method: 'POST', body: JSON.stringify({ userId, storyId }) })`
    // Ensure proper authentication headers are sent.
    // Backend should handle:
    // 1. Validating the user and story ID.
    // 2. Recording the view (e.g., adding user ID to a `viewedBy` array or creating a `StoryView` record).
    // 3. Incrementing a view count for the story.
    // 4. Potentially triggering real-time updates to the story owner.
    // =========================================================================================================
  }, []);


  // --- Progress management (timer for story duration) ---
  useEffect(() => {
    if (!currentStory || isPaused) {
      clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = currentStory.media.duration;
    const incrementPerMs = 100 / duration; // How much progress to add per millisecond

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (incrementPerMs * 100); // Add progress for 100ms interval
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          handleNextStoryInGroup(); // Story finished, move to next
          return 100; // Cap at 100%
        }
        return newProgress;
      });
    }, 100); // Update progress every 100ms

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [activeGroupIndex, activeStoryIndex, isPaused, currentStory, handleNextStoryInGroup]);

  // Reset progress when story or group changes
  useEffect(() => {
    setProgress(0);
  }, [activeGroupIndex, activeStoryIndex]);


  // --- Keyboard controls ---
  useKeyboard(handleNextStoryInGroup, handlePrevStoryInGroup, handleTogglePause);


  // --- Preload next media (for smoother transitions) ---
  useEffect(() => {
    // Preload next story within current group
    if (currentStoryGroup && activeStoryIndex < currentStoryGroup.stories.length - 1) {
      const nextStory = currentStoryGroup.stories[activeStoryIndex + 1];
      preloadMedia(nextStory.media.url, nextStory.media.type).catch(console.error);
    }
    // Preload first story of the next group (if exists)
    else if (hasNextGroup) {
      const nextGroup = storyGroups[activeGroupIndex + 1];
      if (nextGroup?.stories[0]) {
        preloadMedia(nextGroup.stories[0].media.url, nextGroup.stories[0].media.type).catch(console.error);
      }
    }
  }, [activeGroupIndex, activeStoryIndex, currentStoryGroup, hasNextGroup, storyGroups]);


  // --- Story Creation Modal Handlers ---
  const handleOpenCreateStoryModal = useCallback(() => {
    setShowCreateStoryModal(true);
    setNewStoryText('');
    setNewStoryFile(null);
    setUploadError(null);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit for media uploads
        setUploadError('File size exceeds 20MB limit.');
        setNewStoryFile(null);
        return;
      }
      setNewStoryFile(file);
      setUploadError(null);
    }
  }, []);

  const handleCreateStorySubmit = useCallback(async () => {
    if (!newStoryText.trim() && !newStoryFile) {
      setUploadError('Story cannot be empty. Add text or a file.');
      return;
    }

    setLoadingStoryUpload(true);
    setUploadError(null);

    try {
      let storyContentUrl = '';
      let storyType = 'text';
      let storyDuration = 5000; // Default duration for text/image stories

      if (newStoryFile) {
        // =========================================================================================================
        // TODO: BACKEND INTEGRATION - FILE UPLOAD
        // 1. Upload the `newStoryFile` to a dedicated file storage service (e.g., AWS S3, Google Cloud Storage, Cloudinary).
        // 2. This typically involves making a `POST` request with `FormData` or using a pre-signed URL.
        // 3. The backend should return the public URL of the uploaded file.
        // Example: `const uploadResponse = await fetch('/api/upload/story-media', { method: 'POST', body: formData });`
        // `storyContentUrl = uploadResponse.json().fileUrl;`
        // =========================================================================================================
        // Simulate file upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        storyContentUrl = URL.createObjectURL(newStoryFile); // For immediate local preview before actual upload URL
        storyType = newStoryFile.type.startsWith('image/') ? 'image' : 'video';

        if (storyType === 'video') {
          // For video, accurately determine duration for the progress bar
          const videoElement = document.createElement('video');
          videoElement.src = storyContentUrl;
          await new Promise(resolve => {
            videoElement.onloadedmetadata = () => {
              storyDuration = videoElement.duration * 1000; // Convert to milliseconds
              resolve();
            };
            videoElement.onerror = () => {
              console.error("Error loading video metadata for duration calculation.");
              resolve(); // Resolve anyway to proceed even if metadata fails
            };
          });
        }
      }

      const newStory = {
        // =========================================================================================================
        // TODO: BACKEND INTEGRATION - STORY CREATION (API CALL)
        // Send this `newStory` object (or a subset of it) to your backend API.
        // API Endpoint: `POST /api/stories`
        // Request Body:
        // `{
        //   userId: MOCK_USER.id,
        //   caption: newStoryText.trim(),
        //   mediaUrl: storyContentUrl, // The URL obtained from file upload
        //   mediaType: storyType,
        //   duration: storyDuration,
        //   timestamp: Date.now() // Or let backend set this
        // }`
        // Backend Logic:
        // 1. Validate input.
        // 2. Store the new story in a `stories` collection/table.
        // 3. Assign a persistent, unique `id` (e.g., UUID, database auto-increment).
        // 4. Associate the story with `MOCK_USER.id`.
        // 5. Potentially trigger distribution logic to followers/friends (e.g., add to their story feeds).
        // 6. Return the full story object (including the backend-assigned `id`) to the frontend.
        // =========================================================================================================
        id: `my_story_${Date.now()}`, // Temporary client-side ID. Backend should return real ID.
        timestamp: new Date().getTime(),
        media: {
          url: storyContentUrl, // Use the URL from the backend upload
          type: storyType,
          duration: storyDuration
        },
        isViewed: false, // The creator implicitly views their own story
        caption: newStoryText.trim()
      };

      // Simulate API call to create story
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStoryGroups(prevGroups => {
        const currentUserGroupIndex = prevGroups.findIndex(g => g.userId === MOCK_USER.id);
        if (currentUserGroupIndex !== -1) {
          // If current user already has a story group, add new story to it
          const updatedGroups = [...prevGroups];
          updatedGroups[currentUserGroupIndex] = {
            ...updatedGroups[currentUserGroupIndex],
            stories: [newStory, ...updatedGroups[currentUserGroupIndex].stories] // Add to beginning (most recent first)
          };
          return updatedGroups;
        } else {
          // If current user has no story group yet, create a new one and add the story
          return [{ userId: MOCK_USER.id, username: MOCK_USER.username, avatar: MOCK_USER.avatar, stories: [newStory] }, ...prevGroups];
        }
      });

      setShowCreateStoryModal(false);
      setNewStoryText('');
      setNewStoryFile(null);
      // After creating, automatically navigate to view own new story
      const currentUserGroupIdx = storyGroups.findIndex(g => g.userId === MOCK_USER.id);
      if (currentUserGroupIdx !== -1) {
        setActiveGroupIndex(currentUserGroupIdx);
        setActiveStoryIndex(0); // New story is always the first one
      } else {
        // If it was the very first story, it will be at index 0 after prepending to `storyGroups`
        setActiveGroupIndex(0);
        setActiveStoryIndex(0);
      }

    } catch (err) {
      console.error('Failed to create story:', err);
      setUploadError('Failed to create story. Please try again.');
      // =========================================================================================================
      // TODO: BACKEND INTEGRATION - ERROR HANDLING
      // Display user-friendly error messages based on backend response (e.g., "Upload failed", "Invalid file type").
      // =========================================================================================================
    } finally {
      setLoadingStoryUpload(false);
    }
  }, [newStoryText, newStoryFile, storyGroups]);


  return (
    <div className="flex h-screen bg-[#181628] text-white font-sans overflow-hidden">
      {/* Sidebar for story groups */}
      <StoriesSidebar
        currentUser={MOCK_USER}
        storyGroups={storyGroups}
        activeGroupIndex={activeGroupIndex}
        onStoryGroupSelect={handleStoryGroupSelect}
        onAddStory={handleOpenCreateStoryModal}
        onStoryViewed={handleStoryViewed} // Pass down to update viewed status
      />

      {/* Main Story Viewer */}
      <StoryViewer
        storyGroups={storyGroups}
        activeGroupIndex={activeGroupIndex}
        activeStoryIndex={activeStoryIndex}
        progress={progress}
        isPaused={isPaused}
        isMuted={isMuted}
        onNextStoryInGroup={handleNextStoryInGroup}
        onPrevStoryInGroup={handlePrevStoryInGroup}
        onNextGroup={handleNextGroup}
        onPrevGroup={handlePrevGroup}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        onClose={handleCloseViewer}
        onStoryViewed={handleStoryViewed}
      />

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateStoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-[#25223d] rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-white/10"
            >
              <button
                onClick={() => setShowCreateStoryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Story</h2>

              {uploadError && (
                <div className="bg-red-900 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="mb-6">
                <textarea
                  className="w-full p-3 bg-[#1a1625] border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  placeholder="Type your story text or caption..."
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  disabled={loadingStoryUpload}
                ></textarea>
              </div>

              <div className="mb-6 flex items-center justify-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                  disabled={loadingStoryUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loadingStoryUpload}
                >
                  <Image className="w-5 h-5 mr-2" /> Upload Media
                </button>
                {newStoryFile && (
                  <span className="text-sm text-gray-300">
                    {newStoryFile.name} ({Math.round(newStoryFile.size / 1024)} KB)
                  </span>
                )}
              </div>

              <button
                onClick={handleCreateStorySubmit}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingStoryUpload || (!newStoryText.trim() && !newStoryFile)}
              >
                {loadingStoryUpload ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </div>
                ) : (
                  'Share Story'
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryPage;
