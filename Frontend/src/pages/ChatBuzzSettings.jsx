import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2, 
  Moon, 
  Sun, 
  Check,
  ChevronRight,
  ArrowLeft,
  Save,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function ChatBuzzSettings() {
  // State management
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Hitesh Gai',
    email: 'hitesh@gmail.com',
    username: 'hiteshxg',
    memberSince: 'January 2023',
    avatar: 'A' // image URL 
  });

  // Settings state
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: {
      messages: true,
      mentions: true,
      follows: false,
      posts: true,
      email: true,
      push: true
    },
    privacy: {
      profileVisible: true,
      showOnline: true,
      allowMessages: 'everyone', 
      searchable: true
    },
    appearance: {
      theme: 'blue',
      fontSize: 'medium',
      compactMode: false
    },
    language: {
      locale: 'en-US',
      timezone: 'UTC+05:30',
      dateFormat: 'DD/MM/YYYY'
    },
    sounds: {
      messageSound: 'default',
      notificationSound: true,
      volume: 80
    }
  });

  // Original settings for comparison
  const [originalSettings, setOriginalSettings] = useState(settings);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  // Handle setting updates
  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
  };

  // API call handlers (these would connect to your backend)
  const handleSaveSettings = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace with actual API call:
      // const response = await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setOriginalSettings(settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrors({ general: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountAction = async (action) => {
    const confirmMessage = action === 'deactivate' 
      ? 'Are you sure you want to deactivate your account?' 
      : 'Are you sure you want to delete your account? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      // Replace with actual API call:
      // await fetch(`/api/user/account/${action}`, { method: 'POST' });
      
      console.log(`Account ${action} requested`);
      alert(`Account ${action} request submitted. You will receive an email confirmation.`);
      
    } catch (error) {
      console.error(`Error ${action}ing account:`, error);
      setErrors({ account: `Failed to ${action} account. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!shouldLeave) return;
    }
    
    // Replace with your routing logic:
    // navigate('/dashboard');
    console.log('Navigate back to dashboard');
  };

  // Components
  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        checked ? 'bg-blue-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const Select = ({ value, onChange, options, disabled = false }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
      <AlertTriangle className="w-4 h-4 mr-2" />
      <span className="text-sm">{message}</span>
    </div>
  );

  const SuccessMessage = ({ message }) => (
    <div className="flex items-center p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-300">
      <Check className="w-4 h-4 mr-2" />
      <span className="text-sm">{message}</span>
    </div>
  );

  const settingSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { 
          label: 'Profile Information', 
          value: userData.name, 
          hasArrow: true,
          onClick: () => console.log('Navigate to profile edit')
        },
        { 
          label: 'Email', 
          value: userData.email, 
          hasArrow: true,
          onClick: () => console.log('Navigate to email settings')
        },
        { 
          label: 'Password', 
          value: '••••••••', 
          hasArrow: true,
          onClick: () => console.log('Navigate to password change')
        },
        { 
          label: 'Two-Factor Authentication', 
          value: 'Enabled', 
          hasArrow: true,
          onClick: () => console.log('Navigate to 2FA settings')
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { 
          label: 'Direct Messages', 
          type: 'toggle', 
          value: settings.notifications.messages,
          onChange: (val) => updateSetting('notifications.messages', val)
        },
        { 
          label: 'Mentions & Replies', 
          type: 'toggle', 
          value: settings.notifications.mentions,
          onChange: (val) => updateSetting('notifications.mentions', val)
        },
        { 
          label: 'New Followers', 
          type: 'toggle', 
          value: settings.notifications.follows,
          onChange: (val) => updateSetting('notifications.follows', val)
        },
        { 
          label: 'Post Interactions', 
          type: 'toggle', 
          value: settings.notifications.posts,
          onChange: (val) => updateSetting('notifications.posts', val)
        },
        { 
          label: 'Email Notifications', 
          type: 'toggle', 
          value: settings.notifications.email,
          onChange: (val) => updateSetting('notifications.email', val)
        },
        { 
          label: 'Push Notifications', 
          type: 'toggle', 
          value: settings.notifications.push,
          onChange: (val) => updateSetting('notifications.push', val)
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { 
          label: 'Profile Visibility', 
          type: 'toggle', 
          value: settings.privacy.profileVisible,
          onChange: (val) => updateSetting('privacy.profileVisible', val)
        },
        { 
          label: 'Show Online Status', 
          type: 'toggle', 
          value: settings.privacy.showOnline,
          onChange: (val) => updateSetting('privacy.showOnline', val)
        },
        { 
          label: 'Searchable Profile', 
          type: 'toggle', 
          value: settings.privacy.searchable,
          onChange: (val) => updateSetting('privacy.searchable', val)
        },
        {
          label: 'Who can message you',
          type: 'select',
          value: settings.privacy.allowMessages,
          onChange: (val) => updateSetting('privacy.allowMessages', val),
          options: [
            { value: 'everyone', label: 'Everyone' },
            { value: 'friends', label: 'Friends only' },
            { value: 'none', label: 'No one' }
          ]
        },
        { 
          label: 'Blocked Users', 
          value: '3 users blocked', 
          hasArrow: true,
          onClick: () => console.log('Navigate to block list')
        },
        { 
          label: 'Data Export', 
          value: 'Request your data', 
          hasArrow: true,
          onClick: () => console.log('Navigate to data export')
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { 
          label: 'Dark Mode', 
          type: 'toggle', 
          value: settings.darkMode,
          onChange: (val) => updateSetting('darkMode', val),
          icon: settings.darkMode ? Moon : Sun
        },
        {
          label: 'Theme Color',
          type: 'select',
          value: settings.appearance.theme,
          onChange: (val) => updateSetting('appearance.theme', val),
          options: [
            { value: 'blue', label: 'Blue' },
            { value: 'purple', label: 'Purple' },
            { value: 'green', label: 'Green' },
            { value: 'orange', label: 'Orange' }
          ]
        },
        {
          label: 'Font Size',
          type: 'select',
          value: settings.appearance.fontSize,
          onChange: (val) => updateSetting('appearance.fontSize', val),
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ]
        },
        { 
          label: 'Compact Mode', 
          type: 'toggle', 
          value: settings.appearance.compactMode,
          onChange: (val) => updateSetting('appearance.compactMode', val)
        }
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      items: [
        {
          label: 'Language',
          type: 'select',
          value: settings.language.locale,
          onChange: (val) => updateSetting('language.locale', val),
          options: [
            { value: 'en-US', label: 'English (US)' },
            { value: 'en-GB', label: 'English (UK)' },
            { value: 'es-ES', label: 'Spanish' },
            { value: 'fr-FR', label: 'French' },
            { value: 'de-DE', label: 'German' },
            { value: 'hi-IN', label: 'Hindi' }
          ]
        },
        {
          label: 'Time Zone',
          type: 'select',
          value: settings.language.timezone,
          onChange: (val) => updateSetting('language.timezone', val),
          options: [
            { value: 'UTC+05:30', label: 'UTC+05:30 (India)' },
            { value: 'UTC+00:00', label: 'UTC+00:00 (GMT)' },
            { value: 'UTC-05:00', label: 'UTC-05:00 (EST)' },
            { value: 'UTC-08:00', label: 'UTC-08:00 (PST)' }
          ]
        },
        {
          label: 'Date Format',
          type: 'select',
          value: settings.language.dateFormat,
          onChange: (val) => updateSetting('language.dateFormat', val),
          options: [
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
          ]
        }
      ]
    },
    {
      title: 'Sounds',
      icon: Volume2,
      items: [
        {
          label: 'Message Sound',
          type: 'select',
          value: settings.sounds.messageSound,
          onChange: (val) => updateSetting('sounds.messageSound', val),
          options: [
            { value: 'default', label: 'Default' },
            { value: 'chime', label: 'Chime' },
            { value: 'ping', label: 'Ping' },
            { value: 'none', label: 'None' }
          ]
        },
        { 
          label: 'Notification Sounds', 
          type: 'toggle', 
          value: settings.sounds.notificationSound,
          onChange: (val) => updateSetting('sounds.notificationSound', val)
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Settings className="w-6 h-6 mr-3 text-blue-400" />
            <h1 className="text-xl font-semibold">Settings</h1>
            {hasUnsavedChanges && (
              <span className="ml-3 px-2 py-1 text-xs bg-orange-600 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Status Messages */}
        {errors.general && <ErrorMessage message={errors.general} />}
        {saveStatus && <SuccessMessage message={saveStatus} />}

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-semibold mr-4">
              {userData.avatar}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-gray-400">@{userData.username}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {userData.memberSince}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center">
                  <section.icon className="w-5 h-5 mr-3 text-blue-400" />
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.icon && <item.icon className="w-4 h-4 mr-3 text-gray-400" />}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      
                      <div className="flex items-center">
                        {item.type === 'toggle' ? (
                          <ToggleSwitch 
                            checked={item.value} 
                            onChange={item.onChange}
                            disabled={loading}
                          />
                        ) : item.type === 'select' ? (
                          <Select
                            value={item.value}
                            onChange={item.onChange}
                            options={item.options}
                            disabled={loading}
                          />
                        ) : (
                          <>
                            <span className="text-gray-400 mr-2">{item.value}</span>
                            {item.hasArrow && (
                              <button
                                onClick={item.onClick}
                                disabled={loading}
                                className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                              >
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Account Management */}
        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Account Management</h3>
          {errors.account && <ErrorMessage message={errors.account} />}
          <div className="space-y-4">
            <button 
              onClick={() => handleAccountAction('deactivate')}
              disabled={loading}
              className="w-full text-left p-4 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-red-800 transition-colors"
            >
              <div className="font-medium text-red-300">Deactivate Account</div>
              <div className="text-sm text-red-400 mt-1">Temporarily disable your account</div>
            </button>
            <button 
              onClick={() => handleAccountAction('delete')}
              disabled={loading}
              className="w-full text-left p-4 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-red-800 transition-colors"
            >
              <div className="font-medium text-red-300">Delete Account</div>
              <div className="text-sm text-red-400 mt-1">Permanently delete your account and all data</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-500">
          <p>ChatBuzz v2.1.0</p>
          <p className="mt-1">Need help? Contact support@chatbuzz.com</p>
        </div>
      </div>
    </div>
  );
}

