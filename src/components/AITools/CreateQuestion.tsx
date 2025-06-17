import React, { useState, useRef } from 'react';
import { ArrowLeft, Zap, FileText, User, Briefcase, Upload, Loader, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
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
}

interface AIQuestionResponse {
  questions: GeneratedQuestion[];
}

export const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'job-description' | 'custom' | 'resume'>('job-description');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  
  // Job Description Tab
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Custom Tab
  const [questionType, setQuestionType] = useState<'behavioral' | 'technical' | 'situational'>('behavioral');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topics, setTopics] = useState('');
  const [specificRequirements, setSpecificRequirements] = useState('');
  
  // Resume Tab - Enhanced with file upload
  const [resumeInputMode, setResumeInputMode] = useState<'upload' | 'paste'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [extractedResumeText, setExtractedResumeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [focusAreas, setFocusAreas] = useState('');

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
      prompt = `Generate 5 diverse interview questions based on this job description.

JOB TITLE: ${data.jobTitle || 'Not specified'}
COMPANY: ${data.companyName || 'Not specified'}

JOB DESCRIPTION:
${data.jobDescription}

Generate 5 questions that would be relevant for this specific role. Include a mix of behavioral, technical, and situational questions based on the requirements mentioned.`;
    } else if (type === 'custom') {
      prompt = `Generate 5 diverse interview questions based on these specifications.

TOPICS: ${data.topics}
QUESTION TYPE: ${data.questionType}
DIFFICULTY: ${data.difficulty}
SPECIFIC REQUIREMENTS: ${data.specificRequirements || 'None specified'}

Generate 5 diverse questions that would be relevant for these topics and requirements.`;
    } else if (type === 'resume') {
      prompt = `Generate 5 diverse interview questions based on this resume content.

RESUME CONTENT:
${data.resumeContent}

TARGET ROLE: ${data.targetRole || 'Not specified'}
FOCUS AREAS: ${data.focusAreas || 'Not specified'}

Generate 5 diverse questions that would be relevant for this candidate's background and target role.`;
    }

    return `${prompt}

Respond with ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "title": "Question title",
      "description": "Detailed question description",
      "category": "behavioral|technical|situational",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2", "tag3"],
      "companies": ["Company Name"],
      "followUpQuestions": ["follow up 1", "follow up 2"],
      "tips": ["tip 1", "tip 2"]
    }
  ]
}

Make sure to return exactly 5 questions with diverse categories and appropriate difficulty levels.`;
  };

  const generateQuestionsFromJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
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

      const prompt = buildQuestionGenerationPrompt('job-description', {
        jobTitle,
        companyName,
        jobDescription
      });

      const rawContent = await AIEvaluationService.generateContentWithBestAvailable(prompt);
      const parsedResponse = parseAIResponse(rawContent);

      // Add IDs to the questions
      const questionsWithIds = parsedResponse.questions.map((q, index) => ({
        ...q,
        id: `jd-${Date.now()}-${index + 1}`
      }));

      setGeneratedQuestions(questionsWithIds);
      toast.success('5 questions generated successfully!');
    } catch (error) {
      console.error('Error generating questions:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'AI service is not working. Please try again later or contact support.');
      } else {
        toast.error('AI service is not working. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
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

  const startPracticeWithQuestion = (question: GeneratedQuestion) => {
    // Store the generated question temporarily
    localStorage.setItem('custom_question', JSON.stringify(question));
    navigate(`/practice/custom-${question.id}`);
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
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg transition-colors duration-200">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Create Custom Questions with AI</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Generate personalized interview questions using AI - Get 5 questions to choose from!</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('job-description')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'job-description'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Job Description</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'custom'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Custom Topics</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'resume'
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Resume Based</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <button
                      onClick={generateQuestionsFromJobDescription}
                      disabled={loading || !jobDescription.trim()}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Generating 5 Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Generate 5 Questions</span>
                        </>
                      )}
                    </button>
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

                    <button
                      onClick={generateCustomQuestions}
                      disabled={loading || !topics.trim()}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Generating 5 Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Generate 5 Questions</span>
                        </>
                      )}
                    </button>
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

                    <button
                      onClick={generateResumeBasedQuestions}
                      disabled={loading || extracting || 
                               (resumeInputMode === 'upload' ? !extractedResumeText.trim() : !resumeText.trim())}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Generating 5 Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Generate 5 Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Questions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Generated Questions</h3>
              
              {generatedQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">
                    5 AI-generated questions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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
                  
                  {generatedQuestions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded transition-colors duration-200">
                          Question {index + 1}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        } transition-colors duration-200`}>
                          {question.difficulty}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm line-clamp-2 transition-colors duration-200">
                        {question.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 transition-colors duration-200">
                        {question.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {question.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded transition-colors duration-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => startPracticeWithQuestion(question)}
                        className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                      >
                        Practice This Question
                      </button>
                    </div>
                  ))}
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