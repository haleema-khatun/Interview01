import React from 'react';
import { Target, ChevronDown, ChevronUp, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface DetailedBreakdownProps {
  evaluation: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({
  evaluation,
  isExpanded,
  onToggle,
}) => {
  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Detailed Score Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">In-depth breakdown of each evaluation criteria</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {Object.entries(evaluation.detailed_breakdown).map(([key, breakdown]: [string, any]) => (
              <div key={key} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-full ${getScoreColor(breakdown.score)}`}>
                      {breakdown.score >= 7 ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : breakdown.score >= 4 ? (
                        <Target className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize transition-colors duration-200">{key.replace('_', ' ')}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${getScoreColor(breakdown.score)} transition-colors duration-200`}>
                    {breakdown.score}/10
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full ${
                        breakdown.score >= 8 ? 'bg-green-600 dark:bg-green-500' : 
                        breakdown.score >= 6 ? 'bg-yellow-600 dark:bg-yellow-500' : 
                        'bg-red-600 dark:bg-red-500'
                      }`}
                      style={{ width: `${(breakdown.score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-200">{breakdown.feedback}</p>
                
                {breakdown.examples && breakdown.examples.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Specific Observations</h5>
                    <div className="space-y-2">
                      {breakdown.examples.map((example: string, index: number) => (
                        <div key={index} className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-2 rounded border border-gray-200 dark:border-gray-600 flex items-start space-x-1.5 transition-colors duration-200">
                          <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">How to Improve</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {key === 'clarity' ? 
                      'Focus on clear structure, concise language, and logical flow. Use transitions between points and avoid jargon unless necessary. Practice speaking slowly and deliberately, and consider using frameworks like STAR to organize your thoughts before responding.' :
                    key === 'relevance' ? 
                      'Ensure every part of your answer directly addresses the question. Start by restating the question and structure your response around its key elements. Practice "question mapping" to identify the core elements before responding, and use the "so what" test to maintain focus.' :
                    key === 'critical_thinking' ? 
                      'Demonstrate analytical depth by explaining your reasoning, considering multiple perspectives, and discussing implications of your approach. Show your thought process, explore alternatives, and discuss the broader impact of your decisions to demonstrate strategic thinking.' :
                    key === 'thoroughness' ? 
                      'Cover all aspects of the question comprehensively. Include specific examples, address potential concerns, and provide complete context. Use frameworks like STAR to ensure you cover all necessary elements, and expand on your examples with measurable outcomes and specific details.' :
                    'Focus on improving this aspect of your response with more practice and attention to detail. Consider recording yourself and reviewing your responses to identify specific areas for improvement.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Score Interpretation Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="text-blue-700 dark:text-blue-200">
                    <span className="font-medium">8-10:</span> Exceptional quality
                  </div>
                  <div className="text-blue-700 dark:text-blue-200">
                    <span className="font-medium">6-7:</span> Good with room for improvement
                  </div>
                  <div className="text-blue-700 dark:text-blue-200">
                    <span className="font-medium">1-5:</span> Needs significant improvement
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};