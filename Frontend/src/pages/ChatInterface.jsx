import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Search, Settings, Send, Phone, Video, Info, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = () => {

  // Core state management
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  // Refs for DOM manipulation
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock data - In production, this would come from API
  const currentUser = {
    id: 'user_1',
    name: 'You',
    avatar: '👤',
    status: 'online'
  };

  const [contacts, setContacts] = useState([
    { 
      id: 'contact_1', 
      name: 'Aryan', 
      avatar: '👩‍🦰', 
      lastMessage: 'Hey! How are you doing?', 
      lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
      unread: 2,
      online: true,
      lastSeen: new Date(),
      status: 'online'
    },
    { 
      id: 'contact_2', 
      name: 'alonearyan', 
      avatar: '👨‍💼', 
      lastMessage: 'See you tomorrow!', 
      lastMessageTime: new Date(Date.now() - 60 * 60 * 1000),
      unread: 0,
      online: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      status: 'away'
    },
    { 
      id: 'contact_3', 
      name: 'Adarsh', 
      avatar: '👩‍🎨', 
      lastMessage: 'That sounds amazing!', 
      lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      unread: 1,
      online: true,
      lastSeen: new Date(),
      status: 'online'
    },
    { 
      id: 'contact_4', 
      name: 'Keshav', 
      avatar: '👨‍🔧', 
      lastMessage: 'Thanks for your help', 
      lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      unread: 0,
      online: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'offline'
    },
    { 
      id: 'contact_5', 
      name: 'Shashank', 
      avatar: '👩‍💻', 
      lastMessage: 'Perfect! Let me know', 
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: 3,
      online: true,
      lastSeen: new Date(),
      status: 'online'
    },
    { 
      id: 'contact_6', 
      name: 'Hitesh ki ex', 
      avatar: '👩‍🎓', 
      lastMessage: 'lavde code hi karta rhega kya garam laptop ho rha hai sukh ma rahi hu', 
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: 0,
      online: false,
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'offline'
    }
  ]);

  const [messages, setMessages] = useState({
    contact_1: [
      { 
        id: 'msg_1', 
        text: "Hey! How are you doing?", 
        senderId: 'contact_1', 
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'read',
        type: 'text'
      },
      { 
        id: 'msg_2', 
        text: "I'm doing great, thanks! How about you?", 
        senderId: 'user_1', 
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'read',
        type: 'text'
      },
      { 
        id: 'msg_3', 
        text: "Pretty good! Just working on some new projects", 
        senderId: 'contact_1', 
        timestamp: new Date(Date.now() - 7 * 60 * 1000),
        status: 'read',
        type: 'text'
      },
      { 
        id: 'msg_4', 
        text: "That sounds exciting! What kind of projects?", 
        senderId: 'user_1', 
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'delivered',
        type: 'text'
      }
    ],
    contact_2: [
      { 
        id: 'msg_5', 
        text: "Don't forget about tomorrow's meeting", 
        senderId: 'contact_2', 
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
        status: 'read',
        type: 'text'
      },
      { 
        id: 'msg_6', 
        text: "Thanks for the reminder! What time again?", 
        senderId: 'user_1', 
        timestamp: new Date(Date.now() - 115 * 60 * 1000),
        status: 'read',
        type: 'text'
      },
      { 
        id: 'msg_7', 
        text: "10 AM sharp. See you tomorrow!", 
        senderId: 'contact_2', 
        timestamp: new Date(Date.now() - 110 * 60 * 1000),
        status: 'read',
        type: 'text'
      }
    ]
  });

  // Utility functions
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) return 'now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatMessageTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Event handlers
const handleSendMessage = useCallback(async (e) => {
  e?.preventDefault();
  if (!message.trim() || !selectedChat || loading) return;

  const messageText = message.trim();
  setMessage('');
  setLoading(true);

  // ✅ Move it here
  const newMessage = {
    id: `msg_${Date.now()}`,
    text: messageText,
    senderId: currentUser.id,
    timestamp: new Date(),
    status: 'sending',
    type: 'text'
  };

  try {
    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update message status to sent
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      )
    }));

    // Update contact's last message
    setContacts(prev => prev.map(contact =>
      contact.id === selectedChat.id
        ? { ...contact, lastMessage: messageText, lastMessageTime: new Date() }
        : contact
    ));

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That's interesting!",
        "I see what you mean",
        "Absolutely!",
        "Thanks for sharing that",
        "I agree with you",
        "That makes sense"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const responseMessage = {
        id: `msg_${Date.now() + 1}`,
        text: randomResponse,
        senderId: selectedChat.id,
        timestamp: new Date(),
        status: 'read',
        type: 'text'
      };

      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), responseMessage]
      }));

      setContacts(prev => prev.map(contact =>
        contact.id === selectedChat.id
          ? { ...contact, lastMessage: randomResponse, lastMessageTime: new Date() }
          : contact
      ));
    }, 1500);

  } catch (error) {
    console.error('Failed to send message:', error);
    setError('Failed to send message. Please try again.');

    // ✅ newMessage is now accessible here
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].filter(msg => msg.id !== newMessage.id)
    }));
  } finally {
    setLoading(false);
  }
}, [message, selectedChat, loading, currentUser.id]);


  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // In production, you would upload to server here
    const fileMessage = {
      id: `msg_${Date.now()}`,
      text: `📎 ${file.name}`,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: 'sent',
      type: 'file',
      fileData: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), fileMessage]
    }));
  }, [selectedChat, currentUser.id]);

  const handleMarkAsRead = useCallback((contactId) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, unread: 0 } : contact
    ));
  }, []);

  const handleContactSelect = useCallback((contact) => {
    setSelectedChat(contact);
    handleMarkAsRead(contact.id);
    setError(null);
  }, [handleMarkAsRead]);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat, scrollToBottom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close chat
      if (e.key === 'Escape' && selectedChat) {
        setSelectedChat(null);
      }
      
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder="Type to search"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChat]);

  // Online/offline detection
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

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Components
  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center">
          💬
        </div>
      </div>
      <p className="text-lg font-medium mb-2">Send and receive messages from people in</p>
      <p className="text-lg font-medium">full encryption.</p>
      {!isOnline && (
        <div className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
          You're currently offline. Messages will be sent when you reconnect.
        </div>
      )}
    </div>
  );

  const ChatHeader = ({ contact }) => (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setSelectedChat(null)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div 
          className="relative cursor-pointer"
          onClick={() => setShowUserProfile(!showUserProfile)}
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg">
            {contact.avatar}
          </div>
          {contact.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="cursor-pointer" onClick={() => setShowUserProfile(!showUserProfile)}>
          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
          <p className="text-sm text-slate-500">
            {contact.online ? 'Online' : `Last seen ${formatTime(contact.lastSeen)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Voice call"
        >
          <Phone className="w-5 h-5 text-slate-600" />
        </button>
        <button 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Video call"
        >
          <Video className="w-5 h-5 text-slate-600" />
        </button>
        <button 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isMe = message.senderId === currentUser.id;
    
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
          isMe 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-white text-slate-900 rounded-bl-md shadow-sm border border-slate-200'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isMe ? 'text-blue-100' : 'text-slate-500'
          }`}>
            <span className="text-xs">{formatMessageTime(message.timestamp)}</span>
            {isMe && (
              <span className="text-xs">
                {message.status === 'sending' && '⏳'}
                {message.status === 'sent' && '✓'}
                {message.status === 'delivered' && '✓✓'}
                {message.status === 'read' && <span className="text-blue-200">✓✓</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };


  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-200">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  const ContactItem = ({ contact }) => (
    <div
      onClick={() => handleContactSelect(contact)}
      className={`flex items-center p-4 hover:bg-slate-700 cursor-pointer transition-colors border-l-4 ${
        selectedChat?.id === contact.id 
          ? 'bg-slate-700 border-blue-500' 
          : 'border-transparent'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleContactSelect(contact);
        }
      }}
    >
      <div className="relative mr-3">
        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-xl">
          {contact.avatar}
        </div>
        {contact.online && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white truncate">{contact.name}</h3>
          <span className="text-xs text-slate-400">{formatTime(contact.lastMessageTime)}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300 truncate">{contact.lastMessage}</p>
          {contact.unread > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center">
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );


  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Left Navigation Column */}
      <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4">
        {/* Story Button */}
<button
 onClick={() => navigate('/stories')}//  navigation
  className="mb-6 w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 hover:border-blue-400 hover:shadow-[0_0_15px_#3b82f6] transition-all duration-300 flex items-center justify-center group relative"
  title="Add Story"
  aria-label="Add Story"
>
  <span className="text-white text-xl font-bold group-hover:scale-110 transition-transform duration-200">+</span>
  <span className="absolute -bottom-5 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    Add Story
  </span>
</button>
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Settings Button */}
        <button 
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
<div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} flex-col ${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 ease-in-out bg-slate-800 border-r border-slate-700`}>
{/* Header */}
<div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/60 backdrop-blur-md z-10">
  <div className="flex items-center space-x-3">
    <button
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      className="text-slate-300 hover:text-white focus:outline-none"
      title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      <span className="text-2xl">
        {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </span>
    </button>

    <AnimatePresence>
      {!sidebarCollapsed && (
        <motion.h1
          key="chatbuzz-title"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-white"
        >
          ChatBuzz
        </motion.h1>
      )}
    </AnimatePresence>
  </div>

  <AnimatePresence>
    {!isOnline && !sidebarCollapsed && (
      <motion.div
        key="offline-badge"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-red-400 bg-red-900 px-2 py-1 rounded"
      >
        Offline
      </motion.div>
    )}
  </AnimatePresence>
</div>


  {/* Navigation */}
  {!sidebarCollapsed && (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Chats</h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Type to search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search contacts"
        />
      </div>
    </div>
  )}


  {/* Contacts List */}
  <div className="flex-1 overflow-y-auto pb-4" role="list">
    {filteredContacts.length === 0 ? (
      !sidebarCollapsed && (
        <div className="p-4 text-center text-slate-400">
          {searchQuery ? 'No contacts found' : 'No contacts available'}
        </div>
      )
    ) : (
      filteredContacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => handleContactSelect(contact)}
          className={`flex items-center p-4 hover:bg-slate-700 cursor-pointer transition-colors border-l-4 ${
            selectedChat?.id === contact.id
              ? 'bg-slate-700 border-blue-500'
              : 'border-transparent'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleContactSelect(contact);
            }
          }}
        >
          <div className="relative mr-3">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-xl">
              {contact.avatar}
            </div>
            {contact.online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                <span className="text-xs text-slate-400">{formatTime(contact.lastMessageTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300 truncate">{contact.lastMessage}</p>
                {contact.unread > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
</div>


      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-slate-50">
          <ChatHeader contact={selectedChat} />
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-slate-100">
            {messages[selectedChat.id]?.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                disabled={loading || !isOnline}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                aria-label="Type a message"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || loading || !isOnline}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default ChatInterface;
