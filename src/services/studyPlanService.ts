import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface StudyPlanProgress {
  id?: string;
  user_id: string;
  plan_id: string;
  completed_days: number[];
  progress_percentage: number;
  last_updated: string;
}

export class StudyPlanService {
  // Save study plan progress to Supabase
  static async saveProgress(
    userId: string,
    planId: string,
    completedDays: number[],
    progressPercentage: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Saving study plan progress to Supabase...');
      
      const progressData = {
        user_id: userId,
        plan_id: planId,
        completed_days: completedDays,
        progress_percentage: progressPercentage,
        last_updated: new Date().toISOString()
      };

      // Check if progress record already exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from('study_plan_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching existing progress:', fetchError);
        return { success: false, error: fetchError.message };
      }

      let result;
      if (existingProgress) {
        // Update existing record
        result = await supabase
          .from('study_plan_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select();
      } else {
        // Insert new record
        result = await supabase
          .from('study_plan_progress')
          .insert(progressData)
          .select();
      }

      if (result.error) {
        console.error('❌ Error saving progress:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Study plan progress saved successfully');
      
      // Also save to localStorage as backup
      localStorage.setItem(`study_plan_progress_${planId}`, JSON.stringify({
        completedDays,
        progress: progressPercentage
      }));
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to save progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's study plan progress
  static async getProgress(
    userId: string,
    planId: string
  ): Promise<{ data: StudyPlanProgress | null; error?: string }> {
    try {
      console.log('📚 Fetching study plan progress...');
      
      const { data, error } = await supabase
        .from('study_plan_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching progress:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Study plan progress fetched successfully');
      return { data: data || null };
    } catch (error: any) {
      console.error('❌ Failed to fetch progress:', error);
      return { data: null, error: error.message };
    }
  }

  // Get all study plans progress for a user
  static async getAllProgress(
    userId: string
  ): Promise<{ data: StudyPlanProgress[]; error?: string }> {
    try {
      console.log('📚 Fetching all study plan progress...');
      
      const { data, error } = await supabase
        .from('study_plan_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all progress:', error);
        return { data: [], error: error.message };
      }

      console.log(`✅ Fetched ${data?.length || 0} study plan progress records`);
      return { data: data || [] };
    } catch (error: any) {
      console.error('❌ Failed to fetch all progress:', error);
      return { data: [], error: error.message };
    }
  }
}