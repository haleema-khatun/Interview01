import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Star, TrendingUp, Target, Zap, Loader, Brain, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TextExtractionService } from '../../services/textExtractionService';
import { ResumeAnalysisService, type ResumeAnalysis } from '../../services/resumeAnalysisService';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const ResumeReview: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

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

    setResumeFile(file);
    setExtractionError(null);
    setExtractedText('');
    
    // Extract text from the uploaded file
    setExtracting(true);
    try {
      console.log('📄 Starting text extraction...');
      const result = await TextExtractionService.extractText(file);
      
      if (result.success && result.text) {
        const cleanedText = TextExtractionService.cleanText(result.text);
        const validation = TextExtractionService.validateText(cleanedText);
        
        setExtractedText(cleanedText);
        
        if (validation.issues.length > 0) {
          console.warn('⚠️ Text validation issues:', validation.issues);
          toast(
            `Text extracted with ${validation.issues.length} potential issue(s). You can still proceed with analysis.`,
            { icon: '⚠️', duration: 5000 }
          );
        } else {
          toast.success('✅ Text extracted successfully from your resume!');
        }
        
        console.log(`✅ Extracted ${cleanedText.length} characters from ${file.name}`);
      } else {
        setExtractionError(result.error || 'Failed to extract text from file');
        toast.error(result.error || 'Failed to extract text from file');
      }
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      setExtractionError('Unexpected error during text extraction');
      toast.error('Failed to extract text from file');
    } finally {
      setExtracting(false);
    }
  };

  const analyzeResume = async () => {
    if (!extractedText.trim()) {
      toast.error('Please upload a resume file first or ensure text was extracted successfully');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Starting resume analysis...');
      console.log(`📊 Analyzing ${extractedText.length} characters of resume text`);
      
      const result = await ResumeAnalysisService.analyzeResume(
        extractedText,
        jobDescription.trim() || undefined
      );
      
      setAnalysis(result);
      
      if (result.aiProvider) {
        toast.success(`✅ Resume analyzed using ${result.aiProvider} AI!`);
      } else {
        toast.success('✅ Resume analysis completed!');
      }
      
      console.log('✅ Resume analysis completed:', result);
    } catch (error) {
      console.error('❌ Resume analysis failed:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  // Check if AI is available
  const availableKeys = AIEvaluationService.hasApiKeys();
  const hasAnyApiKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

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
            <div className="p-2 bg-orange-600 dark:bg-orange-500 rounded-lg transition-colors duration-200">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Resume Review</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Upload your resume for AI-powered analysis and feedback</p>
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
                  <p className="font-medium">🤖 AI Analysis Active</p>
                  <p>
                    Using {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} for intelligent resume analysis with text extraction!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                  <p className="font-medium mb-1">Demo Mode</p>
                  <p>
                    You're seeing a demo analysis. For real AI-powered resume feedback, add your API key in{' '}
                    <button
                      onClick={() => navigate('/settings')}
                      className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium transition-colors duration-200"
                    >
                      Settings
                    </button>
                    . Text extraction from PDF/DOC files works in both modes!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resume Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Upload Resume</h2>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer"
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
                onChange={handleFileUpload}
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
                  
                  {extractedText && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg transition-colors duration-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
                          ✅ Text extracted successfully ({extractedText.length} characters)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {extractionError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800 dark:text-red-200 transition-colors duration-200">
                          <p className="font-medium">Text Extraction Failed</p>
                          <p>{extractionError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Extracted Text Preview */}
            {extractedText && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Extracted Text Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto transition-colors duration-200">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap transition-colors duration-200">
                    {extractedText.substring(0, 500)}
                    {extractedText.length > 500 && '...'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors duration-200">
                  Showing first 500 characters of {extractedText.length} total
                </p>
              </div>
            )}

            {/* Job Description (Optional) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Job Description (Optional)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
                Add a job description to get targeted feedback and keyword analysis
              </p>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here for targeted analysis..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeResume}
              disabled={loading || extracting || !extractedText.trim()}
              className="w-full bg-orange-600 dark:bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 dark:hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Analyze Resume with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {analysis ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Overall Score</h2>
                      {analysis.aiProvider && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium transition-colors duration-200">
                          AI: {analysis.aiProvider}
                        </span>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-lg ${getScoreColor(analysis.overallScore)} transition-colors duration-200`}>
                      {analysis.overallScore}/100
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 transition-colors duration-200">
                      <div 
                        className="bg-[#0FA4AF] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.overallScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      <span>Needs Improvement</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    {analysis.overallScore >= 80 ? 'Excellent resume! Just a few minor improvements needed.' :
                     analysis.overallScore >= 60 ? 'Good resume with room for improvement.' :
                     'Your resume needs significant improvements to stand out.'}
                  </p>
                </div>

                {/* Section Scores */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Section Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysis.sections).map(([section, data]) => {
                      const Icon = getScoreIcon(data.score);
                      return (
                        <div key={section} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white capitalize transition-colors duration-200">
                              {section.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(data.score)} transition-colors duration-200`}>
                              <Icon className="h-3 w-3" />
                              <span>{data.score}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">{data.feedback}</p>
                          <div className="space-y-1">
                            {data.suggestions.slice(0, 2).map((suggestion, index) => (
                              <div key={index} className="text-xs text-gray-500 dark:text-gray-500 flex items-start space-x-1 transition-colors duration-200">
                                <span className="text-orange-500 dark:text-orange-400">•</span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Improvements</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Keywords Analysis */}
                {jobDescription && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Keyword Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 transition-colors duration-200">Found Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keywords.found.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full transition-colors duration-200">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300 mb-2 transition-colors duration-200">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keywords.missing.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full transition-colors duration-200">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-200">Suggestions</h4>
                        <ul className="space-y-1">
                          {analysis.keywords.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-xs text-blue-700 dark:text-blue-300 transition-colors duration-200">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200">
                        <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200">
                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Upload Your Resume</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
                  Upload your resume to get detailed AI-powered feedback and suggestions for improvement.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto transition-colors duration-200">
                  <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                    <strong>✨ Smart Text Extraction:</strong> We automatically extract text from PDF, DOC, and DOCX files for accurate AI analysis!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">What Our Resume Review Analyzes</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Smart Text Extraction</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Automatically extracts text from PDF, DOC, and DOCX files for accurate analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">ATS Compatibility</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Ensures your resume passes through Applicant Tracking Systems
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">AI-Powered Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Uses advanced AI to provide detailed feedback and improvement suggestions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Keyword Matching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Compares your resume against job descriptions for better keyword optimization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};