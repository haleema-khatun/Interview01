import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Upload, Download, Loader, Zap, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TextExtractionService } from '../../services/textExtractionService';
import { AIEvaluationService } from '../../services/ai/aiEvaluationService';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const CoverLetterGenerator: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [extractedResumeText, setExtractedResumeText] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

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
    setExtractedResumeText('');
    
    // Extract text from the uploaded file
    setExtracting(true);
    try {
      console.log('📄 Extracting text from resume...');
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

  const generateCoverLetter = async () => {
    const resumeContent = activeTab === 'upload' ? extractedResumeText : resumeText;
    
    if (!jobDescription.trim() || !resumeContent.trim()) {
      toast.error('Please provide both job description and resume content');
      return;
    }

    setLoading(true);
    try {
      // Check if we have API keys for real AI generation
      const availableKeys = AIEvaluationService.hasApiKeys();
      const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;

      if (hasAnyKey) {
        console.log('🤖 Using AI to generate cover letter...');
        
        const prompt = `Generate a professional cover letter based on the following information:

COMPANY: ${companyName || 'the company'}
JOB TITLE: ${jobTitle || 'the position'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeContent}

Write a compelling, fully personalized cover letter that is ready to send. The letter must:

Clearly address the specific job title and company name.

Be tailored to the job posting, referencing key responsibilities or required skills.

Highlight relevant accomplishments and experience from the candidate’s resume, especially those that directly align with the job.

Demonstrate genuine enthusiasm and motivation for the position and the company’s mission, products, or industry.

Maintain a professional, articulate, yet conversational tone—engaging without being overly casual.

Be structured as a formal business letter, including:

A header with date, employer’s name, company, and address

A salutation (e.g., "Dear Hiring Manager")

3–4 full paragraphs:

Introduction with role interest and hook

Body paragraphs with relevant experiences and specific examples

Conclusion with a call to action and reiteration of interest

Include knowledge of the company’s values, products, or culture, integrated naturally into the narrative.

Be at least 150 words, ideally between 250–350 words.

Do not use placeholders like [Your Name] or [Company Name]—write the letter as if it is fully complete and ready to be submitted.

Respond with only the final cover letter content—no explanations, no markdown, and no extra commentary.`;

        try {
          // Use AI evaluation service to generate the cover letter
          const response = await AIEvaluationService.evaluateWithBestAvailable({
            question: 'Generate a professional cover letter',
            answer: prompt,
            ratingMode: 'lenient'
          });

          // Extract the cover letter from the AI response
          let coverLetter = '';
          
          // Try to extract from feedback text first (most likely to contain the letter)
          if (response.feedback_text && response.feedback_text.length > 200) {
            coverLetter = response.feedback_text;
          } 
          // If not in feedback, try suggested answer
          else if (response.suggested_answer && response.suggested_answer.length > 200) {
            coverLetter = response.suggested_answer;
          }
          // If still not found, combine strengths and improvements
          else {
            coverLetter = response.strengths.join('\n\n') + '\n\n' + response.improvements.join('\n\n');
          }
          
          // Clean up the cover letter text
          coverLetter = coverLetter
            .replace(/^```/, '')
            .replace(/```$/, '')
            .replace(/^Cover Letter:/, '')
            .replace(/^Here's your cover letter:/, '')
            .trim();
          
          setGeneratedCoverLetter(coverLetter);
          
          const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
          toast.success(`✅ Cover letter generated using ${aiProvider} AI!`);
        } catch (aiError) {
          console.warn('⚠️ AI generation failed:', aiError);
          toast.error('AI generation failed. Please try again or check your API keys.');
          throw new Error('AI cover letter generation failed. Please check your API keys in Settings.');
        }
      } else {
        toast.error('No AI API keys found. Please add your API key in Settings.');
        throw new Error('No AI API keys available. Please add your API key in Settings to generate AI-powered cover letters.');
      }
    } catch (error) {
      console.error('❌ Cover letter generation failed:', error);
      toast.error('Failed to generate cover letter. Please check your API keys in Settings.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCoverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName || jobTitle || 'position'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Cover letter downloaded!');
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
            <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg transition-colors duration-200">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">AI Cover Letter Generator</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Create personalized cover letters using AI and resume analysis</p>
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
                  <p className="font-medium">🤖 AI Generation Active</p>
                  <p>
                    Using {availableKeys.groq ? 'Groq (Fastest)' : availableKeys.openai ? 'OpenAI' : 'Gemini'} for intelligent cover letter generation with resume analysis!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 transition-colors duration-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                  <p className="font-medium mb-1">AI Generation Unavailable</p>
                  <p>
                    You need to add an API key to generate AI-powered cover letters. Please add your API key in{' '}
                    <button
                      onClick={() => navigate('/settings')}
                      className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium transition-colors duration-200"
                    >
                      Settings
                    </button>
                    . Resume text extraction still works without an API key!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Job Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Microsoft, Amazon"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Resume Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Your Resume</h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } transition-colors duration-200`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'paste'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } transition-colors duration-200`}
                >
                  Paste Text
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors cursor-pointer"
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
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCoverLetter}
              disabled={loading || extracting || !jobDescription.trim() || 
                       (activeTab === 'upload' ? !extractedResumeText.trim() : !resumeText.trim()) || !hasAnyApiKey}
              className="w-full bg-green-600 dark:bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Generating Cover Letter...</span>
                </>
              ) : (
                <>
                  {hasAnyApiKey ? <Brain className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  <span>{hasAnyApiKey ? 'Generate with AI' : 'Add API Key to Generate'}</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Generated Cover Letter</h2>
              {generatedCoverLetter && (
                <button
                  onClick={downloadCoverLetter}
                  className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>

            {generatedCoverLetter ? (
              <div className="space-y-4">
                <textarea
                  value={generatedCoverLetter}
                  onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors duration-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                      <p className="font-medium mb-1">💡 Tips for your cover letter:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Review and customize the content to match your voice</li>
                        <li>• Add specific examples from your background</li>
                        <li>• Research the company culture and values</li>
                        <li>• Keep it concise and focused (1 page max)</li>
                        <li>• Proofread for grammar and spelling</li>
                        <li>• Replace [Your Name] with your actual name</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                <p className="text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-200">
                  Your generated cover letter will appear here
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">
                  {hasAnyApiKey ? 'AI-powered generation with resume analysis' : 'Add an API key in Settings to enable AI generation'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Why Use Our AI Cover Letter Generator?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">AI-Powered Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Advanced AI analyzes your resume and job descriptions to create perfectly tailored content
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Smart Text Extraction</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Automatically extracts and analyzes text from PDF, DOC, and DOCX resume files
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-3 transition-colors duration-200">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Professional Quality</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Generates professional, well-structured cover letters that highlight your best qualifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};