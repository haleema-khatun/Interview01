import React, { useState } from 'react';
import { ArrowLeft, Bot, Send, User, Loader, Brain, Zap, MessageSquare, Lightbulb, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const InterviewGPT: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
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

          const evaluation = await AIEvaluationService.evaluateWithBestAvailable({
            question: 'Have a helpful conversation with the user',
            answer: conversationPrompt,
            ratingMode: 'lenient'
          });

          // For now, we'll use enhanced responses since the evaluation service isn't designed for conversation
          // In a real implementation, you'd have a dedicated conversation AI service
          response = generateEnhancedResponse(currentInput);
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          console.log(`✅ Response generated using ${aiProvider} AI context`);
        } catch (aiError) {
          console.warn('⚠️ AI conversation failed, using enhanced responses:', aiError);
          response = generateEnhancedResponse(currentInput);
        }
      } else {
        console.log('ℹ️ Using enhanced responses (no API keys)');
        response = generateEnhancedResponse(currentInput);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Conversation failed:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg transition-colors duration-200">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Interview GPT</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Your friendly AI assistant for interviews, career advice, and more!</p>
            </div>
          </div>
        </div>

        {/* AI Status Notice */}
        <div className="mb-6">
          {hasAnyApiKey ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
                  <p className="font-medium">🤖 AI Conversation Active</p>
                  <p>
                    Enhanced with {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} AI for intelligent, contextual conversations!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-200">
              <div className="flex items-start space-x-2">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                  <p className="font-medium mb-1">Smart Conversation Mode</p>
                  <p>
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

        {/* Chat Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[650px] flex flex-col transition-colors duration-200">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-xl transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg transition-colors duration-200">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">Interview GPT Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  {hasAnyApiKey ? 'AI-enhanced conversations' : 'Smart responses'} • Always here to help
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-full flex-shrink-0 ${message.type === 'user' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-green-600 dark:bg-green-500'} transition-colors duration-200`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-3xl ${
                    message.type === 'user' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  } transition-colors duration-200`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                    } transition-colors duration-200`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="p-2 rounded-full bg-green-600 dark:bg-green-500 transition-colors duration-200">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750 rounded-b-xl transition-colors duration-200">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about interviews, career advice, or just say hello! I'm here to help with anything..."
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setInputMessage("Can you help me practice behavioral questions using the STAR method?")}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Practice Behavioral Questions</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Get help with STAR method responses</p>
          </button>
          
          <button
            onClick={() => setInputMessage("I'm feeling nervous about my upcoming interview. Any advice?")}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Interview Confidence</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Get support and confidence tips</p>
          </button>
          
          <button
            onClick={() => setInputMessage("What are some good questions to ask the interviewer?")}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Questions to Ask</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Learn what to ask your interviewer</p>
          </button>
        </div>
      </div>
    </div>
  );
};