import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatBuzzLogin from './pages/ChatBuzzLogin';
import SignUpPage from './pages/SignUpPage';
import ChatBuzzDashboard from './components/ChatBuzzDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<ChatBuzzLogin />} />
        <Route path="/signup" element={<SignUpPage />} />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ChatBuzzDashboard />
            </ProtectedRoute>
          }
        />

        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
