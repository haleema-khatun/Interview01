import React, { useRef } from 'react';
import { Mic, MicOff, Clock, AlertCircle } from 'lucide-react';

interface AnswerInputProps {
  answer: string;
  onAnswerChange: (answer: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  startTime: number;
  debugInfo: string[];
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  answer,
  onAnswerChange,
  isRecording,
  onToggleRecording,
  startTime,
  debugInfo,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Your Answer</h2>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 transition-colors duration-200">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Time: {Math.floor((Date.now() - startTime) / 1000 / 60)}:{String(Math.floor(((Date.now() - startTime) / 1000) % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Answer Input */}
      <div className="mb-6">
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here or use voice recording..."
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
        />
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          {answer.trim().length} characters • {answer.trim().split(/\s+/).filter(word => word.length > 0).length} words
        </div>
      </div>

      {/* Voice Recording Only */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40'
          } transition-colors duration-200`}
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Start Recording</span>
            </>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm transition-colors duration-200">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording in progress...</span>
          </div>
        )}
      </div>

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2 transition-colors duration-200">
            <span>Debug Log</span>
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 max-h-32 overflow-y-auto transition-colors duration-200">
            {debugInfo.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};