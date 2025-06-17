import React from 'react';
import { Zap, Brain, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface AIProviderSelectorProps {
  selectedProvider: 'auto' | 'groq' | 'openai' | 'gemini';
  onProviderChange: (provider: 'auto' | 'groq' | 'openai' | 'gemini') => void;
  availableKeys: { groq: boolean; openai: boolean; gemini: boolean };
  tokenLimits: { groq: number; openai: number; gemini: number };
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  availableKeys,
  tokenLimits,
}) => {
  const providers = [
    {
      id: 'auto' as const,
      name: 'Auto (Recommended)',
      icon: Zap,
      description: 'Automatically selects the best available provider',
      color: 'blue',
      available: availableKeys.groq || availableKeys.openai || availableKeys.gemini,
      tokens: Math.max(tokenLimits.groq, tokenLimits.openai, tokenLimits.gemini),
      priority: 'Uses Groq → OpenAI → Gemini priority',
    },
    {
      id: 'groq' as const,
      name: 'Groq (Fastest)',
      icon: Zap,
      description: 'Lightning-fast inference with Llama models',
      color: 'green',
      available: availableKeys.groq,
      tokens: tokenLimits.groq,
      priority: 'Fastest response time',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI',
      icon: Brain,
      description: 'GPT-3.5 Turbo for detailed analysis',
      color: 'purple',
      available: availableKeys.openai,
      tokens: tokenLimits.openai,
      priority: 'Balanced quality and speed',
    },
    {
      id: 'gemini' as const,
      name: 'Google Gemini',
      icon: Sparkles,
      description: 'Google\'s advanced AI model',
      color: 'orange',
      available: availableKeys.gemini,
      tokens: tokenLimits.gemini,
      priority: 'Advanced reasoning capabilities',
    },
  ];

  const getColorClasses = (color: string, isSelected: boolean, isAvailable: boolean) => {
    if (!isAvailable) {
      return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
    }
    
    if (isSelected) {
      switch (color) {
        case 'blue': return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300';
        case 'green': return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300';
        case 'purple': return 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300';
        case 'orange': return 'border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-300';
        default: return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300';
      }
    }
    
    return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300';
  };

  const getIconColor = (color: string, isSelected: boolean, isAvailable: boolean) => {
    if (!isAvailable) return 'text-gray-400 dark:text-gray-500';
    
    if (isSelected) {
      switch (color) {
        case 'blue': return 'text-blue-600 dark:text-blue-400';
        case 'green': return 'text-green-600 dark:text-green-400';
        case 'purple': return 'text-purple-600 dark:text-purple-400';
        case 'orange': return 'text-orange-600 dark:text-orange-400';
        default: return 'text-blue-600 dark:text-blue-400';
      }
    }
    
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">AI Provider</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedProvider === provider.id;
          const isAvailable = provider.available;
          
          return (
            <button
              key={provider.id}
              onClick={() => isAvailable && onProviderChange(provider.id)}
              disabled={!isAvailable}
              className={`p-3 rounded-lg border transition-all text-left ${getColorClasses(
                provider.color,
                isSelected,
                isAvailable
              )} ${!isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-200`}
            >
              <div className="flex items-start space-x-2">
                <div className={`p-1.5 rounded-lg ${isAvailable ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} transition-colors duration-200`}>
                  <Icon className={`h-4 w-4 ${getIconColor(provider.color, isSelected, isAvailable)} transition-colors duration-200`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <h3 className="text-sm font-medium truncate text-inherit">{provider.name}</h3>
                    {isAvailable ? (
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs opacity-75 line-clamp-1">{provider.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Token Usage Info - Simplified */}
      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs transition-colors duration-200">
        <div className="flex items-start space-x-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
            <p className="font-medium">Token Usage</p>
            <p>Each evaluation uses ~1,000-2,000 tokens. Switch providers if you hit rate limits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};