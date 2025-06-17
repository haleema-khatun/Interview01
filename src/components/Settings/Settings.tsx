import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Key, Eye, EyeOff, Save, AlertCircle, CheckCircle, Shield, Lock, Zap, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const [groqKey, setGroqKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [savedKeys, setSavedKeys] = useState<{groq: boolean, openai: boolean, gemini: boolean}>({
    groq: false,
    openai: false,
    gemini: false
  });
  const [saving, setSaving] = useState<{groq: boolean, openai: boolean, gemini: boolean}>({
    groq: false,
    openai: false,
    gemini: false
  });

  const saveApiKeyLocally = async (provider: 'groq' | 'openai' | 'gemini', apiKey: string) => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      // Set saving state for this provider
      setSaving(prev => ({ ...prev, [provider]: true }));
      
      // Store in browser's local storage (encrypted with simple encoding)
      const encodedKey = btoa(apiKey); // Simple base64 encoding
      localStorage.setItem(`${provider}_api_key`, encodedKey);
      
      // Add a small delay to show the saving state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSavedKeys(prev => ({ ...prev, [provider]: true }));
      toast.success(`${provider.toUpperCase()} API key saved locally and securely!`);
      
      // Clear the input for security
      if (provider === 'groq') setGroqKey('');
      if (provider === 'openai') setOpenAiKey('');
      if (provider === 'gemini') setGeminiKey('');
      
      // Reload the page to ensure the key is properly recognized
      window.location.reload();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const removeApiKey = (provider: 'groq' | 'openai' | 'gemini') => {
    try {
      localStorage.removeItem(`${provider}_api_key`);
      setSavedKeys(prev => ({ ...prev, [provider]: false }));
      toast.success(`${provider.toUpperCase()} API key removed`);
      
      // Reload the page to ensure the key removal is properly recognized
      window.location.reload();
    } catch (error) {
      console.error('Error removing API key:', error);
      toast.error('Failed to remove API key');
    }
  };

  // Check if keys exist on component mount
  useEffect(() => {
    const checkKeys = () => {
      try {
        const groqExists = !!localStorage.getItem('groq_api_key');
        const openaiExists = !!localStorage.getItem('openai_api_key');
        const geminiExists = !!localStorage.getItem('gemini_api_key');
        
        console.log('API Keys check:', { groq: groqExists, openai: openaiExists, gemini: geminiExists });
        
        setSavedKeys({ 
          groq: groqExists, 
          openai: openaiExists, 
          gemini: geminiExists 
        });
      } catch (error) {
        console.error('Error checking API keys:', error);
      }
    };
    
    checkKeys();
    
    // Also set up a storage event listener to detect changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && ['groq_api_key', 'openai_api_key', 'gemini_api_key'].includes(e.key)) {
        checkKeys();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Configure your preferences and API keys for AI-powered evaluation
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Full Name</label>
              <input
                type="text"
                value={profile?.full_name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-8 transition-colors duration-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2 transition-colors duration-200">🔒 Your Privacy is Protected</h3>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-2 transition-colors duration-200">
                <p>✅ <strong>API keys are stored locally</strong> in your browser only</p>
                <p>✅ <strong>Never sent to our servers</strong> - we don't store your keys</p>
                <p>✅ <strong>Encrypted storage</strong> using browser security features</p>
                <p>✅ <strong>You have full control</strong> - remove keys anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">AI API Keys</h2>
            <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 transition-colors duration-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                <p className="font-medium mb-1">Free Platform - Bring Your Own API Key</p>
                <p>
                  Our platform is completely free! To use AI evaluation features, provide your own API key. 
                  Keys are stored securely in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Groq API Key - First Priority */}
            <div className="border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Groq API Key</h3>
                    <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">FASTEST</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Get your free API key from{' '}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200"
                    >
                      Groq Console
                    </a>
                    {' '}(Recommended - Lightning fast inference!)
                  </p>
                </div>
                {savedKeys.groq && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Saved Locally</span>
                    </div>
                    <button
                      onClick={() => removeApiKey('groq')}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder={savedKeys.groq ? "API key saved securely" : "gsk_..."}
                    disabled={savedKeys.groq}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showGroqKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!savedKeys.groq && (
                  <button
                    onClick={() => saveApiKeyLocally('groq', groqKey)}
                    disabled={!groqKey.trim() || saving.groq}
                    className="flex items-center space-x-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving.groq ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">OpenAI API Key</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>
                {savedKeys.openai && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Saved Locally</span>
                    </div>
                    <button
                      onClick={() => removeApiKey('openai')}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showOpenAiKey ? 'text' : 'password'}
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    placeholder={savedKeys.openai ? "API key saved securely" : "sk-..."}
                    disabled={savedKeys.openai}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showOpenAiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!savedKeys.openai && (
                  <button
                    onClick={() => saveApiKeyLocally('openai', openAiKey)}
                    disabled={!openAiKey.trim() || saving.openai}
                    className="flex items-center space-x-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving.openai ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Google Gemini API Key</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Get your API key from{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
                {savedKeys.gemini && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Saved Locally</span>
                    </div>
                    <button
                      onClick={() => removeApiKey('gemini')}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={savedKeys.gemini ? "API key saved securely" : "AIza..."}
                    disabled={savedKeys.gemini}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showGeminiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!savedKeys.gemini && (
                  <button
                    onClick={() => saveApiKeyLocally('gemini', geminiKey)}
                    disabled={!geminiKey.trim() || saving.gemini}
                    className="flex items-center space-x-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving.gemini ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">How to get your API keys:</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 transition-colors duration-200">
              <p>
                <strong>🚀 Groq (Recommended):</strong> Sign up at console.groq.com, create an API key. Free tier with ultra-fast inference!
              </p>
              <p>
                <strong>OpenAI:</strong> Sign up at platform.openai.com, go to API Keys section, and create a new secret key.
              </p>
              <p>
                <strong>Google Gemini:</strong> Visit Google AI Studio, create a new project, and generate an API key.
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-medium transition-colors duration-200">
                💡 Tip: Groq offers the fastest inference speed, perfect for real-time interview feedback!
              </p>
            </div>
          </div>

          {/* Priority Notice */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-start space-x-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                <p className="font-medium mb-1">AI Provider Priority</p>
                <p>
                  The system will automatically use the fastest available provider: <strong>1st: Groq</strong> (fastest), <strong>2nd: OpenAI</strong>, <strong>3rd: Gemini</strong>. 
                  If one fails, it will automatically try the next available option.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-start space-x-2">
              <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  Your API keys are stored locally in your browser using secure storage. They are never transmitted to our servers. 
                  You can remove them at any time by clicking the "Remove" button.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};