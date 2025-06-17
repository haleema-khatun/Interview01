import { supabase } from '../lib/supabase';

export interface EvaluationHistoryEntry {
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
  evaluation_type?: 'standard' | 'mock' | 'practice' | 'simple' | 'detailed';
  response_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface EvaluationStats {
  totalEvaluations: number;
  averageScore: number;
  categoryBreakdown: {
    behavioral: { count: number; averageScore: number };
    technical: { count: number; averageScore: number };
    situational: { count: number; averageScore: number };
  };
  recentActivity: EvaluationHistoryEntry[];
  topStrengths: string[];
  commonImprovements: string[];
}

export class EvaluationHistoryService {
  // Map frontend evaluation types to database-compatible types
  private static mapEvaluationType(evaluationType?: string): string {
    switch (evaluationType) {
      case 'simple':
        return 'simple';
      case 'detailed':
        return 'detailed';
      case 'practice':
        return 'practice';
      case 'mock':
        return 'mock';
      default:
        return 'standard';
    }
  }

  // Save evaluation to history
  static async saveEvaluation(
    userId: string,
    questionId: string,
    questionTitle: string,
    questionCategory: 'behavioral' | 'technical' | 'situational',
    answerText: string,
    evaluation: any,
    responseTimeSeconds: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Saving evaluation to history...');
      console.log('Evaluation type:', evaluation.evaluation_type);
      
      const evaluationData = {
        user_id: userId,
        question_id: questionId,
        question_title: questionTitle,
        question_category: questionCategory,
        answer_text: answerText,
        clarity_score: evaluation.clarity_score,
        relevance_score: evaluation.relevance_score,
        critical_thinking_score: evaluation.critical_thinking_score,
        thoroughness_score: evaluation.thoroughness_score,
        overall_score: evaluation.overall_score,
        feedback_text: evaluation.feedback_text,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        ai_provider: evaluation.ai_provider || 'Mock',
        rating_mode: evaluation.rating_mode || 'lenient',
        evaluation_type: this.mapEvaluationType(evaluation.evaluation_type),
        response_time_seconds: responseTimeSeconds
      };

      console.log('Mapped evaluation type:', evaluationData.evaluation_type);

      // First check if an entry already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('evaluations_history')
        .select('id, answer_text')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing evaluation:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // If entry exists, update it
      if (existingData) {
        console.log('📝 Updating existing evaluation record');
        console.log('Previous answer length:', existingData.answer_text?.length || 0);
        console.log('New answer length:', answerText.length);
        
        const { data, error } = await supabase
          .from('evaluations_history')
          .update(evaluationData)
          .eq('id', existingData.id)
          .select();

        if (error) {
          console.error('❌ Error updating evaluation:', error);
          return { success: false, error: error.message };
        }

        console.log('✅ Evaluation updated successfully:', data?.[0]?.id);
        return { success: true };
      } else {
        // Insert new record
        console.log('📝 Creating new evaluation record');
        
        const { data, error } = await supabase
          .from('evaluations_history')
          .insert(evaluationData)
          .select()
          .single();

        if (error) {
          console.error('❌ Error saving evaluation:', error);
          return { success: false, error: error.message };
        }

        console.log('✅ Evaluation saved successfully:', data.id);
        return { success: true };
      }
    } catch (error: any) {
      console.error('❌ Failed to save evaluation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's evaluation history
  static async getUserHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: EvaluationHistoryEntry[]; error?: string }> {
    try {
      console.log('📚 Fetching user evaluation history...');
      
      const { data, error } = await supabase
        .from('evaluations_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching history:', error);
        return { data: [], error: error.message };
      }

      console.log(`✅ Fetched ${data?.length || 0} evaluation records`);
      return { data: data || [] };
    } catch (error: any) {
      console.error('❌ Failed to fetch history:', error);
      return { data: [], error: error.message };
    }
  }

  // Get evaluation statistics for user
  static async getUserStats(userId: string): Promise<{ data: EvaluationStats | null; error?: string }> {
    try {
      console.log('📊 Calculating user evaluation statistics...');
      
      const { data: evaluations, error } = await supabase
        .from('evaluations_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching evaluations for stats:', error);
        return { data: null, error: error.message };
      }

      if (!evaluations || evaluations.length === 0) {
        return {
          data: {
            totalEvaluations: 0,
            averageScore: 0,
            categoryBreakdown: {
              behavioral: { count: 0, averageScore: 0 },
              technical: { count: 0, averageScore: 0 },
              situational: { count: 0, averageScore: 0 }
            },
            recentActivity: [],
            topStrengths: [],
            commonImprovements: []
          }
        };
      }

      // Calculate statistics
      const totalEvaluations = evaluations.length;
      const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overall_score, 0) / totalEvaluations;

      // Category breakdown
      const categoryBreakdown = {
        behavioral: { count: 0, averageScore: 0 },
        technical: { count: 0, averageScore: 0 },
        situational: { count: 0, averageScore: 0 }
      };

      evaluations.forEach(evaluation => {
        categoryBreakdown[evaluation.question_category].count++;
      });

      Object.keys(categoryBreakdown).forEach(category => {
        const categoryEvals = evaluations.filter(evaluation => evaluation.question_category === category);
        if (categoryEvals.length > 0) {
          categoryBreakdown[category as keyof typeof categoryBreakdown].averageScore = 
            categoryEvals.reduce((sum, evaluation) => sum + evaluation.overall_score, 0) / categoryEvals.length;
        }
      });

      // Top strengths and common improvements
      const allStrengths = evaluations.flatMap(evaluation => evaluation.strengths || []);
      const allImprovements = evaluations.flatMap(evaluation => evaluation.improvements || []);

      const strengthCounts = allStrengths.reduce((acc, strength) => {
        acc[strength] = (acc[strength] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const improvementCounts = allImprovements.reduce((acc, improvement) => {
        acc[improvement] = (acc[improvement] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topStrengths = Object.entries(strengthCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([strength]) => strength);

      const commonImprovements = Object.entries(improvementCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([improvement]) => improvement);

      const stats: EvaluationStats = {
        totalEvaluations,
        averageScore: Math.round(averageScore * 10) / 10,
        categoryBreakdown,
        recentActivity: evaluations.slice(0, 10),
        topStrengths,
        commonImprovements
      };

      console.log('✅ Statistics calculated successfully');
      return { data: stats };
    } catch (error: any) {
      console.error('❌ Failed to calculate stats:', error);
      return { data: null, error: error.message };
    }
  }

  // Get evaluation by question ID for user
  static async getEvaluationByQuestion(
    userId: string,
    questionId: string
  ): Promise<{ data: EvaluationHistoryEntry | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('evaluations_history')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Error fetching evaluation:', error);
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error: any) {
      console.error('❌ Failed to fetch evaluation:', error);
      return { data: null, error: error.message };
    }
  }

  // Delete evaluation from history
  static async deleteEvaluation(userId: string, evaluationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('evaluations_history')
        .delete()
        .eq('id', evaluationId)
        .eq('user_id', userId); // Ensure user can only delete their own evaluations

      if (error) {
        console.error('❌ Error deleting evaluation:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Evaluation deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete evaluation:', error);
      return { success: false, error: error.message };
    }
  }
}