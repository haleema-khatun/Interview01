export interface EvaluationRequest {
  question: string;
  answer: string;
  imageUrls?: string[];
  ratingMode?: 'tough' | 'lenient';
  evaluationType?: 'simple' | 'detailed';
  selectedProvider?: 'auto' | 'groq' | 'openai' | 'gemini'; // Add selected provider
}

export interface EvaluationResponse {
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
  ai_provider?: string;
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

export interface ApiLimitInfo {
  provider: 'groq' | 'openai' | 'gemini';
  isLimitReached: boolean;
  errorType: 'quota' | 'rate_limit' | 'invalid_key' | 'network' | 'unknown' | 'format';
  message: string;
  suggestedAction: string;
  retryAfter?: number; // seconds
}