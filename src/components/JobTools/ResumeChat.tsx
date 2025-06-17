import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Send, User, Bot, Loader, Brain, AlertCircle, Zap, MessageSquare, Briefcase, GraduationCap, Code, Award, Download, Copy, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TextExtractionService } from '../../services/textExtractionService';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResumeData {
  text: string;
  fileName?: string;
  uploadDate?: Date;
}

export const ResumeChat: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resumeAnalyzed, setResumeAnalyzed] = useState(false);
  
  // Check if AI is available
  const availableKeys = AIEvaluationService.hasApiKeys();
  const hasAnyApiKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

  // Load saved resume and chat history from localStorage on component mount
  useEffect(() => {
    const savedResumeData = localStorage.getItem('resume_chat_data');
    const savedMessages = localStorage.getItem('resume_chat_messages');
    
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        setResumeData(parsedData);
        setResumeAnalyzed(true);
      } catch (error) {
        console.error('Failed to parse saved resume data:', error);
      }
    }
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    } else {
      // Set welcome message if no saved messages
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: "👋 Welcome to Resume Chat! Upload your resume, and I'll help you prepare for interviews, improve your resume, and provide career advice based on your experience and skills.",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('resume_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!supportedTypes.includes(file.type) && 
        !file.name.toLowerCase().match(/\.(pdf|doc|docx|txt)$/)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    setExtracting(true);
    
    // Add a message about processing the resume
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I'm processing your resume: ${file.name}. This will just take a moment...`,
      timestamp: new Date()
    }]);
    
    try {
      console.log('📄 Extracting text from resume...');
      const result = await TextExtractionService.extractText(file);
      
      if (result.success && result.text) {
        const cleanedText = TextExtractionService.cleanText(result.text);
        
        // Save resume data
        const newResumeData = {
          text: cleanedText,
          fileName: file.name,
          uploadDate: new Date()
        };
        
        setResumeData(newResumeData);
        localStorage.setItem('resume_chat_data', JSON.stringify(newResumeData));
        
        // Analyze the resume with AI
        await analyzeResume(cleanedText);
        
      } else {
        toast.error(result.error || 'Failed to extract text from file');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I had trouble reading that file. ${result.error || 'Please try a different format or paste the text manually.'}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      toast.error('Failed to extract text from file');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I encountered an error processing your resume. Please try a different file format or paste your resume text directly.",
        timestamp: new Date()
      }]);
    } finally {
      setExtracting(false);
    }
  };

  const analyzeResume = async (resumeText: string) => {
    if (!resumeText || resumeText.length < 100) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: "The resume text seems too short or couldn't be properly extracted. Please try uploading a different file or format.",
        timestamp: new Date()
      }]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if we have API keys for real AI analysis
      if (hasAnyApiKey) {
        console.log('🤖 Using AI for resume analysis...');
        
        // Create a prompt for initial resume analysis
        const prompt = `Analyze this resume and provide a brief summary:

RESUME TEXT:
${resumeText.substring(0, 4000)} ${resumeText.length > 4000 ? '... (truncated)' : ''}

Please provide:
1. A brief summary of the candidate's experience and skills
2. Identify their approximate years of experience
3. List their key technical skills
4. Identify their most recent role and company

Keep your response conversational, friendly, and concise (max 150 words).`;

        try {
          // Use AI evaluation service for analysis
          const response = await AIEvaluationService.evaluateWithBestAvailable({
            question: 'Analyze this resume',
            answer: prompt,
            ratingMode: 'lenient'
          });

          // Extract analysis from the AI response
          let analysis = '';
          
          // Try to extract from feedback text first
          if (response.feedback_text && response.feedback_text.length > 50) {
            analysis = response.feedback_text;
          } 
          // If not in feedback, try suggested answer
          else if (response.suggested_answer && response.suggested_answer.length > 50) {
            analysis = response.suggested_answer;
          }
          // If still not found, use strengths
          else if (response.strengths && response.strengths.length > 0) {
            analysis = "Based on your resume, here's what I found:\n\n" + response.strengths.join('\n\n');
          }
          
          // Clean up the analysis text
          analysis = analysis
            .replace(/^```/, '')
            .replace(/```$/, '')
            .replace(/^Analysis:/, '')
            .replace(/^Resume Analysis:/, '')
            .trim();
          
          // Add the analysis as a message
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Thanks for sharing your resume! ${analysis}\n\nI can help you prepare for interviews by generating practice questions, provide feedback on your resume, or offer career advice. What would you like to focus on?`,
            timestamp: new Date()
          }]);
          
          setResumeAnalyzed(true);
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          console.log(`✅ Resume analyzed using ${aiProvider} AI`);
        } catch (aiError) {
          console.warn('⚠️ AI analysis failed:', aiError);
          
          // Fallback message
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Thanks for sharing your resume! I see you have experience and skills that we can discuss. I can help you prepare for interviews by generating practice questions, provide feedback on your resume, or offer career advice. What would you like to focus on?`,
            timestamp: new Date()
          }]);
          
          setResumeAnalyzed(true);
        }
      } else {
        console.log('ℹ️ No API keys available, using standard response');
        
        // Standard response without AI
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Thanks for sharing your resume! I can help you prepare for interviews by generating practice questions, provide feedback on your resume, or offer career advice. What would you like to focus on?`,
          timestamp: new Date()
        }]);
        
        setResumeAnalyzed(true);
      }
    } catch (error) {
      console.error('❌ Resume analysis failed:', error);
      
      // Error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I've received your resume, but encountered an issue analyzing it. I can still help you with interview preparation, resume feedback, or career advice. What would you like to discuss?",
        timestamp: new Date()
      }]);
      
      setResumeAnalyzed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message
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
      // Check if resume is uploaded
      if (!resumeData) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "I don't have your resume yet. Please upload your resume first so I can provide personalized assistance.",
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }
      
      // Check if we have API keys for real AI conversation
      if (hasAnyApiKey) {
        console.log('🤖 Using AI for resume chat...');
        
        // Create a prompt for the AI
        const prompt = `You are a helpful AI assistant specializing in resume review, interview preparation, and career advice. The user has uploaded their resume, and you're having a conversation about it.

RESUME TEXT:
${resumeData.text.substring(0, 4000)} ${resumeData.text.length > 4000 ? '... (truncated)' : ''}

CONVERSATION HISTORY:
${messages.slice(-6).map(msg => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n\n')}

USER'S NEW QUESTION:
${currentInput}

Please provide a helpful, informative response that:
1. Directly addresses the user's question
2. References specific information from their resume when relevant
3. Provides actionable advice or insights
4. Is conversational and engaging
5. Is concise but thorough (max 250 words)

If the user asks about interview preparation, resume improvements, job search strategies, or career advice, provide specific, tailored guidance based on their resume.`;

        try {
          // Use AI evaluation service for the conversation
          const response = await AIEvaluationService.evaluateWithBestAvailable({
            question: 'Resume chat conversation',
            answer: prompt,
            ratingMode: 'lenient'
          });

          // Extract response from the AI
          let aiResponse = '';
          
          // Try to extract from feedback text first
          if (response.feedback_text && response.feedback_text.length > 50) {
            aiResponse = response.feedback_text;
          } 
          // If not in feedback, try suggested answer
          else if (response.suggested_answer && response.suggested_answer.length > 50) {
            aiResponse = response.suggested_answer;
          }
          // If still not found, use strengths
          else if (response.strengths && response.strengths.length > 0) {
            aiResponse = response.strengths.join('\n\n');
          }
          
          // Clean up the response text
          aiResponse = aiResponse
            .replace(/^```/, '')
            .replace(/```$/, '')
            .replace(/^ASSISTANT:/, '')
            .trim();
          
          // Add the AI response as a message
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }]);
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          console.log(`✅ Response generated using ${aiProvider} AI`);
        } catch (aiError) {
          console.warn('⚠️ AI conversation failed:', aiError);
          handleFallbackResponse(currentInput);
        }
      } else {
        console.log('ℹ️ No API keys available, using fallback responses');
        handleFallbackResponse(currentInput);
      }
    } catch (error) {
      console.error('❌ Message handling failed:', error);
      
      // Error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again or ask a different question.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackResponse = (userInput: string) => {
    const userInputLower = userInput.toLowerCase();
    let response = '';
    
    // Generate contextual responses based on user input
    if (userInputLower.includes('interview') || userInputLower.includes('question')) {
      response = "Based on your resume, I'd recommend preparing for questions about your experience with project management and technical skills. Practice explaining your achievements with specific metrics and outcomes. Would you like me to suggest some practice questions tailored to your background?";
    } 
    else if (userInputLower.includes('improve') || userInputLower.includes('feedback') || userInputLower.includes('resume')) {
      response = "Looking at your resume, I'd suggest highlighting your achievements with more quantifiable results. Consider using stronger action verbs and ensuring your most relevant skills are prominently featured. Would you like specific suggestions for any section of your resume?";
    }
    else if (userInputLower.includes('job') || userInputLower.includes('career') || userInputLower.includes('advice')) {
      response = "Based on your experience, you might consider roles that leverage your technical skills and project management experience. The job market is strong for professionals with your background. Would you like advice on particular industries or roles that might be a good fit?";
    }
    else if (userInputLower.includes('skill') || userInputLower.includes('technology') || userInputLower.includes('learn')) {
      response = "From your resume, I can see you have experience with several key technologies. To stay competitive, you might consider strengthening your skills in cloud technologies and data analysis, which complement your existing expertise. Is there a particular skill area you're interested in developing?";
    }
    else {
      response = "I'd be happy to help with that based on your resume. I can provide interview preparation, resume feedback, or career advice tailored to your background and experience. What specific aspect would you like to focus on?";
    }
    
    // Add the fallback response as a message
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      // Keep the resume data but clear messages
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: resumeData 
            ? "I've cleared our chat history, but I still have your resume. What would you like to discuss about it?" 
            : "I've cleared our chat history. Please upload your resume to get started.",
          timestamp: new Date()
        }
      ]);
      
      // Update localStorage
      localStorage.setItem('resume_chat_messages', JSON.stringify([]));
      toast.success('Chat history cleared');
    }
  };

  const clearResume = () => {
    if (window.confirm('Are you sure you want to remove your resume? This will also clear the chat history.')) {
      // Clear resume data and messages
      setResumeData(null);
      setResumeAnalyzed(false);
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: "👋 Welcome to Resume Chat! Upload your resume, and I'll help you prepare for interviews, improve your resume, and provide career advice based on your experience and skills.",
          timestamp: new Date()
        }
      ]);
      
      // Update localStorage
      localStorage.removeItem('resume_chat_data');
      localStorage.removeItem('resume_chat_messages');
      toast.success('Resume and chat history cleared');
    }
  };

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
            <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg transition-colors duration-200">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Resume Chat</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Chat with your resume for personalized interview preparation and career advice</p>
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
                  <p className="font-medium">🤖 AI Chat Active</p>
                  <p>
                    Using {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} for intelligent resume analysis and personalized responses!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                  <p className="font-medium mb-1">AI Chat Unavailable</p>
                  <p>
                    You need to add an API key for AI-powered resume chat. Please add your API key in{' '}
                    <button
                      onClick={() => navigate('/settings')}
                      className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium transition-colors duration-200"
                    >
                      Settings
                    </button>
                    . Basic resume extraction still works without an API key.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resume Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resume Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Your Resume</h2>
              
              {resumeData ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200 transition-colors duration-200">
                          Resume Uploaded
                        </span>
                      </div>
                      <button
                        onClick={clearResume}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {resumeData.fileName && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1 transition-colors duration-200">
                        {resumeData.fileName}
                      </p>
                    )}
                    
                    {resumeData.uploadDate && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1 transition-colors duration-200">
                        Uploaded: {resumeData.uploadDate.toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Resume Preview:</p>
                    {resumeData.text.substring(0, 300)}...
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3 transition-colors duration-200" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">
                    Click to upload your resume
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-200">
                    Supports PDF, DOC, DOCX, and TXT files
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {!resumeData && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-4 bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Resume</span>
                </button>
              )}
            </div>

            {/* Chat Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">Chat Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={clearChat}
                  disabled={messages.length <= 1}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Chat History</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span>{resumeData ? 'Upload New Resume' : 'Upload Resume'}</span>
                </button>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">Suggested Questions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setInputMessage("What are my strongest skills based on my resume?")}
                  disabled={!resumeData}
                  className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  What are my strongest skills based on my resume?
                </button>
                
                <button
                  onClick={() => setInputMessage("Generate 3 behavioral interview questions based on my experience")}
                  disabled={!resumeData}
                  className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate 3 behavioral interview questions based on my experience
                </button>
                
                <button
                  onClick={() => setInputMessage("How can I improve my resume to stand out more?")}
                  disabled={!resumeData}
                  className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  How can I improve my resume to stand out more?
                </button>
                
                <button
                  onClick={() => setInputMessage("What career paths would be a good fit for me based on my background?")}
                  disabled={!resumeData}
                  className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  What career paths would be a good fit for me?
                </button>
                
                <button
                  onClick={() => setInputMessage("Help me prepare for a technical interview based on my skills")}
                  disabled={!resumeData}
                  className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Help me prepare for a technical interview
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[700px] flex flex-col transition-colors duration-200">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-xl transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg transition-colors duration-200">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">Resume Chat Assistant</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        {hasAnyApiKey ? 'AI-powered resume analysis' : 'Resume analysis'} • Interview prep • Career advice
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resumeData ? (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs transition-colors duration-200">
                        <CheckCircle className="h-3 w-3" />
                        <span>Resume Loaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs transition-colors duration-200">
                        <AlertCircle className="h-3 w-3" />
                        <span>No Resume</span>
                      </div>
                    )}
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
                      <div className={`p-2 rounded-full flex-shrink-0 ${message.type === 'user' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-purple-600 dark:bg-purple-500'} transition-colors duration-200`}>
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
                      <div className="p-2 rounded-full bg-purple-600 dark:bg-purple-500 transition-colors duration-200">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="p-4 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750 rounded-b-xl transition-colors duration-200">
                <div className="flex space-x-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={resumeData ? "Ask about your resume, interview prep, or career advice..." : "Upload your resume to get started..."}
                    rows={2}
                    disabled={!resumeData || extracting}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading || !resumeData || extracting || !hasAnyApiKey}
                    className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </div>
                
                {!hasAnyApiKey && (
                  <div className="mt-2 text-xs text-center text-yellow-600 dark:text-yellow-400">
                    <span>Add an API key in </span>
                    <button
                      onClick={() => navigate('/settings')}
                      className="underline font-medium"
                    >
                      Settings
                    </button>
                    <span> to enable AI-powered chat</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">How Resume Chat Helps You</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Interactive Chat</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Have natural conversations about your resume, career goals, and interview preparation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Career Insights</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Get personalized career advice and job recommendations based on your experience
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Interview Prep</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Practice with tailored interview questions specific to your background and skills
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Resume Feedback</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Receive actionable suggestions to improve your resume and highlight your strengths
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};