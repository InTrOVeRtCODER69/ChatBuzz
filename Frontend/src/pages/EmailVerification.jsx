import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1 || (value && !/^\d$/.test(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'Enter') handleContinue();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleContinue = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise((res) => setTimeout(res, 1500)); 
      console.log('Verified Code:', fullCode);

      toast.success('✅ Email verified successfully!');

      navigate('/dashboard'); 
    } catch (err) {
      toast.error('❌ Invalid verification code');
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    setIsLoading(true);
    setError('');
    setCode(['', '', '', '', '', '']);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      inputRefs.current[0]?.focus();
      toast('📨 New verification code sent');
    } catch {
      toast.error('⚠️ Failed to send new code');
      setError('Failed to send new code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-lg font-semibold text-gray-800">ChatBuzz</h1>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Confirm Your Email Address
          </h2>
          <p className="text-gray-600 text-sm">
            We’ve sent a 6-digit code to your email.
            <br />
            Enter it below.
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <motion.div className="flex justify-center space-x-3 mb-4">
            {code.map((digit, i) => (
              <motion.input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="text-red-500 text-sm text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <motion.button
            onClick={handleContinue}
            disabled={!isCodeComplete || isLoading}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isCodeComplete && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              'Continue'
            )}
          </motion.button>

          <motion.button
            onClick={handleRequestNewCode}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg font-medium bg-red-200 hover:bg-red-300 text-red-700 disabled:opacity-50"
          >
            Request a new code
          </motion.button>
        </div>

        {/* Edit Info Button */}
        <motion.div className="mt-8" whileTap={{ scale: 0.95 }}>
          <button className="bg-blue-200 hover:bg-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            EDIT INFORMATION
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerification;
