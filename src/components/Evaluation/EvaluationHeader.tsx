import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Settings } from 'lucide-react';

interface EvaluationHeaderProps {
  evaluation: any;
  quickEval: any;
  question: any;
  hasAnyApiKey: boolean;
}

export const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  evaluation,
  quickEval,
  question,
  hasAnyApiKey,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg transition-colors duration-200">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              {evaluation ? 'Detailed Evaluation Results' : quickEval ? 'Quick Evaluation Results' : 'Evaluation Results'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              {question?.title || 'Interview Question'}
              {evaluation && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  evaluation.rating_mode === 'tough' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                } transition-colors duration-200`}>
                  {evaluation.rating_mode === 'tough' ? 'Tough Rating' : 'Lenient Rating'}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {!hasAnyApiKey && (
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            <span>Add API Key</span>
          </button>
        )}
      </div>
    </div>
  );
};