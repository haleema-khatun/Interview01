import React, { useState, useEffect } from 'react';
import { Filter, Search, TrendingUp, Target, Award, Code, User, Lightbulb, Building2, Sparkles, Clock, X, Database, Shield, Server, Cloud, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getQuestionsByCategory, 
  getQuestionsByDifficulty, 
  getQuestionsByCompany,
  getQuestionsBySubject,
  searchQuestions, 
  getAllCompanies, 
  questionCount,
  type Question 
} from '../../data';

export const Dashboard: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 20;
  const navigate = useNavigate();
  const { user } = useAuth();

  const companies = getAllCompanies();
  
  // Define available subjects
  const subjects = [
    'Frontend',
    'Backend',
    'Full Stack',
    'Data Structures & Algorithms',
    'Cybersecurity',
    'DevOps',
    'Cloud Computing',
    'Machine Learning'
  ];

  useEffect(() => {
    // Load initial questions
    loadInitialQuestions();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    if (questions.length > 0) {
      filterQuestions();
      // Reset to first page when filters change
      setCurrentPage(1);
    }
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedCompany, selectedSubject, questions]);

  const loadInitialQuestions = async () => {
    setLoading(true);
    try {
      let allQs: Question[] = [];
      
      // Load questions based on filters
      if (selectedCategory !== 'all') {
        allQs = getQuestionsByCategory(selectedCategory);
      } else if (selectedDifficulty !== 'all') {
        allQs = getQuestionsByDifficulty(selectedDifficulty);
      } else if (selectedCompany !== 'all') {
        allQs = getQuestionsByCompany(selectedCompany);
      } else if (selectedSubject !== 'all') {
        allQs = getQuestionsBySubject(selectedSubject);
      } else {
        // Load a balanced set of questions from each category
        const behavioralQuestions = getQuestionsByCategory('behavioral');
        const technicalQuestions = getQuestionsByCategory('technical');
        const situationalQuestions = getQuestionsByCategory('situational');
        
        // Take a subset from each category to ensure variety
        allQs = [
          ...behavioralQuestions.slice(0, 15),
          ...technicalQuestions.slice(0, 15),
          ...situationalQuestions.slice(0, 15)
        ];
      }
      
      setQuestions(allQs);
      setFilteredQuestions(allQs);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      filtered = searchQuestions(searchTerm);
    } else {
      // Category filter
      if (selectedCategory !== 'all') {
        filtered = getQuestionsByCategory(selectedCategory);
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
      }

      // Company filter
      if (selectedCompany !== 'all') {
        filtered = filtered.filter((q) => q.companies?.includes(selectedCompany));
      }
      
      // Subject filter
      if (selectedSubject !== 'all') {
        filtered = getQuestionsBySubject(selectedSubject);
        
        // Apply other filters to the subject-filtered questions
        if (selectedCategory !== 'all') {
          filtered = filtered.filter((q) => q.category === selectedCategory);
        }
        if (selectedDifficulty !== 'all') {
          filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
        }
        if (selectedCompany !== 'all') {
          filtered = filtered.filter((q) => q.companies?.includes(selectedCompany));
        }
      }
    }

    setFilteredQuestions(filtered);
  };

  const handleQuestionClick = (question: Question) => {
    navigate(`/practice/${question.id}`);
  };

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const stats = [
    {
      name: 'Total Questions',
      value: questionCount,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: 'Frontend & Backend',
      value: getQuestionsByCategory('technical').length,
      icon: Code,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      name: 'Behavioral',
      value: getQuestionsByCategory('behavioral').length,
      icon: User,
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    },
    {
      name: 'Companies',
      value: companies.length,
      icon: Building2,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  // Get subject icon
  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'frontend':
        return Code;
      case 'backend':
        return Database;
      case 'full stack':
        return Server;
      case 'data structures & algorithms':
        return Target;
      case 'cybersecurity':
        return Shield;
      case 'devops':
        return Server;
      case 'cloud computing':
        return Cloud;
      case 'machine learning':
        return Brain;
      default:
        return Code;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            Interview Practice Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Choose from {questionCount} carefully curated questions from top companies to improve your interview skills
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} transition-colors duration-200 group-hover:scale-110 transform transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Filter Questions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search questions..."
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
              <option value="technical">Technical (Frontend & Backend)</option>
              <option value="situational">Situational</option>
            </select>

            {/* Subject */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Company */}
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedCompany !== 'all' || selectedSubject !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors duration-200">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 transition-colors duration-200">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubject !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 transition-colors duration-200">
                  Subject: {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject('all')}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDifficulty !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 transition-colors duration-200">
                  Difficulty: {selectedDifficulty}
                  <button
                    onClick={() => setSelectedDifficulty('all')}
                    className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCompany !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-200">
                  Company: {selectedCompany}
                  <button
                    onClick={() => setSelectedCompany('all')}
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Showing {Math.min(currentQuestions.length, questionsPerPage)} of {filteredQuestions.length} questions
            {selectedCompany !== 'all' && ` from ${selectedCompany}`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {selectedSubject !== 'all' && ` about ${selectedSubject}`}
            {selectedDifficulty !== 'all' && ` (${selectedDifficulty} difficulty)`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Loading questions...</p>
          </div>
        )}

        {/* Questions Grid */}
        {!loading && filteredQuestions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={handleQuestionClick}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No questions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedCompany('all');
                setSelectedSubject('all');
                loadInitialQuestions();
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

// Redesigned Question Card Component
const QuestionCard: React.FC<{ question: Question; onClick: (question: Question) => void }> = ({ question, onClick }) => {
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
        return Target;
    }
  };

  const CategoryIcon = getCategoryIcon(question.category);

  return (
    <>
      <div 
        onClick={() => onClick(question)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group"
      >
        {/* Top gradient bar based on difficulty */}
        <div className={`h-1.5 w-full ${
          question.difficulty === 'easy' 
            ? 'bg-gradient-to-r from-green-400 to-green-500' 
            : question.difficulty === 'medium'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
              : 'bg-gradient-to-r from-red-400 to-pink-500'
        }`}></div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(question.category).replace('text-', 'text-').replace('bg-', 'bg-')} transition-colors duration-200 group-hover:scale-110 transform`}>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-full transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
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
            <div className="flex flex-wrap gap-1 mb-4">
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
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>~5-10 min</span>
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-105 shadow-sm">
              Start Practice
            </button>
          </div>
        </div>
      </div>

      {/* Company Tags Modal */}
      {showCompanies && question.companies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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