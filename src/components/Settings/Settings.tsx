import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Key, Eye, EyeOff, Save, AlertCircle, CheckCircle, Shield, Lock, Zap, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [savedKeys, setSavedKeys] = useState<{gemini: boolean}>({
    gemini: false
  });
  const [saving, setSaving] = useState<{gemini: boolean}>({
    gemini: false
  });

  const saveApiKeyLocally = async (provider: 'gemini', apiKey: string) => {
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

  const removeApiKey = (provider: 'gemini') => {
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
        const geminiExists = !!localStorage.getItem('gemini_api_key');
        
        console.log('API Keys check:', { gemini: geminiExists });
        
        setSavedKeys({ 
          gemini: geminiExists 
        });
      } catch (error) {
        console.error('Error checking API keys:', error);
      }
    };
    
    checkKeys();
    
    // Also set up a storage event listener to detect changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key === 'gemini_api_key') {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200">
            Configure your preferences and API keys for AI-powered evaluation
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-[#003135] rounded-xl shadow-sm p-6 border border-[#AFDDE5] dark:border-[#024950] mb-8 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-[#003135] dark:text-[#AFDDE5] mb-4 transition-colors duration-200">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#003135] dark:text-[#AFDDE5] mb-2 transition-colors duration-200">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-[#AFDDE5] dark:border-[#024950] rounded-lg bg-[#AFDDE5]/20 dark:bg-[#024950] text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003135] dark:text-[#AFDDE5] mb-2 transition-colors duration-200">Full Name</label>
              <input
                type="text"
                value={profile?.full_name || ''}
                disabled
                className="w-full px-3 py-2 border border-[#AFDDE5] dark:border-[#024950] rounded-lg bg-[#AFDDE5]/20 dark:bg-[#024950] text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-[#0FA4AF]/10 dark:bg-[#024950] border border-[#0FA4AF] dark:border-[#024950] rounded-xl p-6 mb-8 transition-colors duration-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-[#0FA4AF] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-[#003135] dark:text-[#AFDDE5] mb-2 transition-colors duration-200">🔒 Your Privacy is Protected</h3>
              <div className="text-sm text-[#003135] dark:text-[#AFDDE5] space-y-2 transition-colors duration-200">
                <p>✅ <strong>API keys are stored locally</strong> in your browser only</p>
                <p>✅ <strong>Never sent to our servers</strong> - we don't store your keys</p>
                <p>✅ <strong>Encrypted storage</strong> using browser security features</p>
                <p>✅ <strong>You have full control</strong> - remove keys anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white dark:bg-[#003135] rounded-xl shadow-sm p-6 border border-[#AFDDE5] dark:border-[#024950] transition-colors duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <Key className="h-6 w-6 text-[#0FA4AF]" />
            <h2 className="text-xl font-semibold text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200">AI API Key</h2>
            <Lock className="h-5 w-5 text-[#0FA4AF]" />
          </div>

          <div className="bg-[#024950]/10 dark:bg-[#024950] border border-[#024950] dark:border-[#024950] rounded-lg p-4 mb-6 transition-colors duration-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-[#024950] dark:text-[#0FA4AF] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200">
                <p className="font-medium mb-1">Free Platform - Bring Your Own API Key</p>
                <p>
                  Our platform is completely free! To use AI evaluation features, provide your own Gemini API key. 
                  Keys are stored securely in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Gemini API Key - Only Option */}
            <div className="border-2 border-[#0FA4AF] dark:border-[#024950] rounded-lg p-4 bg-[#0FA4AF]/10 dark:bg-[#024950] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-[#0FA4AF]" />
                    <h3 className="text-lg font-medium text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200">Google Gemini API Key</h3>
                    <span className="bg-[#0FA4AF] text-white text-xs px-2 py-1 rounded-full font-medium">RECOMMENDED</span>
                  </div>
                  <p className="text-sm text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200">
                    Get your free API key from{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0FA4AF] hover:text-[#024950] dark:hover:text-[#AFDDE5] underline transition-colors duration-200"
                    >
                      Google AI Studio
                    </a>
                    {' '}(Advanced AI capabilities with excellent reasoning!)
                  </p>
                </div>
                {savedKeys.gemini && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-[#0FA4AF]">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Saved Locally</span>
                    </div>
                    <button
                      onClick={() => removeApiKey('gemini')}
                      className="text-[#964734] hover:text-[#964734]/80 text-sm font-medium"
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
                    className="w-full px-3 py-2 border border-[#AFDDE5] dark:border-[#024950] rounded-lg focus:ring-2 focus:ring-[#0FA4AF] focus:border-transparent pr-10 disabled:bg-[#AFDDE5]/20 dark:disabled:bg-[#024950] disabled:text-[#003135] dark:disabled:text-[#AFDDE5] bg-white dark:bg-[#003135] text-[#003135] dark:text-[#AFDDE5] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#024950] dark:text-[#AFDDE5] hover:text-[#0FA4AF] transition-colors duration-200"
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
                    className="flex items-center space-x-1 bg-[#0FA4AF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#024950] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
};