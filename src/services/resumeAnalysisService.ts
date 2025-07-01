import { AIEvaluationService } from './aiEvaluationService';
import { extractKeywordsFromJD } from './keywordUtils';

export interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contact: { score: number; feedback: string; suggestions: string[] };
    summary: { score: number; feedback: string; suggestions: string[] };
    experience: { score: number; feedback: string; suggestions: string[] };
    skills: { score: number; feedback: string; suggestions: string[] };
    education: { score: number; feedback: string; suggestions: string[] };
    formatting: { score: number; feedback: string; suggestions: string[] };
  };
  strengths: string[];
  improvements: string[];
  keywords: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
  recommendations: string[];
  aiProvider?: string;
  aiSections?: {
    strengths?: string;
    missing?: string;
    suggestions?: string;
    score?: string;
  };
  extractedKeywords?: string[];
}

export class ResumeAnalysisService {
  static async analyzeResume(resumeText: string, jobDescription?: string): Promise<ResumeAnalysis> {
    const extractedKeywords = jobDescription ? extractKeywordsFromJD(jobDescription) : [];
    const availableKeys = AIEvaluationService.hasApiKeys();
    const hasAnyKey = availableKeys.groq || availableKeys.openai || availableKeys.gemini;
    
    if (hasAnyKey && resumeText.trim().length > 100) {
      try {
        console.log('🤖 Using AI for resume analysis...');
        return await this.analyzeWithAI(resumeText, jobDescription, extractedKeywords);
      } catch (error) {
        console.warn('⚠️ AI analysis failed, falling back to mock analysis:', error);
        return this.generateMockAnalysis(resumeText, jobDescription);
      }
    } else {
      console.log('ℹ️ Using mock analysis (no API keys or insufficient text)');
      return this.generateMockAnalysis(resumeText, jobDescription);
    }
  }

  private static async analyzeWithAI(resumeText: string, jobDescription?: string, extractedKeywords: string[] = []): Promise<ResumeAnalysis> {
    const prompt = this.buildAnalysisPrompt(resumeText, jobDescription, extractedKeywords);
    try {
      const response = await AIEvaluationService.evaluateWithBestAvailable({
        question: 'Resume vs Job Description Analysis',
        answer: prompt,
        ratingMode: 'lenient'
      });
      const aiSections = parseAIAnalysisSections(response.feedback_text || response.suggested_answer || '');
      const mockAnalysis = this.generateMockAnalysis(resumeText, jobDescription);
      const availableKeys = AIEvaluationService.hasApiKeys();
      const aiProvider = availableKeys.groq ? 'Groq' : availableKeys.openai ? 'OpenAI' : 'Gemini';
      return {
        ...mockAnalysis,
        aiProvider,
        aiSections,
        extractedKeywords,
        overallScore: aiSections.score ? parseInt(aiSections.score.match(/\d+/)?.[0] || '80', 10) : mockAnalysis.overallScore
      };
    } catch (error) {
      console.error('❌ AI resume analysis failed:', error);
      throw error;
    }
  }

  private static buildAnalysisPrompt(resumeText: string, jobDescription?: string, extractedKeywords: string[] = []): string {
    return `
You are an expert resume reviewer. Compare the following resume to the provided job description.

==== JOB DESCRIPTION ====
${jobDescription || 'N/A'}

==== EXTRACTED KEYWORDS ====
${extractedKeywords.join(', ') || 'N/A'}

==== RESUME ====
${resumeText}

Please answer in the following sections:

1. Strengths: List the candidate's strengths that match the job description and keywords.
2. Missing or Weak Areas: List any important skills or keywords from the job description that are missing or weak in the resume.
3. Suggestions: Give specific, actionable suggestions to improve the resume for this job.
4. Overall Match Score: Give a match score (0-100) and a brief summary.

Return your answer in clear sections with headings for each part. Do not introduce yourself. Only use the information in the resume, job description, and keywords above.`;
  }

  private static generateMockAnalysis(resumeText: string, jobDescription?: string): ResumeAnalysis {
    const textLower = resumeText.toLowerCase();
    
    const hasEmail = /@/.test(resumeText);
    const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
    const hasLinkedIn = /linkedin/.test(textLower);
    const hasQuantifiableResults = /\d+%|\$\d+|increased|decreased|improved|reduced/.test(textLower);
    const hasActionVerbs = /developed|created|managed|led|implemented|designed|built/.test(textLower);
    const hasTechnicalSkills = /javascript|python|react|node|sql|aws|docker|kubernetes/.test(textLower);
    const hasEducation = /university|college|degree|bachelor|master|phd/.test(textLower);
    
    const contactScore = (hasEmail ? 30 : 0) + (hasPhone ? 30 : 0) + (hasLinkedIn ? 25 : 0) + 15;
    const summaryScore = resumeText.length > 500 ? 75 : 60;
    const experienceScore = (hasQuantifiableResults ? 40 : 20) + (hasActionVerbs ? 30 : 10) + 20;
    const skillsScore = hasTechnicalSkills ? 80 : 60;
    const educationScore = hasEducation ? 85 : 70;
    const formattingScore = resumeText.length > 200 && resumeText.length < 5000 ? 75 : 60;
    
    const overallScore = Math.round((contactScore + summaryScore + experienceScore + skillsScore + educationScore + formattingScore) / 6);

    let keywordAnalysis = {
      found: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      missing: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'],
      suggestions: ['Add cloud technologies', 'Include modern frameworks', 'Mention DevOps tools']
    };

    if (jobDescription) {
      const jobKeywords = jobDescription.toLowerCase().match(/\b(javascript|python|react|node|sql|aws|docker|kubernetes|typescript|graphql|mongodb|postgresql|redis|git|agile|scrum)\b/g) || [];
      const resumeKeywords = resumeText.toLowerCase().match(/\b(javascript|python|react|node|sql|aws|docker|kubernetes|typescript|graphql|mongodb|postgresql|redis|git|agile|scrum)\b/g) || [];
      
      const uniqueJobKeywords = [...new Set(jobKeywords)];
      const uniqueResumeKeywords = [...new Set(resumeKeywords)];
      
      keywordAnalysis = {
        found: uniqueResumeKeywords.filter(keyword => uniqueJobKeywords.includes(keyword)),
        missing: uniqueJobKeywords.filter(keyword => !uniqueResumeKeywords.includes(keyword)),
        suggestions: ['Include more job-specific keywords', 'Add relevant technical skills', 'Mention industry buzzwords']
      };
    }

    return {
      overallScore,
      sections: {
        contact: {
          score: contactScore,
          feedback: hasEmail && hasPhone ? 'Contact information is complete and professional' : 'Contact information needs improvement',
          suggestions: [
            !hasEmail ? 'Add professional email address' : 'Consider adding LinkedIn profile',
            !hasPhone ? 'Include phone number' : 'Add portfolio website if applicable',
            'Ensure contact info is at the top of resume'
          ].filter(Boolean)
        },
        summary: {
          score: summaryScore,
          feedback: resumeText.length > 500 ? 'Good professional summary with adequate detail' : 'Professional summary could be more comprehensive',
          suggestions: ['Add more specific achievements', 'Include relevant keywords', 'Quantify your impact', 'Keep it concise but impactful']
        },
        experience: {
          score: experienceScore,
          feedback: hasQuantifiableResults ? 'Strong work experience with good quantifiable results' : 'Work experience needs more quantifiable achievements',
          suggestions: [
            !hasActionVerbs ? 'Use more action verbs' : 'Continue using strong action verbs',
            !hasQuantifiableResults ? 'Add quantifiable results and metrics' : 'Include more specific numbers and percentages',
            'Include relevant technologies and tools',
            'Focus on impact and outcomes'
          ]
        },
        skills: {
          score: skillsScore,
          feedback: hasTechnicalSkills ? 'Good technical skills section' : 'Skills section needs enhancement with more technical skills',
          suggestions: ['Organize by categories', 'Add proficiency levels', 'Include more relevant technologies', 'Remove outdated skills']
        },
        education: {
          score: educationScore,
          feedback: hasEducation ? 'Education section is well-formatted' : 'Education section could be improved',
          suggestions: ['Add relevant coursework', 'Include GPA if strong (3.5+)', 'Mention academic achievements', 'Add certifications']
        },
        formatting: {
          score: formattingScore,
          feedback: resumeText.length > 200 && resumeText.length < 5000 ? 'Formatting appears reasonable' : 'Formatting could be improved for better readability',
          suggestions: ['Use consistent fonts', 'Improve spacing', 'Add bullet points for better structure', 'Ensure ATS compatibility']
        }
      },
      strengths: [
        hasQuantifiableResults ? 'Includes quantifiable achievements' : 'Shows work experience',
        hasTechnicalSkills ? 'Strong technical background' : 'Demonstrates relevant skills',
        hasEducation ? 'Good educational background' : 'Professional experience',
        hasEmail ? 'Clear contact information' : 'Provides contact details',
        hasActionVerbs ? 'Uses strong action verbs' : 'Describes work experience'
      ],
      improvements: [
        !hasQuantifiableResults ? 'Add more quantifiable achievements' : 'Continue highlighting measurable results',
        formattingScore < 70 ? 'Improve formatting and visual appeal' : 'Fine-tune formatting',
        !hasTechnicalSkills ? 'Include more relevant technical skills' : 'Keep technical skills current',
        'Enhance ATS compatibility',
        'Add portfolio or project links if applicable'
      ],
      keywords: keywordAnalysis,
      recommendations: [
        'Tailor your resume to specific job descriptions',
        'Use ATS-friendly formatting',
        'Include a portfolio section if applicable',
        'Add certifications if available',
        'Keep it to 1-2 pages maximum',
        'Proofread for grammar and spelling errors',
        'Use consistent formatting throughout',
        'Include relevant keywords from job postings'
      ]
    };
  }
}

export function parseAIAnalysisSections(aiText: string): { strengths?: string; missing?: string; suggestions?: string; score?: string } {
  if (!aiText) return {};
  const sections: any = {};
  const regexes = {
    strengths: /strengths[:\-\n]*([\s\S]*?)(?=\n\s*(Missing|Weak|Suggestions|Overall|$))/i,
    missing: /(missing|weak)[ areas]*[:\-\n]*([\s\S]*?)(?=\n\s*(Strengths|Suggestions|Overall|$))/i,
    suggestions: /suggestions?[:\-\n]*([\s\S]*?)(?=\n\s*(Strengths|Missing|Weak|Overall|$))/i,
    score: /(overall match score|score|summary)[:\-\n]*([\s\S]*)/i
  };
  const text = aiText.replace(/\r/g, '');
  const strengthsMatch = text.match(regexes.strengths);
  const missingMatch = text.match(regexes.missing);
  const suggestionsMatch = text.match(regexes.suggestions);
  const scoreMatch = text.match(regexes.score);
  if (strengthsMatch) sections.strengths = strengthsMatch[1].trim();
  if (missingMatch) sections.missing = (missingMatch[2] || missingMatch[1]).trim();
  if (suggestionsMatch) sections.suggestions = suggestionsMatch[1].trim();
  if (scoreMatch) sections.score = (scoreMatch[2] || scoreMatch[1]).trim();
  return sections;
}