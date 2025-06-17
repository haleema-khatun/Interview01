// Token estimation service for different AI providers
export class TokenEstimator {
  // Rough token estimation (1 token ≈ 4 characters for most models)
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Get estimated tokens for a complete evaluation request
  static estimateEvaluationTokens(question: string, answer: string): {
    input: number;
    output: number;
    total: number;
  } {
    const systemPrompt = "You are an expert interview coach and evaluator with 15+ years of experience. Provide comprehensive, actionable feedback that helps candidates improve. Always respond with valid JSON only.";
    const evaluationPrompt = this.buildPromptEstimate(question, answer);
    
    const inputTokens = this.estimateTokens(systemPrompt + evaluationPrompt);
    const outputTokens = 4096; // Increased from 2000 to 4096
    
    return {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
    };
  }

  private static buildPromptEstimate(question: string, answer: string): string {
    return `
You are an expert interview coach evaluating a candidate's response. Provide a comprehensive evaluation with detailed feedback.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

Please provide your evaluation in JSON format with scores, feedback, strengths, improvements, suggested answer, key points missed, interview tips, and detailed breakdown for each scoring criteria.
`;
  }

  // Get provider-specific token limits (these are rough estimates based on free tiers)
  static getProviderLimits(): { groq: number; openai: number; gemini: number } {
    return {
      groq: 6000,    // Groq free tier daily limit
      openai: 4096,  // Increased from 3000 to 4096 to match max_tokens
      gemini: 15000, // Gemini free tier per minute
    };
  }

  // Check if evaluation is within token limits
  static canEvaluate(question: string, answer: string, provider: 'groq' | 'openai' | 'gemini'): {
    canEvaluate: boolean;
    tokensNeeded: number;
    tokensAvailable: number;
    message: string;
  } {
    const limits = this.getProviderLimits();
    const estimate = this.estimateEvaluationTokens(question, answer);
    const available = limits[provider];
    
    const canEvaluate = estimate.total <= available;
    
    return {
      canEvaluate,
      tokensNeeded: estimate.total,
      tokensAvailable: available,
      message: canEvaluate 
        ? `Evaluation will use ~${estimate.total} tokens (${available} available)`
        : `Evaluation needs ${estimate.total} tokens but only ${available} available. Try shortening your answer or use a different provider.`
    };
  }
}