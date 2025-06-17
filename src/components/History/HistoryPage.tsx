import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EvaluationHistoryService, type EvaluationHistoryEntry } from '../../services/evaluationHistoryService';
import { 
  ArrowLeft, 
  Clock, 
  Search, 
  Filter, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Code,
  User,
  Lightbulb,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<EvaluationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadStats();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await EvaluationHistoryService.getUserHistory(user!.id);
      
      if (error) {
        toast.error(`Failed to load history: ${error}`);
      } else {
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load evaluation history');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await EvaluationHistoryService.getUserStats(user!.id);
      
      if (error) {
        console.error('Error loading stats:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const deleteEvaluation = async (evaluationId: string) => {
    try {
      const { success, error } = await EvaluationHistoryService.deleteEvaluation(user!.id, evaluationId);
      
      if (success) {
        toast.success('Evaluation deleted successfully');
        setHistory(prev => prev.filter(item => item.id !== evaluationId));
        loadStats(); // Refresh stats
      } else {
        toast.error(`Failed to delete: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Failed to delete evaluation');
    }
  };

  const filteredHistory = history.filter(item => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      item.question_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.question_category === selectedCategory;
    
    // Timeframe filter
    let matchesTimeframe = true;
    if (selectedTimeframe !== 'all') {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      
      if (selectedTimeframe === 'today') {
        matchesTimeframe = itemDate.toDateString() === now.toDateString();
      } else if (selectedTimeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesTimeframe = itemDate >= weekAgo;
      } else if (selectedTimeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        matchesTimeframe = itemDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesCategory && matchesTimeframe;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral':
        return <User className="h-4 w-4" />;
      case 'technical':
        return <Code className="h-4 w-4" />;
      case 'situational':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'technical':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'situational':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-200">Loading your evaluation history...</p>
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg transition-colors duration-200">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Evaluation History</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Track your progress and review past interview practice sessions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-200">Performance Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Total Evaluations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.totalEvaluations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors duration-200">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stats.averageScore}/10</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-colors duration-200">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Behavioral</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                      {stats.categoryBreakdown.behavioral.count}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg transition-colors duration-200">
                    <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Technical</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                      {stats.categoryBreakdown.technical.count}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Strengths & Improvements */}
            {stats.topStrengths.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Top Strengths</h3>
                  <ul className="space-y-2">
                    {stats.topStrengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Common Improvements</h3>
                  <ul className="space-y-2">
                    {stats.commonImprovements.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Filter History</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Categories</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="situational">Situational</option>
            </select>

            {/* Timeframe */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-6">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200"
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(item.question_category)} transition-colors duration-200`}>
                        {getCategoryIcon(item.question_category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">{item.question_title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.question_category)} transition-colors duration-200`}>
                            {item.question_category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.rating_mode === 'tough' 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          } transition-colors duration-200`}>
                            {item.rating_mode === 'tough' ? 'Tough Rating' : 'Lenient Rating'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.evaluation_type === 'detailed' || item.evaluation_type === 'practice'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          } transition-colors duration-200`}>
                            {item.evaluation_type === 'detailed' || item.evaluation_type === 'practice' ? 'Detailed' : 'Standard'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.overall_score)} transition-colors duration-200`}>
                        {item.overall_score}/10
                      </div>
                      {expandedItem === item.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 transition-colors duration-200">
                    {item.answer_text}
                  </div>
                </div>
                
                {expandedItem === item.id && (
                  <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Clarity</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.clarity_score)} transition-colors duration-200`}>
                            {item.clarity_score}/10
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Relevance</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.relevance_score)} transition-colors duration-200`}>
                            {item.relevance_score}/10
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Critical Thinking</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.critical_thinking_score)} transition-colors duration-200`}>
                            {item.critical_thinking_score}/10
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Thoroughness</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.thoroughness_score)} transition-colors duration-200`}>
                            {item.thoroughness_score}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Detailed Feedback</h4>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">
                        {item.feedback_text}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Strengths</h4>
                        <ul className="space-y-1">
                          {item.strengths && item.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Improvements</h4>
                        <ul className="space-y-1">
                          {item.improvements && item.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        <div className="flex items-center space-x-1">
                          <Brain className="h-4 w-4" />
                          <span>AI: {item.ai_provider}</span>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <Zap className="h-4 w-4" />
                          <span>Type: {item.evaluation_type === 'detailed' || item.evaluation_type === 'practice' ? 'Detailed' : 'Standard'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/practice/${item.question_id}`)}
                          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                        >
                          Practice Again
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this evaluation?')) {
                              deleteEvaluation(item.id);
                            }
                          }}
                          className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200">
            <Clock className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">No Evaluation History</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
              {history.length > 0 
                ? 'No evaluations match your current filters. Try adjusting your search criteria.' 
                : 'You haven\'t completed any interview practice sessions yet.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              Start Practicing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};