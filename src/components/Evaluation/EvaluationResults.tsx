import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { EvaluationHistoryService } from '../../services/evaluationHistoryService';
import { EvaluationHeader } from './EvaluationHeader';
import { StatusNotifications } from './StatusNotifications';
import { DetailedBreakdown } from './DetailedBreakdown';
import { Brain, CheckCircle, AlertTriangle, Zap, Loader, MessageSquare, Lightbulb, Target, ArrowRight, Sparkles, Rocket, Award, Star, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const EvaluationResults: React.FC = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [evaluation, setEvaluation] = useState<any>(null);
  const [quickEval, setQuickEval] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [suggestedAnswerExpanded, setSuggestedAnswerExpanded] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [evaluationType, setEvaluationType] = useState<'simple' | 'detailed'>('simple');
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  
  // Check if AI is available
  const availableKeys = AIEvaluationService.hasApiKeys();
  const hasAnyApiKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

  useEffect(() => {
    loadEvaluation();
  }, [responseId]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      
      // Get response data from localStorage
      const responseData = localStorage.getItem('current_response');
      const questionData = localStorage.getItem('current_question');
      
      if (!responseData || !questionData) {
        toast.error('Response data not found');
        navigate('/dashboard');
        return;
      }
      
      const response = JSON.parse(responseData);
      const question = JSON.parse(questionData);
      
      setAnswer(response.answer_text);
      setQuestion(question);
      setEvaluationType(response.evaluation_type || 'simple');
      setSelectedProvider(response.selected_provider || 'auto');
      
      // Generate quick evaluation immediately
      const quickEval = await generateQuickEvaluation(question, response.answer_text, response.rating_mode);
      setQuickEval(quickEval);
      
      // Start background processing for AI evaluation if API keys are available
      if (hasAnyApiKey) {
        setBackgroundProcessing(true);
        generateAIEvaluation(question, response, response.rating_mode, response.evaluation_type || 'simple', response.selected_provider || 'auto');
      }
      
    } catch (error) {
      console.error('Error loading evaluation:', error);
      toast.error('Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  };

  const generateQuickEvaluation = async (question: any, answerText: string, ratingMode: 'tough' | 'lenient' = 'lenient') => {
    try {
      // Generate a quick mock evaluation
      return await AIEvaluationService.mockEvaluation({
        question: question.title + ': ' + question.description,
        answer: answerText,
        ratingMode
      });
    } catch (error) {
      console.error('Error generating quick evaluation:', error);
      return null;
    }
  };

  const generateAIEvaluation = async (
    question: any, 
    response: any, 
    ratingMode: 'tough' | 'lenient',
    evalType: 'simple' | 'detailed' = 'simple',
    provider: 'auto' | 'groq' | 'openai' | 'gemini' = 'auto'
  ) => {
    try {
      // Force the selected provider if not auto
      if (provider !== 'auto') {
        AIEvaluationService.forceProvider(provider);
        console.log(`Forcing provider: ${provider}`);
      } else {
        AIEvaluationService.forceProvider(null);
        console.log('Using auto provider selection');
      }
      
      // Use the best available AI provider
      const aiEvaluation = await AIEvaluationService.evaluateWithBestAvailable({
        question: question.title + ': ' + question.description,
        answer: response.answer_text,
        ratingMode,
        evaluationType: evalType,
        selectedProvider: provider
      });
      
      // Add AI provider info
      const providerStatus = AIEvaluationService.getProviderStatus();
      let actualProvider = 'Unknown';
      
      if (provider !== 'auto') {
        actualProvider = provider;
      } else {
        // Determine which provider was actually used based on availability
        if (providerStatus.groq.available && !providerStatus.groq.failed) {
          actualProvider = 'Groq';
        } else if (providerStatus.openai.available && !providerStatus.openai.failed) {
          actualProvider = 'OpenAI';
        } else if (providerStatus.gemini.available && !providerStatus.gemini.failed) {
          actualProvider = 'Gemini';
        }
      }
      
      aiEvaluation.ai_provider = actualProvider;
      aiEvaluation.evaluation_type = evalType;
      
      setEvaluation(aiEvaluation);
      setBackgroundProcessing(false);
      
      // Save to history if user is logged in
      if (user) {
        try {
          await EvaluationHistoryService.saveEvaluation(
            user.id,
            question.id,
            question.title,
            question.category,
            response.answer_text,
            {
              ...aiEvaluation,
              ai_provider: actualProvider,
              evaluation_type: evalType
            },
            response.response_time_seconds
          );
          console.log('✅ Evaluation saved to database successfully');
        } catch (historyError) {
          console.error('Error saving to history:', historyError);
        }
      }
      
      toast.success(`✅ AI evaluation completed using ${actualProvider}!`);
    } catch (error) {
      console.error('Error generating AI evaluation:', error);
      setBackgroundProcessing(false);
      toast.error('AI evaluation failed. Using enhanced evaluation instead.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-200">Generating evaluation...</p>
        </div>
      </div>
    );
  }

  const currentEval = evaluation || quickEval;

  if (!currentEval) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Evaluation Failed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
            We couldn't generate an evaluation for your answer.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <EvaluationHeader 
          evaluation={evaluation} 
          quickEval={quickEval} 
          question={question}
          hasAnyApiKey={hasAnyApiKey}
        />

        {/* Status Notifications */}
        <StatusNotifications 
          hasAnyApiKey={hasAnyApiKey}
          availableKeys={availableKeys}
          backgroundProcessing={backgroundProcessing}
          selectedProvider={selectedProvider}
        />

        {/* Evaluation Type Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${
            evaluationType === 'detailed' 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
          } transition-colors duration-200`}>
            <Brain className="h-4 w-4 mr-2" />
            {evaluationType === 'detailed' ? 'Detailed Evaluation' : 'Standard Evaluation'}
          </div>
          
          {evaluation && evaluation.ai_provider && (
            <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 transition-colors duration-200">
              <Zap className="h-4 w-4 mr-2" />
              {evaluation.ai_provider} AI
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Overall Evaluation</h2>
            <div className={`px-4 py-2 rounded-full text-xl font-bold ${getScoreColor(currentEval.overall_score)} transition-colors duration-200`}>
              {currentEval.overall_score}/10
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 transition-colors duration-200">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  currentEval.overall_score >= 8 ? 'bg-green-600 dark:bg-green-500' : 
                  currentEval.overall_score >= 6 ? 'bg-yellow-600 dark:bg-yellow-500' : 
                  'bg-red-600 dark:bg-red-500'
                }`}
                style={{ width: `${(currentEval.overall_score / 10) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
              <span>Needs Improvement</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Clarity</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(currentEval.clarity_score)} transition-colors duration-200`}>
                  {currentEval.clarity_score}/10
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">Communication effectiveness</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Relevance</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(currentEval.relevance_score)} transition-colors duration-200`}>
                  {currentEval.relevance_score}/10
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">Addressing the question</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Critical Thinking</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(currentEval.critical_thinking_score)} transition-colors duration-200`}>
                  {currentEval.critical_thinking_score}/10
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">Analytical depth</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Thoroughness</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(currentEval.thoroughness_score)} transition-colors duration-200`}>
                  {currentEval.thoroughness_score}/10
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">Completeness of answer</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Comprehensive Feedback</h3>
            <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
              <p className="mb-4">{currentEval.feedback_text}</p>
              
              <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Analysis Summary:</h4>
                <p className="mb-3">
                  Your response demonstrates {currentEval.overall_score >= 8 ? 'excellent' : currentEval.overall_score >= 6 ? 'good' : 'developing'} interview skills. 
                  {currentEval.overall_score >= 8 
                    ? ' You\'ve provided a well-structured, comprehensive answer that directly addresses the question with specific examples and clear reasoning.' 
                    : currentEval.overall_score >= 6 
                      ? ' Your answer addresses the main points of the question, but could benefit from more specific examples and deeper analysis.' 
                      : ' Your answer shows potential but needs significant improvement in relevance, structure, and depth.'}
                </p>
                
                <p className="mb-3">
                  In terms of communication, your response is {currentEval.clarity_score >= 8 ? 'exceptionally clear' : currentEval.clarity_score >= 6 ? 'generally clear' : 'somewhat unclear'} and 
                  {currentEval.thoroughness_score >= 8 ? ' thoroughly covers all aspects of the question.' : currentEval.thoroughness_score >= 6 ? ' covers most aspects of the question.' : ' lacks comprehensive coverage of the question.'}
                  {currentEval.relevance_score < 6 ? ' The most critical area for improvement is ensuring your answer directly addresses what was asked.' : ''}
                </p>
                
                <p>
                  Your critical thinking skills are {currentEval.critical_thinking_score >= 8 ? 'excellent, showing deep analysis and insightful perspectives.' : currentEval.critical_thinking_score >= 6 ? 'good, showing solid reasoning and analysis.' : 'developing, with opportunities to demonstrate deeper analysis and reasoning.'}
                  {currentEval.overall_score >= 7 
                    ? ' With continued practice and attention to the improvement areas noted below, you\'ll be well-prepared for your interviews.' 
                    : ' Focus on the improvement areas below to significantly strengthen your interview performance.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Strengths</h3>
              <ul className="space-y-2">
                {currentEval.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Areas for Improvement</h3>
              <ul className="space-y-2">
                {currentEval.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Enhanced Response ✨ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                  AI Enhanced Response ✨
                </h3>
              </div>
              <button
                onClick={() => setSuggestedAnswerExpanded(!suggestedAnswerExpanded)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
              >
                <ArrowRight className={`h-5 w-5 transform transition-transform duration-200 ${suggestedAnswerExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200">
              See how an AI-optimized response would address this question with key points and professional structure.
            </p>
          </div>
          
          {suggestedAnswerExpanded && (
            <div className="p-6">
              <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200 border border-purple-100 dark:border-purple-800/30">
                <h4 className="text-base font-medium text-purple-800 dark:text-purple-300 mb-3">Model Answer:</h4>
                <p className="mb-4">{currentEval.suggested_answer}</p>
                
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700/30">
                  <h5 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Why This Works:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="min-w-5 mt-0.5">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-purple-800 dark:text-purple-200">
                        Begins with a clear, direct response to the question
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="min-w-5 mt-0.5">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-purple-800 dark:text-purple-200">
                        Uses specific examples with measurable outcomes
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="min-w-5 mt-0.5">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-purple-800 dark:text-purple-200">
                        Demonstrates both technical knowledge and soft skills
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="min-w-5 mt-0.5">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-purple-800 dark:text-purple-200">
                        Concludes by connecting past experience to future value
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">Key Points You Missed</h4>
                <ul className="space-y-2">
                  {currentEval.key_points_missed.map((point: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="min-w-5 mt-0.5">
                        <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      </div>
                      <div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">{point}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {index === 0 ? 'Including this would strengthen your answer\'s relevance' : 
                           index === 1 ? 'This would demonstrate deeper understanding of the topic' :
                           'Adding this would show comprehensive knowledge'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Learning Opportunity</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Study this model answer to understand how to structure your responses with a clear beginning, detailed middle section with examples, and strong conclusion that ties everything together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Score Breakdown */}
        <DetailedBreakdown 
          evaluation={currentEval} 
          isExpanded={detailsExpanded}
          onToggle={() => setDetailsExpanded(!detailsExpanded)}
        />

        {/* Insights 💪 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                  Insights 💪
                </h3>
              </div>
              <button
                onClick={() => setTipsExpanded(!tipsExpanded)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <ArrowRight className={`h-5 w-5 transform transition-transform duration-200 ${tipsExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200">
              Expert interview tips and strategies to help you improve your performance.
            </p>
          </div>
          
          {tipsExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentEval.interview_tips.map((tip: string, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300 transition-colors duration-200">{tip}</span>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {index === 0 ? 'This technique is used by top performers' : 
                           index === 1 ? 'Hiring managers specifically look for this' :
                           'This approach significantly increases interview success rates'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg border border-green-100 dark:border-green-800/30">
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 text-lg">Pro Tip: STAR Method</h4>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      For behavioral questions, use the STAR method to structure your answers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">S</div>
                          <span className="font-medium text-gray-900 dark:text-white">Situation</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 pl-8">Set the context with a specific challenge or scenario</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">T</div>
                          <span className="font-medium text-gray-900 dark:text-white">Task</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 pl-8">Explain your responsibility or what needed to be done</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">A</div>
                          <span className="font-medium text-gray-900 dark:text-white">Action</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 pl-8">Describe the specific steps you took to address it</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">R</div>
                          <span className="font-medium text-gray-900 dark:text-white">Result</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 pl-8">Share the outcome with quantifiable metrics when possible</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Practice Strategy</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record yourself answering questions and review the recordings to identify areas for improvement in your delivery and body language.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Question Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Before answering, take a moment to identify what the interviewer is really looking for - technical knowledge, problem-solving, or cultural fit.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Mental Preparation</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualize successful interviews before your actual one. This mental rehearsal reduces anxiety and improves performance under pressure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Your Answer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                Your Answer
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed transition-colors duration-200">
              {answer}
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {answer.length} characters • {answer.split(/\s+/).filter(word => word.length > 0).length} words
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/practice/${question.id}`)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
};