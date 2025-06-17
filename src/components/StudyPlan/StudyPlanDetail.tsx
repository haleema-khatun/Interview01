import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, Clock, Target, CheckCircle, Play, BookOpen, Award, AlertCircle, ChevronRight, Zap, BarChart3 } from 'lucide-react';
import { getStudyPlanById } from '../../data/studyPlans';
import { StudyPlanService } from '../../services/studyPlanService';
import { NotificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';

export const StudyPlanDetail: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const planData = planId ? getStudyPlanById(planId) : null;

  useEffect(() => {
    if (user && planId) {
      loadProgress();
    } else {
      // Load from localStorage as fallback
      loadLocalProgress();
      setLoading(false);
    }
  }, [user, planId]);

  const loadProgress = async () => {
    if (!user || !planId) return;
    
    try {
      setLoading(true);
      const { data, error } = await StudyPlanService.getProgress(user.id, planId);
      
      if (error) {
        console.error('Error loading study plan progress:', error);
        // Fall back to localStorage
        loadLocalProgress();
      } else if (data) {
        setCompletedDays(new Set(data.completed_days));
        setProgress(data.progress_percentage);
      } else {
        // No data found, fall back to localStorage
        loadLocalProgress();
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      loadLocalProgress();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalProgress = () => {
    // Load completed days from localStorage
    const savedProgress = localStorage.getItem(`study_plan_progress_${planId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCompletedDays(new Set(parsed.completedDays));
        setProgress(parsed.progress || 0);
      } catch (e) {
        console.error('Error loading study plan progress from localStorage:', e);
      }
    }
  };

  if (!planData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Study Plan Not Found</h2>
          <button
            onClick={() => navigate('/study-plan')}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Back to Study Plans
          </button>
        </div>
      </div>
    );
  }

  const markDayCompleted = async (day: number) => {
    const newCompletedDays = new Set([...completedDays, day]);
    setCompletedDays(newCompletedDays);
    
    // Calculate progress percentage
    const newProgress = Math.round((newCompletedDays.size / planData.days.length) * 100);
    setProgress(newProgress);
    
    // Save to localStorage as backup
    localStorage.setItem(`study_plan_progress_${planId}`, JSON.stringify({
      completedDays: Array.from(newCompletedDays),
      progress: newProgress
    }));
    
    // Save to Supabase if user is logged in
    if (user && planId) {
      try {
        const { success, error } = await StudyPlanService.saveProgress(
          user.id,
          planId,
          Array.from(newCompletedDays),
          newProgress
        );
        
        if (!success) {
          console.error('Error saving progress to Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to save progress to Supabase:', error);
      }
    }
    
    toast.success(`Day ${day} marked as completed!`);
    
    // Create notification if user completed a day
    if (user && planId) {
      try {
        await NotificationService.createNotification({
          user_id: user.id,
          title: 'Study Plan Progress',
          message: `You've completed Day ${day} of ${planData.title}. Keep up the good work!`,
          type: 'success',
          is_read: false,
          link: `/study-plan/${planId}`
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }
    
    // Create special notification if user completed the entire plan
    if (newCompletedDays.size === planData.days.length && user && planId) {
      try {
        await NotificationService.createNotification({
          user_id: user.id,
          title: 'Study Plan Completed! 🎉',
          message: `Congratulations! You've completed the entire ${planData.title} study plan.`,
          type: 'success',
          is_read: false,
          link: `/study-plan/${planId}`
        });
      } catch (error) {
        console.error('Failed to create completion notification:', error);
      }
    }
  };

  const startDayPractice = (day: any) => {
    // Store the day's questions for practice
    localStorage.setItem('study_plan_day', JSON.stringify(day));
    navigate(`/practice/study-plan-day-${day.day}`);
  };

  const toggleDayExpansion = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'technical': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'situational': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const totalQuestions = planData.days.reduce((sum, day) => sum + day.questions.length, 0);
  const totalTime = planData.days.reduce((sum, day) => 
    sum + day.questions.reduce((daySum, q) => daySum + q.estimatedTime, 0), 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-200">Loading study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/study-plan')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Study Plans</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{planData.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{planData.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">{planData.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Total Questions</p>
                  <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">{totalQuestions}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Estimated Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">{Math.round(totalTime / 60)} hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Progress Overview</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {completedDays.size} / {planData.days.length} days
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}% Complete</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completedDays.size}/{planData.days.length} days</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions Covered</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {completedDays.size > 0 
                    ? planData.days
                        .filter(day => completedDays.has(day.day))
                        .reduce((sum, day) => sum + day.questions.length, 0)
                    : 0} / {totalQuestions}
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                </p>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Completion</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {progress === 100 
                    ? 'Completed' 
                    : progress === 0 
                      ? planData.duration 
                      : `${Math.ceil((planData.days.length - completedDays.size) / 7 * 7)} days left`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300 font-medium transition-colors duration-200">
                Flexible Learning: Jump ahead or revisit previous days as needed. Your progress is saved automatically!
              </p>
            </div>
          </div>
        </div>

        {/* Daily Schedule - All Unlocked */}
        <div className="space-y-6">
          {planData.days.map((day, index) => {
            const isCompleted = completedDays.has(day.day);
            const isExpanded = expandedDay === day.day;
            const totalDayTime = day.questions.reduce((sum, q) => sum + q.estimatedTime, 0);

            return (
              <div key={day.day} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
                isExpanded 
                  ? 'border-blue-300 dark:border-blue-600' 
                  : isCompleted 
                    ? 'border-green-200 dark:border-green-700' 
                    : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div 
                  className={`p-6 cursor-pointer ${
                    isExpanded 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                  } transition-colors duration-200`}
                  onClick={() => toggleDayExpansion(day.day)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      } transition-colors duration-200`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <span className="font-bold">{day.day}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Day {day.day}: {day.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{day.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{day.questions.length} questions</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">~{totalDayTime} min</p>
                      </div>
                      
                      <ChevronRight className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Questions List - Expanded View */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {day.questions.map((question, qIndex) => (
                        <div 
                          key={qIndex} 
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                          onClick={() => navigate(`/practice/${question.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 transition-colors duration-200">
                              {question.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 transition-colors duration-200">
                              {question.estimatedTime}m
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)} transition-colors duration-200`}>
                              {question.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)} transition-colors duration-200`}>
                              {question.difficulty}
                            </span>
                          </div>
                          <button 
                            className="mt-3 w-full bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/practice/${question.id}`);
                            }}
                          >
                            <Play className="h-3 w-3" />
                            <span>Practice Now</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between">
                      {!isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markDayCompleted(day.day);
                          }}
                          className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark as Completed</span>
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startDayPractice(day);
                        }}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                          isCompleted 
                            ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                        }`}
                      >
                        <Play className="h-4 w-4" />
                        <span>{isCompleted ? 'Practice Again' : 'Start Day'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Actions */}
        {completedDays.size === planData.days.length && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-8 mt-8 text-center transition-colors duration-200">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-2 transition-colors duration-200">Congratulations!</h3>
            <p className="text-green-800 dark:text-green-200 text-lg mb-4 transition-colors duration-200">
              You've completed the {planData.title} study plan. You're now ready for your interviews!
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Target className="h-5 w-5" />
                <span>Continue Practicing</span>
              </button>
              <button
                onClick={() => navigate('/study-plan')}
                className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-6 py-3 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-green-600 dark:border-green-500 flex items-center justify-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Try Another Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};