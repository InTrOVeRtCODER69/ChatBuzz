import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, MessageCircle, Users, Settings, LogOut, Plus, Archive, Bell, VolumeX, Send, Phone, Video, ArrowLeft, Paperclip, Smile, Image, Mic, MicOff } from 'lucide-react';

const ChatBuzzDashboard = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Chat data with messages
    const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Aryan',
      avatar: '🧑🏻',
      lastMessage: 'How was the movie last night?',
      time: '3:00 PM',
      unread: 0,
      online: true,
      muted: false,
      messages: [
        { id: 1, text: 'Hey bro!', sender: 'other', time: '2:55 PM', status: 'read' },
        { id: 2, text: 'How was the movie last night?', sender: 'other', time: '3:00 PM', status: 'read' }
      ]
    },
    {
      id: 2,
      name: 'Hitesh',
      avatar: '👨🏽‍💻',
      lastMessage: 'Let’s play BGMI tonight.',
      time: '1:15 PM',
      unread: 1,
      online: false,
      muted: false,
      messages: [
        { id: 1, text: 'Let’s play BGMI tonight.', sender: 'other', time: '1:15 PM', status: 'read' }
      ]
    },
    {
      id: 3,
      name: 'Navneet',
      avatar: '🧑🏽‍🎓',
      lastMessage: 'Assignments done?',
      time: '11:00 AM',
      unread: 0,
      online: true,
      muted: false,
      messages: [
        { id: 1, text: 'Assignments done?', sender: 'other', time: '11:00 AM', status: 'read' }
      ]
    },
    {
      id: 4,
      name: 'Shailaj',
      avatar: '🧔🏻',
      lastMessage: 'We should catch up this weekend.',
      time: '10:30 AM',
      unread: 0,
      online: true,
      muted: false,
      messages: [
        { id: 1, text: 'We should catch up this weekend.', sender: 'other', time: '10:30 AM', status: 'read' }
      ]
    },
    {
      id: 5,
      name: 'Adarsh',
      avatar: '👨🏻‍🏫',
      lastMessage: 'Did you watch the new tech review?',
      time: 'Yesterday',
      unread: 1,
      online: false,
      muted: false,
      messages: [
        { id: 1, text: 'Did you watch the new tech review?', sender: 'other', time: 'Yesterday', status: 'read' }
      ]
    }
  ]);


  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unread, 0);
  const currentChatData = chats.find(chat => chat.id === activeChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChat) {
      scrollToBottom();
    }
  }, [activeChat, currentChatData?.messages]);

  useEffect(() => {
    if (message) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    // Mark messages as read
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, unread: 0 } : chat
    ));
  };

  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      const newMessage = {
        id: Date.now(),
        text: message.trim(),
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      
      setChats(chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: message.trim(),
            time: newMessage.time
          };
        }
        return chat;
      }));
      
      setMessage('');
      
      // Simulate status updates
      setTimeout(() => {
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
              )
            };
          }
          return chat;
        }));
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && activeChat) {
      const newMessage = {
        id: Date.now(),
        text: `📎 ${file.name}`,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        type: 'file'
      };
      
      setChats(chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: `📎 ${file.name}`,
            time: newMessage.time
          };
        }
        return chat;
      }));
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const newMessage = {
          id: Date.now(),
          text: '🎤 Voice message (0:05)',
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          type: 'voice'
        };
        
        setChats(chats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: '🎤 Voice message',
              time: newMessage.time
            };
          }
          return chat;
        }));
      }, 3000);
    }
  };

  const toggleMute = (chatId, e) => {
    e.stopPropagation();
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, muted: !chat.muted } : chat
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${activeChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 bg-gray-800 border-r border-gray-700 flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-blue-400">ChatBuzz</h1>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <MoreVertical size={20} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2">
                    <Users size={16} /> New Group
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2">
                    <Archive size={16} /> Archived
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2">
                    <Settings size={16} /> Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2 text-red-400">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-sm text-gray-400">Chats ({filteredChats.length})</span>
            {totalUnread > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnread} unread
              </span>
            )}
          </div>
          
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 mb-1 ${
                activeChat === chat.id ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                  <div className="flex items-center gap-1">
                    {chat.muted && <VolumeX size={14} className="text-gray-400" />}
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleMute(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded"
                    >
                      {chat.muted ? <Bell size={14} /> : <VolumeX size={14} />}
                    </button>
                    {chat.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
            <Plus size={18} /> Start New Chat
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Chat Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setActiveChat(null)}
                className="mr-3 p-2 hover:bg-gray-700 rounded-full lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="relative mr-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
                  {currentChatData?.avatar}
                </div>
                {currentChatData?.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              
              <div>
                <h2 className="font-semibold">{currentChatData?.name}</h2>
                <p className="text-sm text-gray-400">
                  {isTyping ? 'typing...' : (currentChatData?.online ? 'Online' : 'Last seen recently')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Phone size={20} />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Video size={20} />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowChatDropdown(!showChatDropdown)}
                  className="p-2 hover:bg-gray-700 rounded-full"
                >
                  <MoreVertical size={20} />
                </button>
                
                {showChatDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-600">View Profile</button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-600">Media & Files</button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-600">Mute Notifications</button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-600">Clear Chat</button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-600 text-red-400">Block Contact</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentChatData?.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'me'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-between mt-1 ${
                    msg.sender === 'me' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-300">{msg.time}</span>
                    {msg.sender === 'me' && (
                      <span className={`text-xs ml-2 ${
                        msg.status === 'read' ? 'text-blue-300' : 'text-gray-400'
                      }`}>
                        {getStatusIcon(msg.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,document/*"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              >
                <Paperclip size={20} />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <Image size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows="1"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                  <Smile size={20} />
                </button>
              </div>

              {message.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                >
                  <Send size={20} />
                </button>
              ) : (
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
            </div>

            {isRecording && (
              <div className="mt-2 flex items-center justify-center text-red-400 text-sm">
                🔴 Recording... Tap to stop
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Welcome Screen */                    
        <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-900">
          <div className="text-center text-gray-400">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <MessageCircle size={40} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Select a chat to start messaging</h2>
            <p className="text-sm">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBuzzDashboard;