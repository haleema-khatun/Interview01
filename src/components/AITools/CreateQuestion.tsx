import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Zap, FileText, User, Briefcase, Upload, Loader, CheckCircle, 
  AlertCircle, Sparkles, Settings, Brain, Target, TrendingUp, Clock, 
  Star, Filter, Search, Copy, Download, Share2, BookOpen, Lightbulb,
  ChevronDown, ChevronUp, RefreshCw, Save, Eye, EyeOff, Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { AIResponseParser } from '../../services/ai/aiResponseParser';
import { TextExtractionService } from '../../services/textExtractionService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface GeneratedQuestion {
  id: string;
  title: string;
  description: string;
  category: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  companies: string[];
  followUpQuestions?: string[];
  tips?: string[];
  estimatedTime?: number;
  successRate?: number;
  industry?: string;
  experienceLevel?: string;
  keywords?: string[];
  sampleAnswer?: string;
  complexity?: number;
  popularity?: number;
}

interface AIQuestionResponse {
  questions: GeneratedQuestion[];
}

interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  tags: string[];
}

interface GenerationHistory {
  id: string;
  timestamp: Date;
  type: string;
  questions: GeneratedQuestion[];
  prompt: string;
}

export const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'job-description' | 'custom' | 'resume' | 'templates' | 'history'>('job-description');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  
  // Advanced Features
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'groq' | 'openai' | 'gemini'>('auto');
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSampleAnswers, setShowSampleAnswers] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Job Description Tab
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  
  // Custom Tab
  const [questionType, setQuestionType] = useState<'behavioral' | 'technical' | 'situational'>('behavioral');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topics, setTopics] = useState('');
  const [specificRequirements, setSpecificRequirements] = useState('');
  const [includeFollowUps, setIncludeFollowUps] = useState(true);
  const [includeTips, setIncludeTips] = useState(true);
  
  // Resume Tab - Enhanced with file upload
  const [resumeInputMode, setResumeInputMode] = useState<'upload' | 'paste'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [extractedResumeText, setExtractedResumeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setResumeFile(file);
    setExtractedResumeText('');
    
    // Extract text from the uploaded file
    setExtracting(true);
    try {
      console.log('📄 Extracting text from resume for question generation...');
      const result = await TextExtractionService.extractText(file);
      
      if (result.success && result.text) {
        const cleanedText = TextExtractionService.cleanText(result.text);
        setExtractedResumeText(cleanedText);
        toast.success('✅ Resume text extracted successfully!');
        console.log(`✅ Extracted ${cleanedText.length} characters from ${file.name}`);
      } else {
        toast.error(result.error || 'Failed to extract text from file');
      }
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      toast.error('Failed to extract text from file');
    } finally {
      setExtracting(false);
    }
  };

  const parseAIResponse = (rawContent: string): AIQuestionResponse => {
    console.log('📝 Parsing AI response for questions:', rawContent);

    // Try to extract JSON from the response using AIResponseParser
    let parsedResponse: AIQuestionResponse;
    try {
      const extractedJson = AIResponseParser.extractPartialJson(rawContent);
      if (!extractedJson) {
        throw new Error('No valid JSON found in AI response');
      }
      parsedResponse = extractedJson as AIQuestionResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', rawContent);
      throw new Error('Invalid response format from AI service. The AI returned malformed JSON.');
    }

    if (!parsedResponse || !parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid question format from AI service. Expected an array of questions.');
    }

    return parsedResponse;
  };

  const buildQuestionGenerationPrompt = (type: 'job-description' | 'custom' | 'resume', data: any): string => {
    let prompt = '';

    if (type === 'job-description') {
      prompt = `Generate ${questionCount} diverse, high-quality interview questions based on this job description.

JOB TITLE: ${data.jobTitle || 'Not specified'}
COMPANY: ${data.companyName || 'Not specified'}
INDUSTRY: ${data.industry || 'Technology'}
EXPERIENCE LEVEL: ${data.experienceLevel || 'Mid-level'}

JOB DESCRIPTION:
${data.jobDescription}

REQUIREMENTS:
- Generate exactly ${questionCount} questions
- Include a balanced mix of behavioral (40%), technical (40%), and situational (20%) questions
- Vary difficulty levels: 30% easy, 40% medium, 30% hard
- Include relevant industry-specific terminology and scenarios
- Add estimated time for each question (2-5 minutes for easy, 5-10 for medium, 10-15 for hard)
- Include success rate estimates based on question complexity
- Add relevant keywords and tags for each question
- Include follow-up questions for deeper exploration
- Provide actionable tips for answering each question
- Consider the company culture and industry standards`;
    } else if (type === 'custom') {
      prompt = `Generate ${questionCount} diverse, high-quality interview questions based on these specifications.

TOPICS: ${data.topics}
QUESTION TYPE: ${data.questionType}
DIFFICULTY: ${data.difficulty}
SPECIFIC REQUIREMENTS: ${data.specificRequirements || 'None specified'}
INCLUDE FOLLOW-UPS: ${includeFollowUps ? 'Yes' : 'No'}
INCLUDE TIPS: ${includeTips ? 'Yes' : 'No'}

REQUIREMENTS:
- Generate exactly ${questionCount} questions
- Focus on the specified question type but include some variety
- Match the specified difficulty level with appropriate complexity
- Include relevant technical concepts and real-world scenarios
- Add estimated time for each question
- Include success rate estimates
- Add relevant keywords and tags
- Provide sample answers for complex questions
- Include industry best practices and current trends`;
    } else if (type === 'resume') {
      prompt = `Generate ${questionCount} diverse, high-quality interview questions based on this resume content.

RESUME CONTENT:
${data.resumeContent}

TARGET ROLE: ${data.targetRole || 'Not specified'}
FOCUS AREAS: ${data.focusAreas || 'Not specified'}

RESUME ANALYSIS:
${data.resumeAnalysis ? JSON.stringify(data.resumeAnalysis) : 'Not available'}

REQUIREMENTS:
- Generate exactly ${questionCount} questions
- Tailor questions to the candidate's specific experience and skills
- Include questions that highlight their achievements and projects
- Address any career transitions or gaps mentioned
- Include questions about their technical stack and tools
- Add questions about their leadership and collaboration experience
- Include industry-specific questions based on their background
- Provide questions that help them showcase their unique value proposition
- Include behavioral questions based on their work history
- Add technical questions relevant to their skill set`;
    }

    return `${prompt}

Respond with ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "title": "Question title",
      "description": "Detailed question description with context and expectations",
      "category": "behavioral|technical|situational",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2", "tag3"],
      "companies": ["Company Name"],
      "followUpQuestions": ["follow up 1", "follow up 2"],
      "tips": ["tip 1", "tip 2"],
      "estimatedTime": 5,
      "successRate": 75,
      "industry": "Technology",
      "experienceLevel": "Mid-level",
      "keywords": ["keyword1", "keyword2"],
      "sampleAnswer": "Brief sample answer structure",
      "complexity": 3,
      "popularity": 85
    }
  ]
}

Make sure to return exactly ${questionCount} questions with diverse categories, appropriate difficulty levels, and rich metadata for enhanced learning experience.`;
  };

  const generateQuestionsFromJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    setLoading(true);
    setGenerationProgress(0);
    setAiInsights('');
    
    try {
      // Check if we have API keys for real AI generation
      const availableKeys = AIEvaluationService.hasApiKeys();
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      if (!hasAnyKey) {
        toast.error('AI service is not available. Please check your API keys configuration.');
        setLoading(false);
        return;
      }

      // Set provider if specified
      if (selectedProvider !== 'auto') {
        AIEvaluationService.forceProvider(selectedProvider);
      }

      setGenerationProgress(20);
      
      const prompt = buildQuestionGenerationPrompt('job-description', {
        jobTitle,
        companyName,
        jobDescription,
        industry,
        experienceLevel
      });

      setGenerationProgress(40);
      
      const rawContent = await AIEvaluationService.generateContentWithBestAvailable(prompt);
      setGenerationProgress(80);
      
      const parsedResponse = parseAIResponse(rawContent);

      // Add IDs and enhance questions with metadata
      const questionsWithIds = parsedResponse.questions.map((q, index) => ({
        ...q,
        id: `jd-${Date.now()}-${index + 1}`,
        estimatedTime: q.estimatedTime || (q.difficulty === 'easy' ? 3 : q.difficulty === 'medium' ? 7 : 12),
        successRate: q.successRate || (q.difficulty === 'easy' ? 85 : q.difficulty === 'medium' ? 65 : 45),
        complexity: q.complexity || (q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3),
        popularity: q.popularity || Math.floor(Math.random() * 30) + 70
      }));

      setGeneratedQuestions(questionsWithIds);
      setGenerationProgress(100);
      
      // Generate AI insights
      generateAIInsights(questionsWithIds, 'job-description');
      
      // Save to history
      const historyEntry: GenerationHistory = {
        id: `history-${Date.now()}`,
        timestamp: new Date(),
        type: 'job-description',
        questions: questionsWithIds,
        prompt: prompt
      };
      setGenerationHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      toast.success(`${questionCount} questions generated successfully!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'AI service is not working. Please try again later or contact support.');
      } else {
        toast.error('AI service is not working. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
      setGenerationProgress(0);
    }
  };

  const generateCustomQuestions = async () => {
    if (!topics.trim()) {
      toast.error('Please specify topics or skills to focus on');
      return;
    }

    setLoading(true);
    try {
      // Check if we have API keys for real AI generation
      const availableKeys = AIEvaluationService.hasApiKeys();
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      if (!hasAnyKey) {
        toast.error('AI service is not available. Please check your API keys configuration.');
        setLoading(false);
        return;
      }

      const prompt = buildQuestionGenerationPrompt('custom', {
        topics,
        questionType,
        difficulty,
        specificRequirements
      });

      const rawContent = await AIEvaluationService.generateContentWithBestAvailable(prompt);
      const parsedResponse = parseAIResponse(rawContent);

      // Add IDs to the questions
      const questionsWithIds = parsedResponse.questions.map((q, index) => ({
        ...q,
        id: `custom-${Date.now()}-${index + 1}`
      }));

      setGeneratedQuestions(questionsWithIds);
      toast.success('5 custom questions generated successfully!');
    } catch (error) {
      console.error('Error generating custom questions:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'AI service is not working. Please try again later or contact support.');
      } else {
        toast.error('AI service is not working. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateResumeBasedQuestions = async () => {
    const resumeContent = resumeInputMode === 'upload' ? extractedResumeText : resumeText;
    
    if (!resumeContent.trim()) {
      toast.error('Please provide resume content by uploading a file or pasting text');
      return;
    }

    setLoading(true);
    try {
      // Check if we have API keys for real AI generation
      const availableKeys = AIEvaluationService.hasApiKeys();
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      if (!hasAnyKey) {
        toast.error('AI service is not available. Please check your API keys configuration.');
        setLoading(false);
        return;
      }

      const prompt = buildQuestionGenerationPrompt('resume', {
        resumeContent,
        targetRole,
        focusAreas
      });

      const rawContent = await AIEvaluationService.generateContentWithBestAvailable(prompt);
      const parsedResponse = parseAIResponse(rawContent);

      // Add IDs to the questions
      const questionsWithIds = parsedResponse.questions.map((q, index) => ({
        ...q,
        id: `resume-${Date.now()}-${index + 1}`
      }));

      setGeneratedQuestions(questionsWithIds);
      toast.success('5 resume-based questions generated successfully!');
    } catch (error) {
      console.error('Error generating resume questions:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'AI service is not working. Please try again later or contact support.');
      } else {
        toast.error('AI service is not working. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (questions: GeneratedQuestion[], type: string) => {
    try {
      const insightsPrompt = `Analyze these ${questions.length} interview questions and provide 2-3 key insights:

QUESTIONS:
${questions.map(q => `- ${q.title} (${q.category}, ${q.difficulty})`).join('\n')}

Provide insights about:
1. Question distribution and balance
2. Difficulty progression
3. Industry relevance
4. Areas for improvement

Keep insights concise and actionable.`;

      const insights = await AIEvaluationService.generateContentWithBestAvailable(insightsPrompt);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const startPracticeWithQuestion = (question: GeneratedQuestion) => {
    // Store the generated question temporarily
    localStorage.setItem('custom_question', JSON.stringify(question));
    navigate(`/practice/custom-${question.id}`);
  };

  const copyQuestionToClipboard = (question: GeneratedQuestion) => {
    const questionText = `${question.title}\n\n${question.description}\n\nCategory: ${question.category}\nDifficulty: ${question.difficulty}\nTags: ${question.tags.join(', ')}`;
    navigator.clipboard.writeText(questionText);
    toast.success('Question copied to clipboard!');
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const exportSelectedQuestions = () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select questions to export');
      return;
    }

    const selectedQuestionsData = generatedQuestions.filter(q => selectedQuestions.includes(q.id));
    const exportData = {
      exportedAt: new Date().toISOString(),
      questions: selectedQuestionsData,
      metadata: {
        totalQuestions: selectedQuestionsData.length,
        categories: [...new Set(selectedQuestionsData.map(q => q.category))],
        difficulties: [...new Set(selectedQuestionsData.map(q => q.difficulty))]
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-questions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Questions exported successfully!');
  };

  const filteredQuestions = generatedQuestions.filter(question => {
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    const matchesSearch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showAdvancedSettings 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Advanced</span>
              </button>
              
              {generatedQuestions.length > 0 && (
                <button
                  onClick={exportSelectedQuestions}
                  disabled={selectedQuestions.length === 0}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Export ({selectedQuestions.length})</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl transition-colors duration-200">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-200">
                AI Question Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 mt-1">
                Generate personalized interview questions using advanced AI - Get {questionCount} questions to choose from!
              </p>
            </div>
          </div>

          {/* Advanced Settings Panel */}
          {showAdvancedSettings && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Advanced Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="auto">Auto (Best Available)</option>
                    <option value="groq">Groq (Fastest)</option>
                    <option value="openai">OpenAI (Most Reliable)</option>
                    <option value="gemini">Gemini (Creative)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider Status
                  </label>
                  <div className="flex space-x-2">
                    {(['groq', 'openai', 'gemini'] as const).map(provider => {
                      const status = AIEvaluationService.getProviderStatus()[provider];
                      return (
                        <div
                          key={provider}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            status.available 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {provider.toUpperCase()}
                        </div>
                      );
                    }                )}

                {activeTab === 'templates' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                        Question Templates
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                        Use pre-built templates to quickly generate questions for common scenarios.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: '1', name: 'Frontend Developer', description: 'React, Vue, Angular, CSS, JavaScript', icon: '💻', category: 'technical', difficulty: 'medium', tags: ['frontend', 'react', 'javascript'] },
                        { id: '2', name: 'Backend Developer', description: 'Node.js, Python, Java, Databases, APIs', icon: '⚙️', category: 'technical', difficulty: 'medium', tags: ['backend', 'nodejs', 'python'] },
                        { id: '3', name: 'Data Scientist', description: 'Machine Learning, Statistics, Python, SQL', icon: '📊', category: 'technical', difficulty: 'hard', tags: ['ml', 'python', 'statistics'] },
                        { id: '4', name: 'Product Manager', description: 'Strategy, User Research, Analytics, Leadership', icon: '📈', category: 'behavioral', difficulty: 'medium', tags: ['product', 'strategy', 'leadership'] },
                        { id: '5', name: 'DevOps Engineer', description: 'CI/CD, Cloud, Infrastructure, Automation', icon: '🚀', category: 'technical', difficulty: 'medium', tags: ['devops', 'cloud', 'automation'] },
                        { id: '6', name: 'UX Designer', description: 'User Research, Prototyping, Design Systems', icon: '🎨', category: 'behavioral', difficulty: 'medium', tags: ['ux', 'design', 'research'] }
                      ].map((template) => (
                        <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200 cursor-pointer">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <button className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                            Use Template
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                        Generation History
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                        View and reuse your previously generated questions.
                      </p>
                    </div>

                    {generationHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No generation history yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Generate some questions to see them here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {generationHistory.map((entry) => (
                          <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                  {entry.type.replace('-', ' ')} Questions
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {entry.questions.length} questions
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                                View Questions
                              </button>
                              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Regenerate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              {/* Enhanced Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <nav className="flex space-x-6 px-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('job-description')}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'job-description'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors duration-200 rounded-t-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Job Description</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'custom'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors duration-200 rounded-t-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Custom Topics</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'resume'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors duration-200 rounded-t-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Resume Based</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'templates'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors duration-200 rounded-t-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Templates</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'history'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors duration-200 rounded-t-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>History</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'job-description' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                        Generate 5 Questions from Job Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                        Paste a job description and we'll generate 5 relevant interview questions based on the requirements.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Job Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g., Senior Frontend Developer"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Company Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g., Google, Microsoft"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Industry (Optional)
                        </label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Education">Education</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Media">Media</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Experience Level (Optional)
                        </label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Level</option>
                          <option value="Entry-level">Entry-level</option>
                          <option value="Mid-level">Mid-level</option>
                          <option value="Senior">Senior</option>
                          <option value="Lead">Lead</option>
                          <option value="Principal">Principal</option>
                          <option value="Manager">Manager</option>
                          <option value="Director">Director</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Job Description *
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-4">
                      {loading && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Loader className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Generating {questionCount} Questions...
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${generationProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            {generationProgress < 30 && 'Analyzing job requirements...'}
                            {generationProgress >= 30 && generationProgress < 60 && 'Generating questions with AI...'}
                            {generationProgress >= 60 && generationProgress < 90 && 'Enhancing with metadata...'}
                            {generationProgress >= 90 && 'Finalizing and optimizing...'}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={generateQuestionsFromJobDescription}
                        disabled={loading || !jobDescription.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Generating {questionCount} Questions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>Generate {questionCount} Questions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'custom' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                        Create 5 Custom Questions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                        Specify topics, skills, or areas you want to practice and we'll generate 5 targeted questions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Question Type
                        </label>
                        <select
                          value={questionType}
                          onChange={(e) => setQuestionType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        >
                          <option value="behavioral">Behavioral</option>
                          <option value="technical">Technical</option>
                          <option value="situational">Situational</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Difficulty Level
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Topics/Skills to Focus On *
                      </label>
                      <input
                        type="text"
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="e.g., React, Node.js, System Design, Leadership"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-200">Separate multiple topics with commas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Specific Requirements (Optional)
                      </label>
                      <textarea
                        value={specificRequirements}
                        onChange={(e) => setSpecificRequirements(e.target.value)}
                        placeholder="Any specific scenarios, constraints, or requirements you want the questions to focus on..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      />
                    </div>

                    {/* Advanced Options */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Advanced Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="includeFollowUps"
                            checked={includeFollowUps}
                            onChange={(e) => setIncludeFollowUps(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="includeFollowUps" className="text-sm text-gray-700 dark:text-gray-300">
                            Include follow-up questions
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="includeTips"
                            checked={includeTips}
                            onChange={(e) => setIncludeTips(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="includeTips" className="text-sm text-gray-700 dark:text-gray-300">
                            Include answering tips
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {loading && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Loader className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Generating {questionCount} Questions...
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${generationProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            {generationProgress < 30 && 'Analyzing requirements...'}
                            {generationProgress >= 30 && generationProgress < 60 && 'Generating questions with AI...'}
                            {generationProgress >= 60 && generationProgress < 90 && 'Enhancing with metadata...'}
                            {generationProgress >= 90 && 'Finalizing and optimizing...'}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={generateCustomQuestions}
                        disabled={loading || !topics.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Generating {questionCount} Questions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>Generate {questionCount} Questions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'resume' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                        Generate 5 Questions from Resume
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                        Upload your resume file or paste content to generate 5 personalized questions based on your experience and skills.
                      </p>
                    </div>

                    {/* Resume Input Mode Toggle */}
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={() => setResumeInputMode('upload')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          resumeInputMode === 'upload'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } transition-colors duration-200`}
                      >
                        Upload File
                      </button>
                      <button
                        onClick={() => setResumeInputMode('paste')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          resumeInputMode === 'paste'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } transition-colors duration-200`}
                      >
                        Paste Text
                      </button>
                    </div>

                    {resumeInputMode === 'upload' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Upload Resume File
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-200" />
                          <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">
                            {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200">
                            Supports PDF, DOC, DOCX, and TXT files
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleResumeFileUpload}
                          className="hidden"
                        />
                        
                        {/* File Status */}
                        {resumeFile && (
                          <div className="mt-4 space-y-2">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-200">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                                  File: {resumeFile.name}
                                </span>
                              </div>
                            </div>
                            
                            {extracting && (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg transition-colors duration-200">
                                <div className="flex items-center space-x-2">
                                  <Loader className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                                    Extracting text from your resume...
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {extractedResumeText && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg transition-colors duration-200">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
                                    ✅ Text extracted successfully ({extractedResumeText.length} characters)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                          Resume Content *
                        </label>
                        <textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste your resume content here (skills, experience, projects, education)..."
                          rows={10}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Target Role (Optional)
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Senior Software Engineer, Product Manager"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Focus Areas (Optional)
                      </label>
                      <input
                        type="text"
                        value={focusAreas}
                        onChange={(e) => setFocusAreas(e.target.value)}
                        placeholder="e.g., leadership experience, technical projects, career transitions"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-4">
                      {loading && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Loader className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Generating {questionCount} Questions...
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${generationProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            {generationProgress < 30 && 'Analyzing resume content...'}
                            {generationProgress >= 30 && generationProgress < 60 && 'Generating questions with AI...'}
                            {generationProgress >= 60 && generationProgress < 90 && 'Enhancing with metadata...'}
                            {generationProgress >= 90 && 'Finalizing and optimizing...'}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={generateResumeBasedQuestions}
                        disabled={loading || extracting || 
                                 (resumeInputMode === 'upload' ? !extractedResumeText.trim() : !resumeText.trim())}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Generating {questionCount} Questions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>Generate {questionCount} Questions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Generated Questions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                  Generated Questions
                </h3>
                {generatedQuestions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSampleAnswers(!showSampleAnswers)}
                      className={`p-1 rounded transition-colors ${
                        showSampleAnswers 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      {showSampleAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>
              
              {generatedQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="relative">
                    <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">
                    {questionCount} AI-generated questions will appear here
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Start by filling out the form on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Insights */}
                  {aiInsights && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          AI Insights
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {aiInsights}
                      </p>
                    </div>
                  )}
                  
                  {/* Success Message */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4 transition-colors duration-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200 transition-colors duration-200">
                        {generatedQuestions.length} questions generated!
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 transition-colors duration-200">
                      Choose the best one to practice with
                    </p>
                  </div>
                  
                  {/* Filter and Search */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="technical">Technical</option>
                        <option value="situational">Situational</option>
                      </select>
                      <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>
                  
                  {/* Questions List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => toggleQuestionSelection(question.id)}
                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                              Q{index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              question.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {question.difficulty}
                            </span>
                            <button
                              onClick={() => copyQuestionToClipboard(question)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm line-clamp-2">
                          {question.title}
                        </h4>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                          {question.description}
                        </p>
                        
                        {/* Question Metadata */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {question.estimatedTime || 5} min
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {question.successRate || 75}% success
                            </span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {question.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Sample Answer (if enabled) */}
                        {showSampleAnswers && question.sampleAnswer && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Answer:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {question.sampleAnswer}
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => startPracticeWithQuestion(question)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-2 px-3 rounded text-sm font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Practice This Question
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Features Notice */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">✨ Enhanced Resume-Based Question Generation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Smart File Upload</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Upload PDF, DOC, or DOCX files and we'll automatically extract text for analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">AI-Powered Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Analyzes your skills, experience, and achievements to create personalized questions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Tailored Questions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Generates questions that highlight your specific background and target role
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};