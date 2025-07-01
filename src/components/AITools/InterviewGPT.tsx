import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bot, Send, User, Loader, Brain, Zap, MessageSquare, Lightbulb, Target, Users, Sparkles, Star, Heart, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export const InterviewGPT: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi there! 👋 I'm your AI interview assistant. I'm here to help you with interview preparation, career advice, and even casual conversation! Whether you want to practice interview questions, discuss career strategies, or just chat about your day, I'm here for you. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Check if we have API keys for real AI conversation
      const availableKeys = AIEvaluationService.hasApiKeys();
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      let response = '';

      if (hasAnyKey) {
        console.log('🤖 Using AI for conversation...');
        
        try {
          // Create a conversation prompt for the AI
          const conversationPrompt = `You are a friendly, helpful AI interview assistant. The user said: "${currentInput}"

Please respond in a conversational, helpful way. You can:
- Help with interview preparation and practice
- Provide career advice and guidance
- Discuss interview strategies and techniques
- Answer questions about job searching
- Have casual, supportive conversations
- Provide encouragement and motivation

Keep your response natural, friendly, and helpful. Use a warm, encouraging tone. If it's interview-related, provide specific, actionable advice. If it's casual conversation, be supportive and engaging.

Respond directly to what the user said without mentioning that this is a prompt or that you're an AI assistant.`;

          response = await AIEvaluationService.generateContentWithBestAvailable(conversationPrompt);
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          console.log(`✅ Response generated using ${aiProvider} AI`);
        } catch (aiError) {
          console.warn('⚠️ AI conversation failed, using enhanced responses:', aiError);
          response = generateEnhancedResponse(currentInput);
        }
      } else {
        console.log('ℹ️ Using enhanced responses (no API keys)');
        response = generateEnhancedResponse(currentInput);
      }

      // Simulate typing effect
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);

    } catch (error) {
      console.error('❌ Conversation failed:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your message. Please try again, and I'll do my best to help you!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEnhancedResponse = (userInput: string): string => {
    const userInputLower = userInput.toLowerCase();

    // Interview-related responses
    if (userInputLower.includes('interview') || userInputLower.includes('question') || userInputLower.includes('practice')) {
      const interviewResponses = [
        "Great! Let's work on your interview skills. For behavioral questions, I always recommend the STAR method (Situation, Task, Action, Result). What specific type of questions would you like to practice? I can help with behavioral, technical, or situational questions.",
        "Interview preparation is so important! Remember, the key is to be authentic while highlighting your strengths. Would you like to practice some common questions, discuss interview strategies, or work on specific areas like salary negotiation?",
        "I love helping with interview prep! One tip: always prepare 2-3 specific examples that showcase different skills. What role are you interviewing for? I can tailor my advice to your specific situation.",
        "Excellent! Interview practice makes perfect. Remember to research the company, prepare thoughtful questions, and practice your elevator pitch. What aspect would you like to focus on first?",
        "Perfect timing for interview prep! The most successful candidates prepare stories that demonstrate their problem-solving skills, leadership abilities, and cultural fit. What's your biggest interview concern right now?"
      ];
      return interviewResponses[Math.floor(Math.random() * interviewResponses.length)];
    }
    
    // Career advice responses
    else if (userInputLower.includes('career') || userInputLower.includes('job') || userInputLower.includes('work')) {
      const careerResponses = [
        "Career development is such an exciting journey! What specific aspect are you thinking about? Whether it's skill development, job searching, networking, or career transitions, I'm here to help you navigate it.",
        "That's a great topic! Career growth often comes from continuous learning, building relationships, and taking calculated risks. What are your current career goals or challenges? I'd love to help you strategize.",
        "I'd love to help with your career questions! Remember, every career path is unique, and what matters most is finding work that aligns with your values and goals. What's your current situation and where would you like to be?",
        "Career planning is so valuable! Whether you're just starting out, looking to make a change, or aiming for advancement, having clear goals and a strategy helps immensely. What's on your mind about your career?",
        "Career conversations are some of my favorites! The job market is constantly evolving, and staying adaptable while building core skills is key. What career challenges or opportunities are you facing?"
      ];
      return careerResponses[Math.floor(Math.random() * careerResponses.length)];
    }
    
    // Technical questions
    else if (userInputLower.includes('technical') || userInputLower.includes('coding') || userInputLower.includes('programming')) {
      const technicalResponses = [
        "Technical interviews can be challenging but rewarding! The key is to think out loud and explain your reasoning. What programming languages or technologies are you working with? I can help you prepare for technical discussions.",
        "Great question! For technical interviews, practice is crucial. I recommend solving problems step by step and explaining your thought process clearly. What specific technical areas would you like to focus on?",
        "Technical skills are so important in today's market! Whether it's algorithms, system design, or specific frameworks, consistent practice and staying current with trends helps. What's your technical background?",
        "I love discussing technical topics! Remember, in technical interviews, it's not just about the right answer but how you approach problems and communicate your thinking. What technical challenges are you facing?",
        "Technical preparation is key! The best approach is to practice coding problems regularly, understand fundamental concepts deeply, and be able to explain your solutions clearly. What technical role are you targeting?"
      ];
      return technicalResponses[Math.floor(Math.random() * technicalResponses.length)];
    }
    
    // Greeting responses
    else if (userInputLower.includes('hello') || userInputLower.includes('hi') || userInputLower.includes('hey')) {
      const greetingResponses = [
        "Hello! 😊 It's great to meet you! I'm here to help with anything from interview prep to career advice, or even just a friendly chat. How are you doing today? What's on your mind?",
        "Hi there! 👋 I'm excited to chat with you! Whether you want to practice interviews, discuss your career, or just talk about your day, I'm all ears. What brings you here today?",
        "Hey! 🌟 Thanks for saying hi! I'm your friendly AI assistant, ready to help with interviews, career questions, or whatever's on your mind. How can I help you today?",
        "Hello! 😄 Nice to see you here! I love helping people with their career journeys and interview preparation, but I'm also happy to just chat! What would you like to talk about?",
        "Hi! 🎉 Welcome! I'm here to support you with interview practice, career guidance, or just friendly conversation. What's going well in your life today?"
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    
    // Casual conversation
    else if (userInputLower.includes('how are you') || userInputLower.includes('what\'s up') || userInputLower.includes('how\'s it going')) {
      const casualResponses = [
        "I'm doing great, thank you for asking! 😊 I love helping people achieve their career goals and prepare for interviews. It's really fulfilling! How are you doing today? What's new with you?",
        "I'm wonderful! 🌟 Every conversation is exciting for me because I get to learn about different people's journeys and help them succeed. What's new with you? How's your day going?",
        "I'm fantastic! 😄 I've been helping lots of people with their interview prep and career questions today. It's amazing to see everyone working toward their goals! How about you? What's happening in your world?",
        "I'm doing really well! 💫 I find so much joy in these conversations and helping people grow professionally. Thanks for asking! What's going on with you today?",
        "I'm excellent! 🚀 I love connecting with people and helping them navigate their career journeys. Every conversation teaches me something new! How are things going for you?"
      ];
      return casualResponses[Math.floor(Math.random() * casualResponses.length)];
    }
    
    // Motivational/encouragement
    else if (userInputLower.includes('nervous') || userInputLower.includes('scared') || userInputLower.includes('worried') || userInputLower.includes('anxious')) {
      const encouragementResponses = [
        "I totally understand those feelings! 💙 Interview nerves are completely normal and actually show that you care. Remember, you've got this! The fact that you're preparing shows you're already on the right track. What specifically is making you feel nervous? Let's work through it together.",
        "Those feelings are so valid! 🤗 Even the most successful people get nervous before interviews. It means you're human! The key is channeling that energy into preparation and confidence. You're stronger than you think! What would help you feel more prepared?",
        "I hear you, and it's okay to feel that way! 💪 Nervousness often comes from the unknown, but preparation is your superpower. You're taking the right steps by practicing. What specific aspects of interviewing worry you most? Let's tackle them one by one.",
        "Thank you for sharing that with me! 🌟 Feeling nervous shows you care about doing well, which is actually a strength. Remember, the interviewer wants you to succeed too. Let's work on building your confidence together! What would be most helpful right now?",
        "I completely understand! 🫂 Interview anxiety is so common, and you're definitely not alone in feeling this way. The good news is that preparation and practice can really help calm those nerves. What specific part of the interview process feels most challenging to you?"
      ];
      return encouragementResponses[Math.floor(Math.random() * encouragementResponses.length)];
    }
    
    // STAR method questions
    else if (userInputLower.includes('star method') || userInputLower.includes('star') || userInputLower.includes('behavioral')) {
      return "Excellent question! The **STAR method** is perfect for behavioral interview questions:\n\n🌟 **S**ituation - Set the context and background\n🎯 **T**ask - Explain what you needed to accomplish\n⚡ **A**ction - Describe the specific steps you took\n📊 **R**esult - Share the outcome and what you learned\n\n**Pro tip**: Prepare 3-5 STAR stories that showcase different skills like leadership, problem-solving, teamwork, and innovation. This way, you can adapt them to various questions!\n\nWould you like to practice crafting a STAR response for a specific situation?";
    }
    
    // General helpful responses
    else {
      const generalResponses = [
        "That's interesting! I'd love to help you with that. Whether it's interview-related, career guidance, or just something you want to discuss, I'm here for you. Can you tell me more about what you're thinking?",
        "Thanks for sharing! I'm here to support you with whatever you need - interview prep, career advice, or just a friendly conversation. What would be most helpful for you right now?",
        "I appreciate you reaching out! I'm designed to help with interview preparation and career guidance, but I also enjoy general conversations. How can I best assist you today?",
        "That's a great point! I'm always excited to help people with their professional development and interview skills, but I'm also here for whatever's on your mind. What's most important to you right now?",
        "I love our conversation! Whether you want to dive deep into interview strategies, discuss career goals, or just chat about life, I'm here for it. What would you like to explore together?",
        "That's really thoughtful! I'm here to help you succeed in your career journey, whether that's through interview practice, career planning, or just being a supportive voice. What's your biggest focus right now?"
      ];
      return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check if AI is available
  const availableKeys = AIEvaluationService.hasApiKeys();
  const hasAnyApiKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent transition-colors duration-200">
                Interview GPT
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-lg">
                Your friendly AI assistant for interviews, career advice, and more! ✨
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
                    🤖 AI Conversation Active
                  </p>
                  <p className="text-green-700 dark:text-green-300 transition-colors duration-200">
                    Enhanced with {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} AI for intelligent, contextual conversations!
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
                    Smart Conversation Mode
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 transition-colors duration-200">
                    You're getting intelligent responses! For AI-powered conversations, add your API key in{' '}
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

        {/* Enhanced Chat Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 h-[700px] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-3xl">
          {/* Enhanced Chat Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-t-3xl transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Interview GPT Assistant
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    {hasAnyApiKey ? 'AI-enhanced conversations' : 'Smart responses'} • Always here to help
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
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
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
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
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="p-6 rounded-3xl rounded-bl-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-b-3xl transition-colors duration-200">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about interviews, career advice, or just say hello! I'm here to help with anything..."
                  rows={2}
                  className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-lg"
                />
                <div className="absolute right-4 top-4 text-gray-400 dark:text-gray-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Send className="h-5 w-5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setInputMessage("Can you help me practice behavioral questions using the STAR method?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 text-lg">
                Practice Behavioral Questions
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Get help with STAR method responses and behavioral interview prep
            </p>
          </button>
          
          <button
            onClick={() => setInputMessage("I'm feeling nervous about my upcoming interview. Any advice?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 text-lg">
                Interview Confidence
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Get support and confidence tips to ace your interview
            </p>
          </button>
          
          <button
            onClick={() => setInputMessage("What are some good questions to ask the interviewer?")}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-left group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 text-lg">
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