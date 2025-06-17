import React from 'react';
import { Target, CheckCircle, Shield } from 'lucide-react';

interface RatingModeSelectorProps {
  ratingMode: 'tough' | 'lenient';
  onRatingModeChange: (mode: 'tough' | 'lenient') => void;
}

export const RatingModeSelector: React.FC<RatingModeSelectorProps> = ({
  ratingMode,
  onRatingModeChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">Evaluation Mode</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onRatingModeChange('lenient')}
          className={`p-3 rounded-lg border transition-all ${
            ratingMode === 'lenient'
              ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300'
              : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 text-gray-700 dark:text-gray-300'
          } transition-colors duration-200`}
        >
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${ratingMode === 'lenient' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-200 dark:bg-gray-700'} transition-colors duration-200`}>
              <CheckCircle className="h-4 w-4 text-white dark:text-gray-900" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium">Lenient Rating</h3>
              <p className="text-xs opacity-75">Encouraging feedback for growth</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onRatingModeChange('tough')}
          className={`p-3 rounded-lg border transition-all ${
            ratingMode === 'tough'
              ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300'
              : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 text-gray-700 dark:text-gray-300'
          } transition-colors duration-200`}
        >
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${ratingMode === 'tough' ? 'bg-red-500 dark:bg-red-400' : 'bg-gray-200 dark:bg-gray-700'} transition-colors duration-200`}>
              <Shield className="h-4 w-4 text-white dark:text-gray-900" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium">Tough Rating</h3>
              <p className="text-xs opacity-75">Critical tech interview standards</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs transition-colors duration-200">
        <div className="text-blue-800 dark:text-blue-200 transition-colors duration-200">
          <p className="font-medium">💡 Recommendation</p>
          <p>Start with <strong>Lenient</strong> for confidence building, then switch to <strong>Tough</strong> for competitive interview prep.</p>
        </div>
      </div>
    </div>
  );
};