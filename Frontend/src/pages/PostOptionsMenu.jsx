import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit3, Trash2, Flag, Copy, EyeOff, UserX, ExternalLink } from 'lucide-react';

const PostOptionsMenu = ({
  postId,
  postUserId, // Backend: ID of the user who created the post.
  currentUserId, // Backend: ID of the currently logged-in user. Used for authorization (Edit/Delete).
  onEdit,     // Frontend callback for Edit. Backend: PUT /api/posts/:id
  onDelete,   // Frontend callback for Delete. Backend: DELETE /api/posts/:id
  onReport,   // Frontend callback for Report. Backend: POST /api/reports/posts
  onCopyLink, // Frontend callback for Copy Link. (Backend might increment share count: POST /api/posts/:id/share)
  onMuteUser, // Frontend callback for Mute User. Backend: POST /api/users/:userId/mute
  onBlockUser, // Frontend callback for Block User. Backend: POST /api/users/:userId/block
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(prev => !prev);

  // Determine if the logged-in user is the author of the post.
  // Backend: This logic depends on `currentUserId` being reliably passed from the authenticated session.
  const isMyPost = currentUserId === postUserId;

  // Render nothing if no actions are available
  if (!isMyPost && !onReport && !onCopyLink && !onMuteUser && !onBlockUser) {
    return null;
  }

  return (
    <div className="relative inline-block text-left z-20">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        type="button"
        className="p-2 hover:bg-gray-700 rounded-full transition-colors group transform hover:scale-110 animate-fade-in-up"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-white" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-scale-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
        >
          <div className="py-1" role="none">
            {isMyPost && (
              <>
                {/* Backend: User must be authorized to edit their own post. */}
                <button
                  onClick={() => { onEdit(postId); setIsOpen(false); }}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center px-4 py-2 text-sm w-full text-left"
                  role="menuitem" tabIndex="-1"
                >
                  <Edit3 className="mr-3 h-4 w-4" />
                  Edit Post
                </button>
                /* Backend: User must be authorized to delete their own post. */
                <button
                  onClick={() => { onDelete(postId); setIsOpen(false); }}
                  className="text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center px-4 py-2 text-sm w-full text-left"
                  role="menuitem" tabIndex="-1"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Delete Post
                </button>
                <div className="border-t border-gray-700 my-1"></div>
              </>
            )}
            {/* Backend: Copy Link does not strictly require backend interaction,
                but you might want to log/increment a 'share' count on the backend. */}
            <button
              onClick={() => { onCopyLink(postId); setIsOpen(false); }}
              className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center px-4 py-2 text-sm w-full text-left"
              role="menuitem" tabIndex="-1"
            >
              <Copy className="mr-3 h-4 w-4" />
              Copy Link
            </button>
            {onReport && (
              //* Backend: This action should send a report to your moderation system. */
              <button
                onClick={() => { onReport(postId); setIsOpen(false); }}
                className="text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 flex items-center px-4 py-2 text-sm w-full text-left"
                role="menuitem" tabIndex="-1"
              >
                <Flag className="mr-3 h-4 w-4" />
                Report Post
              </button>
            )}
            {!isMyPost && onMuteUser && (
              /* Backend: Muting a user should hide their content from the current user's feed. */
              <button
                onClick={() => { onMuteUser(postUserId); setIsOpen(false); }}
                className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center px-4 py-2 text-sm w-full text-left"
                role="menuitem" tabIndex="-1"
              >
                <EyeOff className="mr-3 h-4 w-4" />
                Mute User
              </button>
            )}
            {!isMyPost && onBlockUser && (
              /* Backend: Blocking a user should prevent all interaction (messages, follows, comments)
                  and hide content from both users. It's a more severe action than muting. */
              <button
                onClick={() => { onBlockUser(postUserId); setIsOpen(false); }}
                className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center px-4 py-2 text-sm w-full text-left"
                role="menuitem" tabIndex="-1"
              >
                <UserX className="mr-3 h-4 w-4" />
                Block User
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostOptionsMenu;