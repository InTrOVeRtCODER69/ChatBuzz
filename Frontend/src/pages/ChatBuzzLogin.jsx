import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MessageCircle, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatBuzzLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Simulate async login process
    setTimeout(() => {
      setIsLoggingIn(false);
      console.log('Login attempted with:', { email, password });

      // Navigate to dashboard after login
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-4 left-6 z-20">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">ChatBuzz</h1>
      </div>

      <div className={`w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <div className={`space-y-8 transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
          <div className="text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Welcome to
              <br />
              <span className="text-blue-500">ChatBuzz</span>
            </h2>
          </div>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 bg-violet-600 text-white rounded-xl text-lg font-medium hover:bg-violet-700 transition-all duration-300 shadow-md"
            >
              Continue with Email
            </button>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 hover:bg-slate-600 backdrop-blur-sm"
                  />
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 hover:bg-slate-600 backdrop-blur-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                  isLoggingIn
                    ? 'bg-slate-500 cursor-wait'
                    : 'bg-violet-600 hover:bg-violet-700 hover:scale-[1.02]'
                }`}
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-violet-400 hover:text-violet-300 font-medium transition duration-200 underline"
                >
                  Click here to Sign Up
                </button>
              </p>
            </form>
          )}
        </div>

        <div className={`flex items-center justify-center transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
          <div className="relative w-full max-w-md">
            <div className="relative bg-slate-200 rounded-2xl p-8 shadow-2xl">
              <div className="bg-slate-800 rounded-xl p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-white" />
                    </div>
                    <div className="flex-1 h-3 bg-violet-400/30 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2 animate-pulse delay-500">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-white" />
                    </div>
                    <div className="flex-1 h-3 bg-blue-400/30 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2 animate-pulse delay-1000">
                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <div className="flex-1 h-3 bg-pink-400/30 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="w-20 h-6 bg-slate-400 rounded-b-lg mx-auto"></div>
              <div className="w-32 h-3 bg-slate-500 rounded-full mx-auto mt-2"></div>
            </div>

            <div className="absolute -top-4 -right-4 w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
              <Users size={20} className="text-white" />
            </div>
            <div className="absolute top-1/2 -right-8 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1000">
              <TrendingUp size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBuzzLogin;
