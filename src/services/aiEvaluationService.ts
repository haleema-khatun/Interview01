import { TokenEstimator } from './tokenEstimator';

interface EvaluationRequest {
  question: string;
  answer: string;
  imageUrls?: string[];
  ratingMode?: 'tough' | 'lenient';
  evaluationType?: 'simple' | 'detailed';
}

interface EvaluationResponse {
  clarity_score: number;
  relevance_score: number;
  critical_thinking_score: number;
  thoroughness_score: number;
  overall_score: number;
  feedback_text: string;
  strengths: string[];
  improvements: string[];
  suggested_answer: string;
  key_points_missed: string[];
  interview_tips: string[];
  rating_mode: 'tough' | 'lenient';
  evaluation_type?: 'simple' | 'detailed';
  detailed_breakdown: {
    clarity: {
      score: number;
      feedback: string;
      examples: string[];
    };
    relevance: {
      score: number;
      feedback: string;
      examples: string[];
    };
    critical_thinking: {
      score: number;
      feedback: string;
      examples: string[];
    };
    thoroughness: {
      score: number;
      feedback: string;
      examples: string[];
    };
  };
}

interface ApiLimitInfo {
  provider: 'groq' | 'openai' | 'gemini';
  isLimitReached: boolean;
  errorType: 'quota' | 'rate_limit' | 'invalid_key' | 'network' | 'unknown';
  message: string;
  suggestedAction: string;
  retryAfter?: number; // seconds
}

export class AIEvaluationService {
  private static failedProviders = new Set<string>();
  private static lastFailureTime = new Map<string, number>();
  private static readonly FAILURE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  private static getApiKeyFromStorage(provider: 'openai' | 'gemini' | 'groq'): string | null {
    try {
      const encodedKey = localStorage.getItem(`${provider}_api_key`);
      if (!encodedKey) return null;
      
      // Decode the base64 encoded key
      return atob(encodedKey);
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  private static analyzeApiError(error: any, provider: 'groq' | 'openai' | 'gemini'): ApiLimitInfo {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorString = error.toString().toLowerCase();
    
    console.log(`🔍 Analyzing ${provider} error:`, errorMessage);

    // Groq-specific errors
    if (provider === 'groq') {
      if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('rate')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'quota',
          message: `Groq API quota/rate limit exceeded. Your free tier limit has been reached.`,
          suggestedAction: 'Try OpenAI or Gemini, or wait for quota reset.',
          retryAfter: 3600 // 1 hour
        };
      }
      if (errorMessage.includes('invalid') && errorMessage.includes('key')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'invalid_key',
          message: 'Invalid Groq API key. Please check your API key in Settings.',
          suggestedAction: 'Update your Groq API key or try another provider.'
        };
      }
    }

    // OpenAI-specific errors
    if (provider === 'openai') {
      if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'quota',
          message: `OpenAI API quota exceeded. You've reached your usage limit.`,
          suggestedAction: 'Try Groq or Gemini, or add credits to your OpenAI account.',
          retryAfter: 3600
        };
      }
      if (errorMessage.includes('rate_limit') || errorMessage.includes('too many requests')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'rate_limit',
          message: `OpenAI rate limit exceeded. Too many requests in a short time.`,
          suggestedAction: 'Try Groq or Gemini, or wait a few minutes.',
          retryAfter: 300 // 5 minutes
        };
      }
      if (errorMessage.includes('invalid') && errorMessage.includes('key')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'invalid_key',
          message: 'Invalid OpenAI API key. Please check your API key in Settings.',
          suggestedAction: 'Update your OpenAI API key or try another provider.'
        };
      }
    }

    // Gemini-specific errors
    if (provider === 'gemini') {
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'quota',
          message: `Gemini API quota exceeded. You've reached your usage limit.`,
          suggestedAction: 'Try Groq or OpenAI, or wait for quota reset.',
          retryAfter: 3600
        };
      }
      if (errorMessage.includes('400') || errorMessage.includes('invalid')) {
        return {
          provider,
          isLimitReached: true,
          errorType: 'invalid_key',
          message: 'Invalid Gemini API key. Please check your API key in Settings.',
          suggestedAction: 'Update your Gemini API key or try another provider.'
        };
      }
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      return {
        provider,
        isLimitReached: false,
        errorType: 'network',
        message: `Network error with ${provider}. Connection failed.`,
        suggestedAction: 'Check your internet connection or try another provider.'
      };
    }

    // Generic error
    return {
      provider,
      isLimitReached: true,
      errorType: 'unknown',
      message: `${provider} API error: ${errorMessage}`,
      suggestedAction: 'Try another AI provider or check your API key.'
    };
  }

  private static markProviderAsFailed(provider: string, cooldownMs: number = this.FAILURE_COOLDOWN) {
    this.failedProviders.add(provider);
    this.lastFailureTime.set(provider, Date.now());
    
    // Auto-remove from failed list after cooldown
    setTimeout(() => {
      this.failedProviders.delete(provider);
      this.lastFailureTime.delete(provider);
      console.log(`✅ ${provider} removed from failed providers list`);
    }, cooldownMs);
  }

  private static isProviderAvailable(provider: string): boolean {
    if (!this.failedProviders.has(provider)) return true;
    
    const failureTime = this.lastFailureTime.get(provider);
    if (!failureTime) return true;
    
    const timeSinceFailure = Date.now() - failureTime;
    return timeSinceFailure > this.FAILURE_COOLDOWN;
  }

  private static showLimitWarning(limitInfo: ApiLimitInfo, availableAlternatives: string[]) {
    // Import toast dynamically to avoid circular dependencies
    import('react-hot-toast').then(({ default: toast }) => {
      const alternativesText = availableAlternatives.length > 0 
        ? ` Switching to ${availableAlternatives[0]}...` 
        : ' No other providers available.';

      if (limitInfo.errorType === 'quota' || limitInfo.errorType === 'rate_limit') {
        toast.error(
          `🚨 ${limitInfo.provider.toUpperCase()} Limit Reached!\n${limitInfo.message}${alternativesText}`,
          { 
            duration: 6000,
            style: {
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              maxWidth: '500px'
            }
          }
        );
      } else if (limitInfo.errorType === 'invalid_key') {
        toast.error(
          `🔑 ${limitInfo.provider.toUpperCase()} API Key Issue!\n${limitInfo.message}${alternativesText}`,
          { 
            duration: 8000,
            style: {
              background: '#FEF3C7',
              color: '#D97706',
              border: '1px solid #FDE68A',
              maxWidth: '500px'
            }
          }
        );
      } else {
        toast.error(
          `⚠️ ${limitInfo.provider.toUpperCase()} Error!\n${limitInfo.message}${alternativesText}`,
          { 
            duration: 5000,
            style: {
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              maxWidth: '500px'
            }
          }
        );
      }

      // Show suggestion toast after a delay
      setTimeout(() => {
        toast(
          `💡 Suggestion: ${limitInfo.suggestedAction}`,
          { 
            duration: 5000,
            icon: '💡',
            style: {
              background: '#EBF8FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE'
            }
          }
        );
      }, 1000);
    });
  }

  static async evaluateWithGroq(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const apiKey = this.getApiKeyFromStorage('groq');
      
      if (!apiKey) {
        throw new Error('Groq API key not found. Please add your API key in Settings.');
      }
      
      console.log('🚀 Making Groq API request...');
      
      const prompt = this.buildEnhancedEvaluationPrompt(request);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview coach and evaluator with 15+ years of experience. You are STRICT and give ZERO tolerance for irrelevant answers. If an answer is completely off-topic or wrong, give scores of 0-1. Only give good scores for genuinely relevant and correct answers. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error response:', errorData);
        
        let errorObj;
        try {
          errorObj = JSON.parse(errorData);
        } catch {
          errorObj = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        throw new Error(errorObj.error?.message || `Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Groq API response received');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Groq');
      }
      
      const content = data.choices[0].message.content;
      console.log('📝 Raw Groq response:', content);
      
      let evaluation;
      try {
        const cleanedContent = this.cleanJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse Groq response as JSON:', parseError);
        
        try {
          const partialEvaluation = this.extractPartialJson(content);
          if (partialEvaluation) {
            console.log('✅ Successfully extracted partial JSON');
            evaluation = partialEvaluation;
          } else {
            throw new Error('Invalid JSON response from Groq');
          }
        } catch (extractError) {
          throw new Error('Invalid JSON response from Groq');
        }
      }
      
      evaluation = this.validateAndFixEvaluation(evaluation);
      
      return {
        ...evaluation,
        overall_score: Math.round((evaluation.clarity_score + evaluation.relevance_score + evaluation.critical_thinking_score + evaluation.thoroughness_score) / 4),
        rating_mode: request.ratingMode || 'lenient',
        evaluation_type: request.evaluationType || 'simple',
      };
    } catch (error) {
      console.error('❌ Groq evaluation error:', error);
      
      const limitInfo = this.analyzeApiError(error, 'groq');
      if (limitInfo.isLimitReached) {
        this.markProviderAsFailed('groq', limitInfo.retryAfter ? limitInfo.retryAfter * 1000 : this.FAILURE_COOLDOWN);
      }
      
      throw { ...error, limitInfo };
    }
  }

  static async evaluateWithOpenAI(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const apiKey = this.getApiKeyFromStorage('openai');
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add your API key in Settings.');
      }
      
      console.log('🤖 Making OpenAI API request...');
      
      const prompt = this.buildEnhancedEvaluationPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview coach and evaluator with 15+ years of experience. You are STRICT and give ZERO tolerance for irrelevant answers. If an answer is completely off-topic or wrong, give scores of 0-1. Only give good scores for genuinely relevant and correct answers. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error response:', errorData);
        
        let errorObj;
        try {
          errorObj = JSON.parse(errorData);
        } catch {
          errorObj = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        throw new Error(errorObj.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI API response received');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      const content = data.choices[0].message.content;
      console.log('📝 Raw OpenAI response:', content);
      
      let evaluation;
      try {
        const cleanedContent = this.cleanJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
        
        try {
          const partialEvaluation = this.extractPartialJson(content);
          if (partialEvaluation) {
            console.log('✅ Successfully extracted partial JSON');
            evaluation = partialEvaluation;
          } else {
            throw new Error('Invalid JSON response from OpenAI');
          }
        } catch (extractError) {
          throw new Error('Invalid JSON response from OpenAI');
        }
      }
      
      evaluation = this.validateAndFixEvaluation(evaluation);
      
      return {
        ...evaluation,
        overall_score: Math.round((evaluation.clarity_score + evaluation.relevance_score + evaluation.critical_thinking_score + evaluation.thoroughness_score) / 4),
        rating_mode: request.ratingMode || 'lenient',
        evaluation_type: request.evaluationType || 'simple',
      };
    } catch (error) {
      console.error('❌ OpenAI evaluation error:', error);
      
      const limitInfo = this.analyzeApiError(error, 'openai');
      if (limitInfo.isLimitReached) {
        this.markProviderAsFailed('openai', limitInfo.retryAfter ? limitInfo.retryAfter * 1000 : this.FAILURE_COOLDOWN);
      }
      
      throw { ...error, limitInfo };
    }
  }

  static async evaluateWithGemini(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const apiKey = this.getApiKeyFromStorage('gemini');
      
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please add your API key in Settings.');
      }
      
      console.log('🤖 Making Gemini API request...');
      
      const prompt = this.buildEnhancedEvaluationPrompt(request);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error response:', errorData);
        
        let errorObj;
        try {
          errorObj = JSON.parse(errorData);
        } catch {
          errorObj = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        throw new Error(errorObj.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Gemini API response received');
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response format from Gemini');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      console.log('📝 Raw Gemini response:', content);
      
      let evaluation;
      try {
        const cleanedContent = this.cleanJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', parseError);
        
        try {
          const partialEvaluation = this.extractPartialJson(content);
          if (partialEvaluation) {
            console.log('✅ Successfully extracted partial JSON');
            evaluation = partialEvaluation;
          } else {
            throw new Error('Invalid JSON response from Gemini');
          }
        } catch (extractError) {
          throw new Error('Invalid JSON response from Gemini');
        }
      }
      
      evaluation = this.validateAndFixEvaluation(evaluation);
      
      return {
        ...evaluation,
        overall_score: Math.round((evaluation.clarity_score + evaluation.relevance_score + evaluation.critical_thinking_score + evaluation.thoroughness_score) / 4),
        rating_mode: request.ratingMode || 'lenient',
        evaluation_type: request.evaluationType || 'simple',
      };
    } catch (error) {
      console.error('❌ Gemini evaluation error:', error);
      
      const limitInfo = this.analyzeApiError(error, 'gemini');
      if (limitInfo.isLimitReached) {
        this.markProviderAsFailed('gemini', limitInfo.retryAfter ? limitInfo.retryAfter * 1000 : this.FAILURE_COOLDOWN);
      }
      
      throw { ...error, limitInfo };
    }
  }

  // Enhanced helper method to clean JSON response with better error handling
  private static cleanJsonResponse(content: string): string {
    console.log('🧹 Cleaning JSON response...');
    
    // Remove any markdown code blocks
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find the first opening brace and last closing brace to extract JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.warn('⚠️ No valid JSON object boundaries found');
      throw new Error('No valid JSON object found in response');
    }
    
    // Extract only the JSON object
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues
    cleaned = this.fixCommonJsonIssues(cleaned);
    
    console.log('✅ JSON cleaned successfully');
    return cleaned;
  }

  // Helper method to fix common JSON formatting issues
  private static fixCommonJsonIssues(jsonStr: string): string {
    // Fix unescaped newlines, carriage returns, and tabs in string values
    jsonStr = jsonStr.replace(/(?<!\\)\\n/g, '\\n')
                     .replace(/(?<!\\)\\r/g, '\\r')
                     .replace(/(?<!\\)\\t/g, '\\t');
    
    // Fix unescaped quotes within string values
    // This regex finds quotes that are inside string values and escapes them
    jsonStr = this.escapeQuotesInStringValues(jsonStr);
    
    // Fix trailing commas before closing braces or brackets
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between properties (basic heuristic)
    jsonStr = jsonStr.replace(/}(\s*)"/g, '},$1"');
    jsonStr = jsonStr.replace(/](\s*)"/g, '],$1"');
    
    // Ensure proper closing of truncated JSON
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;
    
    // Add missing closing brackets
    for (let i = 0; i < (openBrackets - closeBrackets); i++) {
      jsonStr += ']';
    }
    
    // Add missing closing braces
    for (let i = 0; i < (openBraces - closeBraces); i++) {
      jsonStr += '}';
    }
    
    return jsonStr;
  }

  // Helper method to escape quotes within string values
  private static escapeQuotesInStringValues(jsonStr: string): string {
    let result = '';
    let inString = false;
    let escapeNext = false;
    let stringDelimiter = '';
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      const prevChar = i > 0 ? jsonStr[i - 1] : '';
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        if (!inString) {
          // Starting a string - check if this is a property name or value
          const beforeQuote = jsonStr.substring(0, i).trim();
          const afterQuoteIndex = jsonStr.indexOf('"', i + 1);
          
          if (afterQuoteIndex !== -1) {
            const betweenQuotes = jsonStr.substring(i + 1, afterQuoteIndex);
            const afterClosingQuote = jsonStr.substring(afterQuoteIndex + 1).trim();
            
            // If there's a colon after the closing quote, this is a property name
            if (afterClosingQuote.startsWith(':')) {
              inString = true;
              stringDelimiter = 'property';
            } else {
              // This is a string value
              inString = true;
              stringDelimiter = 'value';
            }
          }
        } else {
          // Ending a string
          inString = false;
          stringDelimiter = '';
        }
        result += char;
      } else if (inString && char === '"' && stringDelimiter === 'value') {
        // This is an unescaped quote within a string value - escape it
        result += '\\"';
      } else {
        result += char;
      }
    }
    
    return result;
  }

  // Enhanced helper method to extract partial JSON and complete it
  private static extractPartialJson(content: string): any | null {
    console.log('🔧 Attempting to extract partial JSON...');
    
    try {
      // First, try the enhanced cleaning method
      let cleaned = this.cleanJsonResponse(content);
      
      // Try to parse the cleaned content
      try {
        const parsed = JSON.parse(cleaned);
        console.log('✅ Successfully parsed cleaned JSON');
        return parsed;
      } catch (parseError) {
        console.log('⚠️ Cleaned JSON still invalid, attempting reconstruction...');
        
        // If that fails, try to reconstruct the JSON step by step
        return this.reconstructPartialJson(cleaned);
      }
    } catch (cleanError) {
      console.log('⚠️ JSON cleaning failed, attempting raw reconstruction...');
      
      // If cleaning fails, try to work with the raw content
      return this.reconstructPartialJson(content);
    }
  }

  // Helper method to reconstruct partial/malformed JSON
  private static reconstructPartialJson(content: string): any | null {
    try {
      // Find JSON boundaries
      const jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        console.log('❌ No opening brace found');
        return null;
      }
      
      let jsonContent = content.substring(jsonStart);
      
      // Try to build a valid JSON object by parsing line by line
      const lines = jsonContent.split('\n');
      let reconstructed = '';
      let braceCount = 0;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;
      let currentProperty = '';
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex].trim();
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (escapeNext) {
            escapeNext = false;
            reconstructed += char;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            reconstructed += char;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }
          
          reconstructed += char;
          
          // If we have a complete JSON structure, try to parse it
          if (braceCount === 0 && bracketCount === 0 && reconstructed.trim().endsWith('}')) {
            try {
              const testParse = JSON.parse(reconstructed.trim());
              console.log('✅ Successfully reconstructed JSON');
              return testParse;
            } catch (e) {
              // Continue building
            }
          }
        }
        
        // Add newline if not the last line
        if (lineIndex < lines.length - 1) {
          reconstructed += '\n';
        }
      }
      
      // If we reach here, try to complete the structure
      while (bracketCount > 0) {
        reconstructed += ']';
        bracketCount--;
      }
      
      while (braceCount > 0) {
        reconstructed += '}';
        braceCount--;
      }
      
      // Final attempt to parse
      try {
        const finalParsed = JSON.parse(reconstructed.trim());
        console.log('✅ Successfully completed and parsed JSON');
        return finalParsed;
      } catch (e) {
        console.log('❌ Final JSON reconstruction failed');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error reconstructing partial JSON:', error);
      return null;
    }
  }

  // Helper method to validate and fix evaluation structure
  private static validateAndFixEvaluation(evaluation: any): any {
    const defaultEvaluation = {
      clarity_score: 1,
      relevance_score: 1,
      critical_thinking_score: 1,
      thoroughness_score: 1,
      feedback_text: 'This answer appears to be completely irrelevant to the question asked. Please provide a proper response that directly addresses the question.',
      strengths: ['Answer was provided'],
      improvements: ['Answer the actual question asked', 'Stay on topic', 'Provide relevant information'],
      suggested_answer: 'A proper answer would directly address the question with relevant examples and clear reasoning.',
      key_points_missed: ['The entire question was not addressed', 'No relevant content provided'],
      interview_tips: ['Always read the question carefully', 'Stay focused on the topic', 'Provide specific examples'],
      detailed_breakdown: {
        clarity: {
          score: 1,
          feedback: 'Answer was not relevant to the question.',
          examples: ['Off-topic response', 'Did not address the question']
        },
        relevance: {
          score: 1,
          feedback: 'Answer was completely irrelevant.',
          examples: ['Wrong topic', 'No connection to question']
        },
        critical_thinking: {
          score: 1,
          feedback: 'No analytical thinking related to the question.',
          examples: ['No problem-solving shown', 'No relevant analysis']
        },
        thoroughness: {
          score: 1,
          feedback: 'Did not cover any aspects of the actual question.',
          examples: ['Incomplete response', 'Missing all key points']
        }
      }
    };

    // Merge with defaults to ensure all required fields exist
    const result = { ...defaultEvaluation, ...evaluation };

    // Validate and fix scores - be strict about relevance
    const scoreFields = ['clarity_score', 'relevance_score', 'critical_thinking_score', 'thoroughness_score'];
    scoreFields.forEach(field => {
      if (typeof result[field] !== 'number' || result[field] < 1 || result[field] > 10) {
        result[field] = 1;
      }
    });

    // If relevance score is very low (1-2), make other scores low too
    if (result.relevance_score <= 2) {
      result.clarity_score = Math.min(result.clarity_score, 2);
      result.critical_thinking_score = Math.min(result.critical_thinking_score, 2);
      result.thoroughness_score = Math.min(result.thoroughness_score, 2);
    }

    // Ensure arrays exist and have content
    ['strengths', 'improvements', 'key_points_missed', 'interview_tips'].forEach(field => {
      if (!Array.isArray(result[field]) || result[field].length === 0) {
        result[field] = defaultEvaluation[field];
      }
    });

    // Ensure detailed_breakdown exists and is properly structured
    if (!result.detailed_breakdown || typeof result.detailed_breakdown !== 'object') {
      result.detailed_breakdown = defaultEvaluation.detailed_breakdown;
    } else {
      ['clarity', 'relevance', 'critical_thinking', 'thoroughness'].forEach(category => {
        if (!result.detailed_breakdown[category]) {
          result.detailed_breakdown[category] = defaultEvaluation.detailed_breakdown[category];
        } else {
          // Validate score
          if (typeof result.detailed_breakdown[category].score !== 'number' || 
              result.detailed_breakdown[category].score < 1 || 
              result.detailed_breakdown[category].score > 10) {
            result.detailed_breakdown[category].score = 1;
          }
          
          // If main relevance is low, make breakdown scores low too
          if (result.relevance_score <= 2 && category !== 'relevance') {
            result.detailed_breakdown[category].score = Math.min(result.detailed_breakdown[category].score, 2);
          }
          
          // Ensure feedback exists
          if (!result.detailed_breakdown[category].feedback) {
            result.detailed_breakdown[category].feedback = defaultEvaluation.detailed_breakdown[category].feedback;
          }
          
          // Ensure examples array exists
          if (!Array.isArray(result.detailed_breakdown[category].examples)) {
            result.detailed_breakdown[category].examples = defaultEvaluation.detailed_breakdown[category].examples;
          }
        }
      });
    }

    // Ensure strings exist
    ['feedback_text', 'suggested_answer'].forEach(field => {
      if (typeof result[field] !== 'string' || result[field].trim() === '') {
        result[field] = defaultEvaluation[field];
      }
    });

    return result;
  }

  private static buildEnhancedEvaluationPrompt(request: EvaluationRequest): string {
    const ratingMode = request.ratingMode || 'lenient';
    const evaluationType = request.evaluationType || 'simple';
    
    const ratingInstructions = ratingMode === 'tough' 
      ? 'Use TOUGH RATING standards - be extremely critical and demanding. Scores of 8+ should be rare and only for exceptional answers. Give 0-1 scores for completely irrelevant answers.'
      : 'Use LENIENT RATING standards - be encouraging but still accurate. Give 0-1 scores for completely irrelevant or wrong answers. Focus on potential and growth for relevant answers.';
    
    const detailLevel = evaluationType === 'detailed'
      ? 'Provide DETAILED EVALUATION with comprehensive analysis, specific examples, and in-depth feedback in each category.'
      : 'Provide STANDARD EVALUATION with concise feedback and key points.';

    return `
You are an expert interview coach evaluating a candidate's response. You must be STRICT about relevance - if an answer is completely off-topic or wrong, give scores of 0-1.

CRITICAL INSTRUCTION: If the answer is completely irrelevant to the question, give ALL scores as 1 and provide harsh but constructive feedback.

RATING MODE: ${ratingMode.toUpperCase()}
${ratingInstructions}

EVALUATION TYPE: ${evaluationType.toUpperCase()}
${detailLevel}

QUESTION: ${request.question}

CANDIDATE'S ANSWER: ${request.answer}

${request.imageUrls && request.imageUrls.length > 0 ? `
ADDITIONAL CONTEXT: The candidate provided ${request.imageUrls.length} supporting image(s) with their response.
` : ''}

CRITICAL: Respond with ONLY valid, complete JSON. Do not truncate any fields. Ensure all scores are integers between 1-10. Do not include any text outside the JSON object.

SCORING RULES:
- If answer is COMPLETELY IRRELEVANT or WRONG: Give scores of 1
- If answer is PARTIALLY RELEVANT but mostly wrong: Give scores of 2-3
- If answer is SOMEWHAT RELEVANT but lacks depth: Give scores of 4-5
- If answer is RELEVANT and adequate: Give scores of 6-7
- If answer is EXCELLENT and comprehensive: Give scores of 8-10

{
  "clarity_score": integer (1-10),
  "relevance_score": integer (1-10), 
  "critical_thinking_score": integer (1-10),
  "thoroughness_score": integer (1-10),
  "feedback_text": "Comprehensive feedback focusing on relevance first (max 200 words)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "suggested_answer": "Concise model answer (max 150 words)",
  "key_points_missed": ["point 1", "point 2", "point 3"],
  "interview_tips": ["tip 1", "tip 2", "tip 3"],
  "detailed_breakdown": {
    "clarity": {
      "score": integer (1-10),
      "feedback": "Brief feedback (max 50 words)",
      "examples": ["example 1", "example 2"]
    },
    "relevance": {
      "score": integer (1-10),
      "feedback": "Brief feedback (max 50 words)",
      "examples": ["example 1", "example 2"]
    },
    "critical_thinking": {
      "score": integer (1-10),
      "feedback": "Brief feedback (max 50 words)",
      "examples": ["example 1", "example 2"]
    },
    "thoroughness": {
      "score": integer (1-10),
      "feedback": "Brief feedback (max 50 words)",
      "examples": ["example 1", "example 2"]
    }
  }
}

EVALUATION CRITERIA:

**Relevance (1-10) - MOST IMPORTANT:** How well the answer addresses the specific question
- ${ratingMode === 'tough' ? '8-10: Perfectly addresses all aspects of the question' : '7-10: Addresses the main question well'}
- 4-6: Partially relevant with some off-topic content
- 2-3: Mostly irrelevant with minimal connection
- 1: Completely irrelevant or wrong

**Clarity (1-10):** Communication effectiveness, structure, articulation
- ${ratingMode === 'tough' ? '8-10: Exceptionally clear, professional presentation' : '7-10: Good communication with room for improvement'}
- 4-6: Adequate but could be clearer
- 1-3: Unclear, confusing, or poorly structured

**Critical Thinking (1-10):** Analytical depth, problem-solving approach, insights
- ${ratingMode === 'tough' ? '8-10: Demonstrates exceptional analytical thinking and insights' : '7-10: Shows good analytical thinking'}
- 4-6: Basic analysis with some reasoning
- 1-3: Little to no analytical thinking demonstrated

**Thoroughness (1-10):** Completeness, detail level, comprehensive coverage
- ${ratingMode === 'tough' ? '8-10: Exceptionally comprehensive with rich details' : '7-10: Good coverage of the topic'}
- 4-6: Adequate coverage but missing some important aspects
- 1-3: Superficial or incomplete coverage

REMEMBER: If the answer is completely irrelevant to the question, ALL scores should be 1 with harsh but constructive feedback.
`;
  }

  // Enhanced mock evaluation for demo purposes with strict relevance checking
  static async mockEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const ratingMode = request.ratingMode || 'lenient';
    const evaluationType = request.evaluationType || 'simple';
    
    // Check if answer is relevant to question (simple keyword matching for demo)
    const questionWords = request.question.toLowerCase().split(' ').filter(word => word.length > 3);
    const answerWords = request.answer.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Calculate relevance based on common words
    const commonWords = questionWords.filter(word => answerWords.includes(word));
    const relevanceRatio = commonWords.length / Math.max(questionWords.length, 1);
    
    console.log('🔍 Mock evaluation relevance check:', {
      questionWords: questionWords.slice(0, 5),
      answerWords: answerWords.slice(0, 5),
      commonWords,
      relevanceRatio
    });
    
    let scores;
    let feedback;
    let strengths;
    let improvements;
    
    if (relevanceRatio < 0.1 || request.answer.trim().length < 10) {
      // Completely irrelevant or too short answer
      scores = {
        clarity_score: 1,
        relevance_score: 1,
        critical_thinking_score: 1,
        thoroughness_score: 1,
      };
      
      feedback = `Your answer appears to be completely irrelevant to the question asked. The question was about "${request.question.substring(0, 50)}..." but your response does not address this topic at all. In an interview, it's crucial to listen carefully to the question and provide a direct, relevant response. Please read the question again and provide an answer that specifically addresses what was asked.`;
      
      strengths = [
        'You provided a response',
        'Answer was submitted on time',
        'Text was readable'
      ];
      
      improvements = [
        'Read the question carefully and ensure your answer is relevant',
        'Address the specific topic mentioned in the question',
        'Provide examples and details related to the actual question asked',
        'If unsure, ask for clarification rather than giving an unrelated answer'
      ];
    } else if (relevanceRatio < 0.3) {
      // Partially relevant but mostly off-topic
      scores = {
        clarity_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        relevance_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        critical_thinking_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        thoroughness_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
      };
      
      feedback = `Your answer shows some connection to the question but is largely off-topic. While you touched on a few relevant points, most of your response doesn't directly address what was asked. In interviews, staying focused on the specific question is crucial for demonstrating your listening skills and ability to provide targeted responses.`;
      
      strengths = [
        'Some relevant points were mentioned',
        'Answer showed effort and thought',
        'Communication was generally clear'
      ];
      
      improvements = [
        'Focus more directly on the specific question asked',
        'Eliminate off-topic information that doesn\'t add value',
        'Structure your answer to directly address the main points',
        'Use specific examples that relate to the question'
      ];
    } else {
      // Relevant answer - use normal scoring
      const baseScore = ratingMode === 'tough' ? 5 + Math.random() * 3 : 6 + Math.random() * 3;
      scores = {
        clarity_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        relevance_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        critical_thinking_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        thoroughness_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
      };
      
      const overall_score = Math.round((scores.clarity_score + scores.relevance_score + scores.critical_thinking_score + scores.thoroughness_score) / 4);
      
      feedback = `Your response demonstrates ${overall_score >= 7 ? 'strong' : overall_score >= 5 ? 'good' : 'developing'} interview skills. You provided relevant examples and showed clear communication abilities. The structure of your answer was logical and easy to follow. ${ratingMode === 'tough' ? 'However, to excel in competitive interviews, consider adding more specific metrics, deeper technical insights, and stronger examples that demonstrate leadership and impact.' : 'With some refinement in specific areas, you can significantly strengthen your interview performance.'}`;
      
      strengths = [
        'Clear and structured communication style',
        'Provided relevant examples from experience',
        'Demonstrated good understanding of the topic',
      ];
      
      improvements = [
        'Add more specific metrics and quantifiable results',
        'Include more diverse examples from different contexts',
        'Expand on the long-term impact of your actions',
      ];
    }

    const overall_score = Math.round((scores.clarity_score + scores.relevance_score + scores.critical_thinking_score + scores.thoroughness_score) / 4);

    return {
      ...scores,
      overall_score,
      rating_mode: ratingMode,
      evaluation_type: evaluationType,
      feedback_text: feedback,
      strengths,
      improvements,
      suggested_answer: `An excellent answer would start with a brief, confident introduction that directly addresses the question. For example: "I'd be happy to walk you through my approach to [specific topic]. In my experience, the key factors are [list 2-3 main points]." Then, provide a specific example using the STAR method (Situation, Task, Action, Result), including quantifiable outcomes. Finally, conclude by connecting your experience to the role you're applying for and demonstrating how you'd apply these skills in their organization.`,
      key_points_missed: overall_score <= 3 ? [
        'The main topic of the question was not addressed',
        'No relevant examples or experiences were provided',
        'Answer did not demonstrate understanding of the question'
      ] : [
        'Specific metrics or quantifiable results',
        'Connection to the target role or company',
        'Discussion of lessons learned or future applications',
      ],
      interview_tips: overall_score <= 3 ? [
        'Always read the question carefully before answering',
        'Make sure your answer directly addresses what was asked',
        'If you don\'t understand the question, ask for clarification',
        'Practice active listening during interviews'
      ] : [
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Always include specific numbers or metrics when possible',
        'Practice connecting your examples to the job requirements',
      ],
      detailed_breakdown: {
        clarity: {
          score: scores.clarity_score,
          feedback: scores.clarity_score <= 2 ? 'Answer was unclear and did not communicate effectively.' : 'Your communication was generally clear with good structure. Consider using more concise language and stronger transitions between points.',
          examples: scores.clarity_score <= 2 ? ['Off-topic response', 'Unclear communication'] : ['Good use of logical flow', 'Some sentences could be more concise']
        },
        relevance: {
          score: scores.relevance_score,
          feedback: scores.relevance_score <= 2 ? 'Answer was not relevant to the question asked.' : 'You addressed the main question well. Ensure every part of your answer directly relates to what was asked.',
          examples: scores.relevance_score <= 2 ? ['Wrong topic', 'No connection to question'] : ['Main topic was well addressed', 'Some tangential details could be removed']
        },
        critical_thinking: {
          score: scores.critical_thinking_score,
          feedback: scores.critical_thinking_score <= 2 ? 'No analytical thinking related to the question was demonstrated.' : 'You showed good analytical thinking. Consider diving deeper into the "why" behind your decisions and their broader implications.',
          examples: scores.critical_thinking_score <= 2 ? ['No problem-solving shown', 'No relevant analysis'] : ['Good problem-solving approach', 'Could explore alternative solutions']
        },
        thoroughness: {
          score: scores.thoroughness_score,
          feedback: scores.thoroughness_score <= 2 ? 'Answer did not cover any aspects of the actual question.' : 'Your answer covered the basics well. Adding more depth and considering edge cases would strengthen your response.',
          examples: scores.thoroughness_score <= 2 ? ['Incomplete response', 'Missing all key points'] : ['Covered main points effectively', 'Could include more comprehensive examples']
        }
      }
    };
  }

  // Check if any API keys are available
  static hasApiKeys(): { groq: boolean; openai: boolean; gemini: boolean } {
    return {
      groq: !!this.getApiKeyFromStorage('groq'),
      openai: !!this.getApiKeyFromStorage('openai'),
      gemini: !!this.getApiKeyFromStorage('gemini'),
    };
  }

  // Auto-select best available AI service with intelligent switching
  static async evaluateWithBestAvailable(request: EvaluationRequest): Promise<EvaluationResponse> {
    const availableKeys = this.hasApiKeys();
    
    console.log('🔑 Available API keys:', availableKeys);
    console.log('📊 Rating mode:', request.ratingMode || 'lenient');
    console.log('📊 Evaluation type:', request.evaluationType || 'simple');
    console.log('🚫 Failed providers:', Array.from(this.failedProviders));
    
    // Get list of available providers in priority order
    const providerPriority: Array<{ name: 'groq' | 'openai' | 'gemini', available: boolean }> = [
      { name: 'groq', available: availableKeys.groq && this.isProviderAvailable('groq') },
      { name: 'openai', available: availableKeys.openai && this.isProviderAvailable('openai') },
      { name: 'gemini', available: availableKeys.gemini && this.isProviderAvailable('gemini') }
    ];
    
    const availableProviders = providerPriority.filter(p => p.available);
    const failedProviderNames = Array.from(this.failedProviders);
    
    console.log('✅ Available providers:', availableProviders.map(p => p.name));
    
    if (availableProviders.length === 0) {
      console.log('ℹ️ No API keys or all providers failed, using enhanced mock evaluation');
      return await this.mockEvaluation(request);
    }
    
    // Try each available provider in order
    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i];
      const remainingProviders = availableProviders.slice(i + 1).map(p => p.name);
      
      try {
        console.log(`🚀 Trying ${provider.name} (${i + 1}/${availableProviders.length})`);
        
        switch (provider.name) {
          case 'groq':
            return await this.evaluateWithGroq(request);
          case 'openai':
            return await this.evaluateWithOpenAI(request);
          case 'gemini':
            return await this.evaluateWithGemini(request);
        }
      } catch (error: any) {
        console.warn(`⚠️ ${provider.name} failed:`, error.message);
        
        // Show warning popup if this provider hit limits
        if (error.limitInfo) {
          this.showLimitWarning(error.limitInfo, remainingProviders);
        }
        
        // If this is the last provider, throw the error
        if (i === availableProviders.length - 1) {
          // If all providers failed, fall back to mock
          console.log('❌ All providers failed, falling back to mock evaluation');
          return await this.mockEvaluation(request);
        }
        
        // Continue to next provider
        continue;
      }
    }
    
    // Fallback to mock if we somehow get here
    console.log('ℹ️ Fallback to mock evaluation');
    return await this.mockEvaluation(request);
  }

  // Get status of all providers
  static getProviderStatus(): { 
    groq: { available: boolean; hasKey: boolean; failed: boolean }; 
    openai: { available: boolean; hasKey: boolean; failed: boolean }; 
    gemini: { available: boolean; hasKey: boolean; failed: boolean }; 
  } {
    const keys = this.hasApiKeys();
    
    return {
      groq: {
        available: keys.groq && this.isProviderAvailable('groq'),
        hasKey: keys.groq,
        failed: this.failedProviders.has('groq')
      },
      openai: {
        available: keys.openai && this.isProviderAvailable('openai'),
        hasKey: keys.openai,
        failed: this.failedProviders.has('openai')
      },
      gemini: {
        available: keys.gemini && this.isProviderAvailable('gemini'),
        hasKey: keys.gemini,
        failed: this.failedProviders.has('gemini')
      }
    };
  }

  // Reset failed providers (for manual retry)
  static resetFailedProviders(): void {
    this.failedProviders.clear();
    this.lastFailureTime.clear();
    console.log('🔄 All failed providers reset');
  }
}