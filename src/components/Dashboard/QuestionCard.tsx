import React, { useState } from 'react';
import { Clock, Tag, ArrowRight, Code, User, Lightbulb, Building2, X } from 'lucide-react';
import type { Question } from '../../data/questions';

interface QuestionCardProps {
  question: Question;
  onClick: (question: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const [showCompanies, setShowCompanies] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'hard':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'technical':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'situational':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral':
        return User;
      case 'technical':
        return Code;
      case 'situational':
        return Lightbulb;
      default:
        return Tag;
    }
  };

  const CategoryIcon = getCategoryIcon(question.category);

  return (
    <>
      <div 
        onClick={() => onClick(question)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(question.category).replace('text-', 'text-').replace('bg-', 'bg-')} transition-colors duration-200`}>
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col space-y-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(question.category)} transition-colors duration-200`}>
                {question.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)} transition-colors duration-200`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {question.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed transition-colors duration-200">
          {question.description}
        </p>

        {/* Company Tags */}
        {question.companies && question.companies.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {question.companies.slice(0, 3).map((company, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  {company}
                </span>
              ))}
              {question.companies.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCompanies(true);
                  }}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors font-medium"
                >
                  +{question.companies.length - 3} more
                </button>
              )}
            </div>
          </div>
        )}

        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                  +{question.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>~5-10 min</span>
          </div>
          
          <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105">
            Start Practice
          </button>
        </div>
      </div>

      {/* Company Tags Modal */}
      {showCompanies && question.companies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Companies asking this question</h3>
              <button
                onClick={() => setShowCompanies(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {question.companies.map((company, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">{company}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowCompanies(false)}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};