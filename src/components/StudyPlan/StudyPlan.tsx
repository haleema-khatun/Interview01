import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Clock, Target, BookOpen, Zap, Filter, Star, TrendingUp } from 'lucide-react';
import { getStudyPlansByType, getStudyPlansByDifficulty, studyPlanCount, type StudyPlan } from '../../data';
import { StudyPlanService } from '../../services/studyPlanService';

export const StudyPlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [filteredPlans, setFilteredPlans] = useState<StudyPlan[]>([]);
  const [allPlans, setAllPlans] = useState<StudyPlan[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all study plans
    const loadStudyPlans = async () => {
      let plans: StudyPlan[] = [];
      
      if (selectedType !== 'all') {
        plans = getStudyPlansByType(selectedType);
      } else if (selectedDifficulty !== 'all') {
        plans = getStudyPlansByDifficulty(selectedDifficulty);
      } else {
        // Load all plans
        plans = [
          ...getStudyPlansByType('accelerated'),
          ...getStudyPlansByType('intensive'),
          ...getStudyPlansByType('comprehensive')
        ];
      }
      
      setAllPlans(plans);
      setFilteredPlans(plans);
      setLoading(false);
    };
    
    loadStudyPlans();
    
    // Load user progress if logged in
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await StudyPlanService.getAllProgress(user.id);
      
      if (error) {
        console.error('Error loading study plan progress:', error);
      } else if (data && data.length > 0) {
        // Create a map of plan_id to progress_percentage
        const progressMap: Record<string, number> = {};
        data.forEach(progress => {
          progressMap[progress.plan_id] = progress.progress_percentage;
        });
        
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  useEffect(() => {
    let filtered = allPlans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(plan => plan.type === selectedType);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(plan => plan.difficulty === selectedDifficulty);
    }

    setFilteredPlans(filtered);
  }, [searchTerm, selectedType, selectedDifficulty, allPlans]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accelerated':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'intensive':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'comprehensive':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const handleStartPlan = (planId: string) => {
    navigate(`/study-plan/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-200">Loading study plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Study Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Choose a structured learning path tailored to your interview preparation goals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors duration-200">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{studyPlanCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-200">
                <Zap className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">Accelerated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {getStudyPlansByType('accelerated').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors duration-200">
                <Target className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">Comprehensive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {getStudyPlansByType('comprehensive').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors duration-200">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">Your Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {Object.keys(userProgress).length} plans
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Filter Study Plans</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search study plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
            </div>

            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Types</option>
              <option value="accelerated">Accelerated (1 Week)</option>
              <option value="intensive">Intensive (2 Weeks)</option>
              <option value="comprehensive">Comprehensive (1 Month)</option>
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Study Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const progress = userProgress[plan.id] || 0;
            
            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 relative"
              >
                {/* Progress Indicator */}
                {progress > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {plan.popular && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 transition-colors duration-200">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </span>
                    )}
                    {plan.recommended && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Recommended
                      </span>
                    )}
                    {progress === 100 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors duration-200">
                        <Star className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    )}
                    {progress > 0 && progress < 100 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 transition-colors duration-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {progress}% Complete
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{plan.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{plan.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors duration-200">{plan.description}</p>

                {/* Type and Difficulty */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(plan.type)} transition-colors duration-200`}>
                    {plan.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(plan.difficulty)} transition-colors duration-200`}>
                    {plan.difficulty}
                  </span>
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Topics Covered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.topics.slice(0, 4).map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md transition-colors duration-200"
                      >
                        {topic}
                      </span>
                    ))}
                    {plan.topics.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md transition-colors duration-200">
                        +{plan.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">Key Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center transition-colors duration-200">
                        <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    <span className="font-medium text-gray-900 dark:text-white">{plan.questionsCount}</span> practice questions
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleStartPlan(plan.id)}
                  className={`w-full ${
                    progress === 100 
                      ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600' 
                      : progress > 0 
                        ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600'
                  } text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105`}
                >
                  {progress === 100 
                    ? 'Review Completed Plan' 
                    : progress > 0 
                      ? 'Continue Plan' 
                      : 'Start Study Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No study plans found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedDifficulty('all');
              }}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};