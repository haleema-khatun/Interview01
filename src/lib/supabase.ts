import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL exists:', !!supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file and ensure you have:');
  console.error('VITE_SUPABASE_URL=your_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
  
  // For development, we'll create a mock client to prevent crashes
  throw new Error('Supabase configuration missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'interviewace-web'
    },
    fetch: (url, options = {}) => {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'user' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          bio: string | null;
          skills: string[] | null;
          education: any[] | null;
          experience: any[] | null;
          social_links: any | null;
          phone: string | null;
          location: string | null;
          interests: string[] | null;
          languages: string[] | null;
          certifications: any[] | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          bio?: string | null;
          skills?: string[] | null;
          education?: any[] | null;
          experience?: any[] | null;
          social_links?: any | null;
          phone?: string | null;
          location?: string | null;
          interests?: string[] | null;
          languages?: string[] | null;
          certifications?: any[] | null;
        };
        Update: {
          full_name?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          bio?: string | null;
          skills?: string[] | null;
          education?: any[] | null;
          experience?: any[] | null;
          social_links?: any | null;
          phone?: string | null;
          location?: string | null;
          interests?: string[] | null;
          languages?: string[] | null;
          certifications?: any[] | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
      };
      questions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'behavioral' | 'technical' | 'situational';
          difficulty: 'easy' | 'medium' | 'hard';
          tags: string[];
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      responses: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          answer_text: string;
          answer_audio_url: string | null;
          image_urls: string[];
          response_time_seconds: number;
          created_at: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          response_id: string;
          clarity_score: number;
          relevance_score: number;
          critical_thinking_score: number;
          thoroughness_score: number;
          overall_score: number;
          feedback_text: string;
          strengths: string[];
          improvements: string[];
          ai_provider: string;
          created_at: string;
        };
      };
      user_api_keys: {
        Row: {
          id: string;
          user_id: string;
          provider: 'openai' | 'gemini';
          api_key_encrypted: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      evaluations_history: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          question_title: string;
          question_category: 'behavioral' | 'technical' | 'situational';
          answer_text: string;
          clarity_score: number;
          relevance_score: number;
          critical_thinking_score: number;
          thoroughness_score: number;
          overall_score: number;
          feedback_text: string;
          strengths: string[];
          improvements: string[];
          ai_provider: string;
          rating_mode: 'tough' | 'lenient';
          response_time_seconds: number;
          face_report: any;
          violations: any;
          evaluation_type: 'standard' | 'mock' | 'practice';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          question_id: string;
          question_title: string;
          question_category: 'behavioral' | 'technical' | 'situational';
          answer_text: string;
          clarity_score: number;
          relevance_score: number;
          critical_thinking_score: number;
          thoroughness_score: number;
          overall_score: number;
          feedback_text: string;
          strengths?: string[];
          improvements?: string[];
          ai_provider: string;
          rating_mode: 'tough' | 'lenient';
          response_time_seconds?: number;
          face_report?: any;
          violations?: any;
          evaluation_type?: 'standard' | 'mock' | 'practice';
        };
        Update: {
          question_title?: string;
          question_category?: 'behavioral' | 'technical' | 'situational';
          answer_text?: string;
          clarity_score?: number;
          relevance_score?: number;
          critical_thinking_score?: number;
          thoroughness_score?: number;
          overall_score?: number;
          feedback_text?: string;
          strengths?: string[];
          improvements?: string[];
          ai_provider?: string;
          rating_mode?: 'tough' | 'lenient';
          response_time_seconds?: number;
          face_report?: any;
          violations?: any;
          evaluation_type?: 'standard' | 'mock' | 'practice';
          updated_at?: string;
        };
      };
    };
  };
};