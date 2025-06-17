import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Zap, Loader } from 'lucide-react';

interface StatusNotificationsProps {
  hasAnyApiKey: boolean;
  availableKeys: { groq: boolean; openai: boolean; gemini: boolean };
  backgroundProcessing: boolean;
  selectedProvider?: string;
}

export const StatusNotifications: React.FC<StatusNotificationsProps> = ({
  hasAnyApiKey,
  availableKeys,
  backgroundProcessing,
  selectedProvider = 'auto'
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 mb-8">
      {/* API Key Status */}
      {hasAnyApiKey ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
              <p className="font-medium">✅ AI Evaluation Active</p>
              <p>
                {selectedProvider !== 'auto' ? 
                  `Using ${selectedProvider} as selected provider` : 
                  `Using ${availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} for real AI-powered feedback!`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
              <p className="font-medium mb-1">Demo Mode</p>
              <p>
                You're seeing a demo evaluation. For real AI-powered feedback, add your API key in{' '}
                <button
                  onClick={() => navigate('/settings')}
                  className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium transition-colors duration-200"
                >
                  Settings
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
            <p className="font-medium">⚡ Enhanced Offline Mode - No Database Required</p>
            <p>Your evaluation includes suggested answers, detailed breakdowns, and interview tips for maximum privacy and speed!</p>
          </div>
        </div>
      </div>

      {/* Background Processing Notice */}
      {backgroundProcessing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <Loader className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
              <p className="font-medium">🤖 AI is working on your detailed evaluation...</p>
              <p>This page will automatically update when the analysis is complete.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};