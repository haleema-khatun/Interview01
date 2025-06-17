import { AIResponseParser } from './aiResponseParser';
import { EvaluationRequest, EvaluationResponse, ApiLimitInfo } from './types';
import toast from 'react-hot-toast';

export class AIProviderManager {
  private static failedProviders = new Set<string>();
  private static lastFailureTime = new Map<string, number>();
  private static readonly FAILURE_COOLDOWN = 5 * 60 * 1000; // 5 minutes
  private static forcedProvider: 'groq' | 'openai' | 'gemini' | null = null;

  static getApiKeyFromStorage(provider: 'openai' | 'gemini' | 'groq'): string | null {
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

  static forceProvider(provider: 'groq' | 'openai' | 'gemini' | 'auto' | null): void {
    console.log(`Setting forced provider to: ${provider}`);
    this.forcedProvider = provider === 'auto' ? null : provider;
  }

  static analyzeApiError(error: any, provider: 'groq' | 'openai' | 'gemini'): ApiLimitInfo {
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
          suggestedAction: 'Try Gemini or OpenAI, or wait for quota reset.',
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
      if (errorMessage.includes('json') || errorMessage.includes('parse')) {
        return {
          provider,
          isLimitReached: false,
          errorType: 'format',
          message: 'Groq returned an invalid JSON response.',
          suggestedAction: 'Try another provider or retry your request.'
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

  static markProviderAsFailed(provider: string, cooldownMs: number = this.FAILURE_COOLDOWN) {
    this.failedProviders.add(provider);
    this.lastFailureTime.set(provider, Date.now());
    
    // Auto-remove from failed list after cooldown
    setTimeout(() => {
      this.failedProviders.delete(provider);
      this.lastFailureTime.delete(provider);
      console.log(`✅ ${provider} removed from failed providers list`);
    }, cooldownMs);
  }

  static isProviderAvailable(provider: string): boolean {
    if (!this.failedProviders.has(provider)) return true;
    
    const failureTime = this.lastFailureTime.get(provider);
    if (!failureTime) return true;
    
    const timeSinceFailure = Date.now() - failureTime;
    return timeSinceFailure > this.FAILURE_COOLDOWN;
  }

  static showLimitWarning(limitInfo: ApiLimitInfo, availableAlternatives: string[]) {
    // Import toast dynamically to avoid circular dependencies
    const alternativesText = availableAlternatives.length > 0 
      ? ` Switching to ${availableAlternatives[0]}...` 
      : ' No other providers available.';

    if (limitInfo.errorType === 'quota' || limitInfo.errorType === 'rate_limit') {
      toast.error(
        `🚨 ${limitInfo.provider.toUpperCase()} Limit Reached!\n${limitInfo.message}${alternativesText}`,
        { 
          duration: 6000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
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
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
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
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
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
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)'
          }
        }
      );
    }, 1000);
  }

  // New method for raw text generation (not evaluation-specific)
  static async generateRawText(prompt: string, provider: 'groq' | 'openai' | 'gemini'): Promise<string> {
    try {
      const apiKey = this.getApiKeyFromStorage(provider);
      
      if (!apiKey) {
        throw new Error(`${provider} API key not found. Please add your API key in Settings.`);
      }
      
      console.log(`🚀 Making ${provider} API request for content generation...`);
      
      let response: Response;
      let data: any;
      
      if (provider === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                content: 'You are a helpful AI assistant that generates content exactly as requested. Always respond with valid JSON when JSON is requested.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
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

        data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from Groq');
        }
        
        return data.choices[0].message.content;
      } 
      else if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are a helpful AI assistant that generates content exactly as requested. Always respond with valid JSON when JSON is requested.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
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

        data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from OpenAI');
        }
        
        return data.choices[0].message.content;
      } 
      else if (provider === 'gemini') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
              temperature: 0.7,
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

        data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
          throw new Error('Invalid response format from Gemini');
        }
        
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error(`Unsupported provider: ${provider}`);
    } catch (error) {
      console.error(`❌ ${provider} content generation error:`, error);
      
      const limitInfo = this.analyzeApiError(error, provider);
      if (limitInfo.isLimitReached) {
        this.markProviderAsFailed(provider, limitInfo.retryAfter ? limitInfo.retryAfter * 1000 : this.FAILURE_COOLDOWN);
      }
      
      throw { ...error, limitInfo };
    }
  }

  static buildEnhancedEvaluationPrompt(request: EvaluationRequest): string {
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
        // Use Groq-specific JSON cleaning
        const cleanedContent = AIResponseParser.cleanGroqJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse Groq response as JSON:', parseError);
        
        try {
          const partialEvaluation = AIResponseParser.extractPartialJson(content);
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
      
      evaluation = AIResponseParser.validateAndFixEvaluation(evaluation);
      
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
        // Use OpenAI-specific JSON cleaning
        const cleanedContent = AIResponseParser.cleanOpenAIJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
        
        try {
          const partialEvaluation = AIResponseParser.extractPartialJson(content);
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
      
      evaluation = AIResponseParser.validateAndFixEvaluation(evaluation);
      
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
        // Use Gemini-specific JSON cleaning
        const cleanedContent = AIResponseParser.cleanGeminiJsonResponse(content);
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', parseError);
        
        try {
          const partialEvaluation = AIResponseParser.extractPartialJson(content);
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
      
      evaluation = AIResponseParser.validateAndFixEvaluation(evaluation);
      
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

  // Check if any API keys are available
  static hasApiKeys(): { groq: boolean; openai: boolean; gemini: boolean } {
    return {
      groq: !!this.getApiKeyFromStorage('groq'),
      openai: !!this.getApiKeyFromStorage('openai'),
      gemini: !!this.getApiKeyFromStorage('gemini'),
    };
  }

  // Get failed providers
  static getFailedProviders(): Set<string> {
    return this.failedProviders;
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