import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, Play, RotateCcw, CheckCircle, Send, User, Bot, Loader, Brain, Zap, Sparkles, Target, Star, Heart, ThumbsUp, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface QASession {
  id: string;
  question: string;
  userAnswer: string;
  feedback: string;
  score: number;
  completed: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AskAway: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi there! 👋 I'm your AI interview practice assistant. I'll ask you interview questions and provide detailed feedback on your answers. Ready to start practicing? Click 'Start Practice Session' to begin!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Check if AI is available on component mount
  const [availableKeys, setAvailableKeys] = useState<{groq: boolean, openai: boolean, gemini: boolean}>({
    groq: false,
    openai: false,
    gemini: false
  });

  useEffect(() => {
    checkApiKeys();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkApiKeys = () => {
    const keys = AIEvaluationService.hasApiKeys();
    setAvailableKeys(keys);
    console.log('Available API keys:', keys);
  };

  const sampleQuestions = [
    "Tell me about a challenging project you worked on recently.",
    "How do you handle working under pressure?",
    "Describe a time when you had to learn something new quickly.",
    "What motivates you in your work?",
    "How do you approach problem-solving?",
    "Tell me about a time you had to work with a difficult team member.",
    "What's your greatest professional achievement?",
    "How do you prioritize your tasks when everything seems urgent?",
    "Describe a situation where you had to make a difficult decision.",
    "What do you do when you disagree with your manager?",
    "Tell me about a time you failed at something and what you learned.",
    "How do you stay updated with industry trends?",
    "Describe your ideal work environment.",
    "What are your career goals for the next 5 years?",
    "How do you handle constructive criticism?"
  ];

  const startNewQuestion = () => {
    const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setUserAnswer('');
    setIsAnswering(true);
    setSessionActive(true);

    // Add question to chat
    const questionMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `🎯 **Interview Question:** ${randomQuestion}\n\nTake your time to think about this and provide a detailed answer. Use the STAR method (Situation, Task, Action, Result) if applicable!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, questionMessage]);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setIsLoading(true);
    setIsTyping(true);

    // Add user answer to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userAnswer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Check if we have API keys for real AI evaluation
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      let feedback = '';
      let score = 0;

      if (hasAnyKey) {
        console.log('🤖 Using AI for answer evaluation...');
        
        try {
          // Create a comprehensive evaluation prompt
          const evaluationPrompt = `Evaluate this interview answer:

QUESTION: ${currentQuestion}

ANSWER: ${userAnswer}

Please provide a comprehensive evaluation including:
1. Overall score (1-10)
2. Detailed feedback on strengths and areas for improvement
3. Specific suggestions for using the STAR method
4. Tips for making the answer more compelling

Format your response as a detailed evaluation with clear sections.`;

          const aiResponse = await AIEvaluationService.generateContentWithBestAvailable(evaluationPrompt);
          
          // Parse the AI response to extract score and feedback
          const scoreMatch = aiResponse.match(/(?:score|rating|grade).*?(\d+)/i);
          score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 7;
          
          feedback = `**Score: ${score}/10**\n\n${aiResponse}\n\n💡 **Next Steps:** You can ask for another question, request clarification, or practice a specific type of question!`;
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          toast.success(`✅ Answer evaluated using ${aiProvider} AI!`);
        } catch (aiError) {
          console.warn('⚠️ AI evaluation failed, using enhanced feedback:', aiError);
          const enhancedFeedback = generateEnhancedFeedback(userAnswer, currentQuestion);
          feedback = enhancedFeedback.feedback;
          score = enhancedFeedback.score;
          toast.success('Answer evaluated with enhanced feedback!');
        }
      } else {
        console.log('ℹ️ Using enhanced feedback (no API keys)');
        const enhancedFeedback = generateEnhancedFeedback(userAnswer, currentQuestion);
        feedback = enhancedFeedback.feedback;
        score = enhancedFeedback.score;
        toast.success('Answer evaluated! Add API key in Settings for AI-powered feedback.');
      }

      // Simulate typing effect
      setTimeout(() => {
        setIsTyping(false);
        
        // Add AI feedback to chat
        const feedbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: feedback,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, feedbackMessage]);

        // Save session
        const newSession: QASession = {
          id: Date.now().toString(),
          question: currentQuestion,
          userAnswer: userAnswer,
          feedback: feedback,
          score: score,
          completed: true
        };

        setSessions(prev => [newSession, ...prev]);
        setIsAnswering(false);
        setUserAnswer('');
      }, 1000);

    } catch (error) {
      console.error('❌ Answer evaluation failed:', error);
      toast.error('Failed to evaluate answer. Please try again.');
      
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while evaluating your answer. Please try again or ask for a new question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEnhancedFeedback = (answer: string, question: string): { feedback: string; score: number } => {
    const wordCount = answer.trim().split(/\s+/).length;
    const hasExample = /example|instance|time when|situation|experience/i.test(answer);
    const hasResult = /result|outcome|impact|achieved|accomplished|improved|increased|decreased/i.test(answer);
    const hasSTAR = /situation|task|action|result/i.test(answer);
    const hasQuantifiableResults = /\d+%|\$\d+|increased|decreased|improved|reduced|\d+ people|\d+ projects/i.test(answer);
    
    let score = 6; // Base score
    if (wordCount > 50) score += 1;
    if (wordCount > 100) score += 1;
    if (hasExample) score += 1;
    if (hasResult) score += 1;
    if (hasQuantifiableResults) score += 1;
    
    score = Math.min(10, score);

    const strengths = [];
    const improvements = [];

    if (hasExample) strengths.push('Provided specific examples');
    if (hasResult) strengths.push('Mentioned outcomes and results');
    if (hasSTAR) strengths.push('Used elements of the STAR method');
    if (hasQuantifiableResults) strengths.push('Included quantifiable results');
    if (wordCount > 75) strengths.push('Provided detailed response');

    if (!hasExample) improvements.push('Include specific examples from your experience');
    if (!hasResult) improvements.push('Mention the outcomes and impact of your actions');
    if (!hasSTAR) improvements.push('Consider using the STAR method (Situation, Task, Action, Result)');
    if (!hasQuantifiableResults) improvements.push('Add quantifiable results where possible');
    if (wordCount < 50) improvements.push('Provide more detail in your response');

    const feedback = `**Score: ${score}/10**

**Overall Assessment:**
${score >= 8 ? 'Excellent response! You provided a well-structured answer with good detail.' :
  score >= 6 ? 'Good response with room for improvement. You covered the main points well.' :
  'Your response needs more development. Consider adding more specific examples and details.'}

**Strengths:**
${strengths.map(s => `• ${s}`).join('\n')}

**Areas for Improvement:**
${improvements.map(i => `• ${i}`).join('\n')}

**Tips for Next Time:**
• Use the STAR method for behavioral questions
• Include specific numbers and metrics when possible
• Practice storytelling to make your examples more engaging
• Connect your answer back to the role you're applying for`;

    return { feedback, score };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Check if user wants a new question
    const userInput = inputMessage.toLowerCase();
    if (userInput.includes('new question') || userInput.includes('another question') || userInput.includes('next question')) {
      setTimeout(() => {
        setIsTyping(false);
        startNewQuestion();
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Enhanced AI responses based on message content
    setTimeout(() => {
      setIsTyping(false);
      let response = '';

      if (userInput.includes('help') || userInput.includes('how to')) {
        response = "I'm here to help! Here are some ways I can assist you:\n\n• **Practice Questions**: I can give you random interview questions to practice\n• **Detailed Feedback**: I'll evaluate your answers and provide specific feedback\n• **Interview Tips**: Ask me about interview strategies, STAR method, or specific question types\n• **Question Types**: I can focus on behavioral, technical, or situational questions\n\nWhat would you like to work on?";
      } else if (userInput.includes('star method') || userInput.includes('star')) {
        response = "Great question! The **STAR method** is perfect for behavioral interview questions:\n\n🌟 **S**ituation - Set the context\n🎯 **T**ask - Explain what you needed to accomplish\n⚡ **A**ction - Describe what you did\n📊 **R**esult - Share the outcome\n\n**Example**: 'In my previous role (Situation), I was tasked with improving team productivity (Task). I implemented daily standups and project tracking tools (Action), which increased our delivery speed by 30% (Result).'\n\nWould you like to practice with a behavioral question?";
      } else if (userInput.includes('nervous') || userInput.includes('anxiety') || userInput.includes('scared')) {
        response = "It's completely normal to feel nervous about interviews! 💙 Here are some tips to help:\n\n• **Practice**: The more you practice, the more confident you'll become\n• **Prepare Stories**: Have 3-5 STAR stories ready for different situations\n• **Research**: Know the company and role well\n• **Breathe**: Take deep breaths and speak slowly\n• **Remember**: The interviewer wants you to succeed!\n\nWould you like to practice some questions to build your confidence?";
      } else if (userInput.includes('technical') || userInput.includes('coding')) {
        response = "Technical interviews can be challenging! Here's how to approach them:\n\n• **Think Out Loud**: Explain your thought process\n• **Ask Questions**: Clarify requirements before coding\n• **Start Simple**: Begin with a basic solution, then optimize\n• **Test Your Code**: Walk through examples\n• **Practice**: Use platforms like LeetCode, HackerRank\n\nFor technical questions, focus on problem-solving approach rather than just the final answer. Would you like some technical interview tips?";
      } else if (userInput.includes('behavioral')) {
        response = "Behavioral questions assess how you've handled situations in the past. They usually start with:\n\n• 'Tell me about a time when...'\n• 'Describe a situation where...'\n• 'Give me an example of...'\n\n**Key Tips:**\n• Use the STAR method\n• Choose recent, relevant examples\n• Focus on YOUR actions and contributions\n• Highlight positive outcomes\n• Show what you learned\n\nReady to practice a behavioral question?";
      } else {
        const generalResponses = [
          "That's a great point! I'm here to help you practice and improve your interview skills. What specific area would you like to focus on?",
          "Thanks for sharing! Whether you want to practice questions, get feedback, or discuss interview strategies, I'm here to help. What would be most useful for you?",
          "I appreciate your question! I can help with interview practice, provide feedback on your answers, or discuss specific interview techniques. How can I best support you today?",
          "Interesting! I'm designed to help you ace your interviews through practice and feedback. What type of questions or interview topics would you like to explore?",
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isAnswering && userAnswer.trim()) {
        submitAnswer();
      } else if (!isAnswering && inputMessage.trim()) {
        sendMessage();
      }
    }
  };

  const resetSession = () => {
    setCurrentQuestion('');
    setUserAnswer('');
    setIsAnswering(false);
    setSessionActive(false);
    setSessions([]);
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Session reset! 🔄 I'm ready to help you practice interview questions again. Click 'Start Practice Session' when you're ready!",
        timestamp: new Date()
      }
    ]);
  };

  const hasAnyApiKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-colors duration-200">
                Ask Away
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-lg">
                Interactive Q&A practice with AI-powered feedback ✨
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced AI Status Notice */}
        <div className="mb-6">
          {hasAnyApiKey ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-200 text-lg transition-colors duration-200">
                    🤖 AI Feedback Active
                  </p>
                  <p className="text-green-700 dark:text-green-300 transition-colors duration-200">
                    Using {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} for intelligent answer evaluation and feedback!
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-green-500 dark:text-green-400 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-lg mb-2 transition-colors duration-200">
                    Enhanced Feedback Mode
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 transition-colors duration-200">
                    You're getting smart feedback analysis. For AI-powered evaluation, add your API key in{' '}
                    <button
                      onClick={() => navigate('/settings')}
                      className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium transition-colors duration-200"
                    >
                      Settings
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Main Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 h-[700px] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-3xl">
              {/* Enhanced Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-t-3xl transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                        AI Interview Assistant
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        {hasAnyApiKey ? 'AI-powered feedback' : 'Enhanced feedback'} • Practice & Improve
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!sessionActive && (
                      <button
                        onClick={startNewQuestion}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Practice</span>
                      </button>
                    )}
                    {sessions.length > 0 && (
                      <button
                        onClick={resetSession}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`flex items-start space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`p-3 rounded-2xl flex-shrink-0 shadow-lg transition-all duration-200 hover:scale-105 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className={`p-6 rounded-3xl max-w-3xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="whitespace-pre-wrap text-base leading-relaxed font-medium">{message.content}</div>
                        <div className={`flex items-center justify-between mt-4 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <p className="text-sm font-medium">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.type === 'assistant' && (
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200">
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200">
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start space-x-3 max-w-3xl">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="p-6 rounded-3xl rounded-bl-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {isAnswering ? 'Evaluating your answer...' : 'AI is typing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-b-3xl transition-colors duration-200">
                {isAnswering ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 transition-colors duration-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 transition-colors duration-200">Current Question:</p>
                      </div>
                      <p className="text-sm text-purple-800 dark:text-purple-200 transition-colors duration-200">{currentQuestion}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your detailed answer here... Use the STAR method for behavioral questions!"
                          rows={3}
                          className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-lg"
                        />
                        <div className="absolute right-4 top-4 text-gray-400 dark:text-gray-500">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      </div>
                      <button
                        onClick={submitAnswer}
                        disabled={!userAnswer.trim() || isLoading}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {isLoading ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        <span>{isLoading ? 'Evaluating...' : 'Submit Answer'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      <span>{userAnswer.trim().length} characters • {userAnswer.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                      <div className="flex items-center space-x-2">
                        <Star className="h-3 w-3" />
                        <span>Use STAR method for better answers</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about interview questions, strategies, or request a new practice question..."
                        rows={2}
                        className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-lg"
                      />
                      <div className="absolute right-4 top-4 text-gray-400 dark:text-gray-500">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="h-5 w-5" />
                      <span>Send</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Session History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-8 transition-all duration-200 hover:shadow-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">Practice History</h3>
              </div>
              
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors duration-200" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">No practice sessions yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 transition-colors duration-200">Start practicing to see your progress!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full transition-colors duration-200">
                          Session {sessions.length - index}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          session.score >= 8 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          session.score >= 6 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        } transition-colors duration-200`}>
                          {session.score}/10
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 transition-colors duration-200">
                        {session.question}
                      </h4>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 transition-colors duration-200">
                        {session.userAnswer}
                      </p>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 transition-colors duration-200">
                        {session.feedback.split('\n')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sessions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-200">Average Score</p>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-colors duration-200">
                      {(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length).toFixed(1)}/10
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={startNewQuestion}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play className="h-4 w-4" />
                      <span>New Question</span>
                    </button>
                    
                    <button
                      onClick={resetSession}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setInputMessage("Can you help me practice behavioral questions using the STAR method?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 text-lg">
                Practice Behavioral Questions
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Get help with STAR method responses and behavioral interview prep
            </p>
          </button>
          
          <button
            onClick={() => setInputMessage("I'm feeling nervous about my upcoming interview. Any advice?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 text-lg">
                Interview Confidence
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Get support and confidence tips to ace your interview
            </p>
          </button>
          
          <button
            onClick={() => setInputMessage("What are some good questions to ask the interviewer?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 text-lg">
                Questions to Ask
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Learn what to ask your interviewer to show engagement
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};