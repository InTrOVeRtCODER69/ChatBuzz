import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ChatBuzzLogin from './pages/ChatBuzzLogin';
import EmailVerification from './pages/EmailVerification';
import SignUpPage from './pages/SignUpPage';
import ChatBuzzDashboard from './pages/ChatBuzzDashboard';
import FriendPage from './pages/FriendPage';
import ChatInterface from './pages/ChatInterface';
import StoryPage from './pages/StoryPage';
import PostPage from './pages/PostPage';
import VideosPage from './pages/VideosPage'; 
import ChatBuzzSettings from './pages/ChatBuzzSettings';
import ChatBuzzBookmarks from './pages/ChatBuzzBookmarks';
import ExplorePage from './pages/ExplorePage';
import PhotoPage   from './pages/PhotoPage';
import AboutPage   from './pages/AboutPage';






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatBuzzLogin />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/dashboard" element={<ChatBuzzDashboard />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/profile/friends" element={<FriendPage />} />
        <Route path="/profile-feed" element={<PostPage />} />
        <Route path="/posts" element={<PostPage />} />
        <Route path="/stories" element={<StoryPage />} />
        <Route path="/profile/videos" element={<VideosPage />} />
         <Route path="/settings" element={<ChatBuzzSettings />} />
        <Route path="/bookmarks" element={<ChatBuzzBookmarks/>} />
       <Route path="/explore" element={<ExplorePage />} />
       <Route path="/profile/photos" element={<PhotoPage />} />

       <Route path="/profile/about" element={<AboutPage/>} />

      </Routes>
    </Router>
  );
}

export default App;