import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { X, Send, MessageCircle } from 'lucide-react';

// =============================================================
// Backend Developer Comments:
// Utility Functions:
// `formatTimeAgo` expects ISO 8601 timestamps for comments.
// =============================================================
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  const options = { month: 'short', day: 'numeric' };
  if (now.getFullYear() !== time.getFullYear()) {
    options.year = 'numeric';
  }
  return time.toLocaleDateString('en-US', options);
};

const DraggableCommentsModal = ({ post, onClose, userAvatar }) => {
  const [newCommentText, setNewCommentText] = useState('');
  // =============================================================
  // Backend Developer Comments:
  // Comments Data:
  // `post.mockComments` is used for initial display.
  // For a real application, consider fetching comments specifically for this post
  // when the modal opens, if `post.mockComments` isn't comprehensive or up-to-date.
  // Endpoint: GET /api/posts/:postId/comments
  // Response Payload: Array of comment objects:
  // [{ id: string, user: { id: string, name: string, username: string, avatar: string }, comment: string, timestamp: string }, ...]
  // =============================================================
  const [comments, setComments] = useState(post.mockComments || []);

  const [modalState, setModalState] = useState({
    width: 450,
    height: 600,
    x: Math.max(0, (window.innerWidth - 450) / 2),
    y: Math.max(0, (window.innerHeight - 600) / 2),
  });

  useEffect(() => {
    const handleResize = () => {
      setModalState(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x, window.innerWidth - prev.width)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - prev.height)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // =============================================================
  // Backend Developer Comments:
  // Add New Comment:
  // This function sends a new comment to the backend.
  // Endpoint: POST /api/posts/:postId/comments
  // Request Payload: { userId: string, comment: string }
  // Response Payload: Full new comment object (including ID, timestamp, and user info).
  // Frontend expects a `timestamp` in ISO 8601 format.
  // Also, consider if post's `comments` count needs to be updated on the backend.
  // For real-time updates of comments (e.g., if multiple users are viewing),
  // WebSockets (Socket.IO, etc.) would be beneficial.
  // =============================================================
  const handleAddComment = useCallback(async () => {
    if (newCommentText.trim()) {
      const newCommentPayload = {
        // Backend: `userId` should be taken from authenticated session, not passed from frontend directly in production.
        // For this demo, we're using a static current user's info.
        userId: 'current-user-id', // Replace with actual current authenticated user ID
        comment: newCommentText.trim(),
        // Backend typically generates id, timestamp.
        // `user` object might be returned by backend based on `userId`.
      };

      try {
        // Backend: Replace this mock with an actual API call:
        // const addedComment = await apiCall(`/posts/${post.id}/comments`, {
        //   method: 'POST',
        //   body: JSON.stringify(newCommentPayload)
        // });
        // Example `addedComment` structure from backend:
        // { id: "new-comment-id", user: { id: "current-user-id", name: "Hitesh Gai", username: "hiteshxg", avatar: "H" }, comment: "...", timestamp: "..." }

        // Mock response for frontend demonstration:
        const mockAddedComment = {
          id: Date.now().toString(),
          user: { id: 'current-user', name: 'Hitesh Gai', username: 'hiteshxg', avatar: userAvatar },
          comment: newCommentText.trim(),
          timestamp: new Date().toISOString(),
        };

        setComments((prev) => [mockAddedComment, ...prev]); // Add new comment to top
        setNewCommentText('');
        // Optional: Trigger a refresh of the parent post's comment count in ChatBuzzDashboard
        // (would require a prop like `onCommentAdded(post.id)` to be passed from parent)
      } catch (error) {
        // Handle API error (e.g., show toast)
        console.error("Failed to add comment:", error);
        // Frontend should show an error message if the backend call fails.
      }
    }
  }, [newCommentText, post.id, userAvatar]); // Added post.id to dependency array

  return (
    <Rnd
      size={{ width: modalState.width, height: modalState.height }}
      position={{ x: modalState.x, y: modalState.y }}
      onDragStop={(e, d) => {
        setModalState(prev => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setModalState({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      minWidth={350}
      minHeight={400}
      bounds="body"
      dragHandleClassName="draggable-handle"
      className="border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      style={{
        transition: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 p-6 draggable-handle cursor-grab active:cursor-grabbing">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-purple-400" />
            <span>Comments on {post.user.name}'s Post</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors transform hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4 custom-scrollbar">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No comments yet. Be the first to drop some fire! 🔥</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-sm shadow-md">
                  {/* Backend: This should be an <img> tag pointing to comment.user.avatar URL. */}
                  {comment.user.avatar}
                </div>
                <div className="flex-1 bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-white text-sm font-semibold">{comment.user.name}</p>
                  <p className="text-gray-300 text-sm mt-1">{comment.comment}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatTimeAgo(comment.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-700/50 pt-4 px-6 pb-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-md shadow-md">
            {/* Backend: This should be an <img> tag pointing to userAvatar URL. */}
            {userAvatar}
          </div>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Drop a comment..."
            className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
          />
          <button
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-full text-white font-medium transition-colors transform hover:scale-105 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </div>
    </Rnd>
  );
};

export default DraggableCommentsModal;