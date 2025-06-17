import { supabase } from '../lib/supabase';

export interface Notification {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at?: string;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<{ success: boolean; data?: Notification; error?: string }> {
    try {
      console.log('📨 Creating notification...');
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notification created successfully');
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Failed to create notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's notifications
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    includeRead: boolean = false
  ): Promise<{ data: Notification[]; unreadCount: number; error?: string }> {
    try {
      console.log('📚 Fetching user notifications...');
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (!includeRead) {
        query = query.eq('is_read', false);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        return { data: [], unreadCount: 0, error: error.message };
      }

      // Get unread count
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (countError) {
        console.error('❌ Error counting unread notifications:', countError);
      }

      console.log(`✅ Fetched ${data?.length || 0} notifications, ${count || 0} unread`);
      return { data: data || [], unreadCount: count || 0 };
    } catch (error: any) {
      console.error('❌ Failed to fetch notifications:', error);
      return { data: [], unreadCount: 0, error: error.message };
    }
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📝 Marking notification as read...');
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId); // Ensure user can only mark their own notifications

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notification marked as read');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📝 Marking all notifications as read...');
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ All notifications marked as read');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to mark all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete notification
  static async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting notification...');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId); // Ensure user can only delete their own notifications

      if (error) {
        console.error('❌ Error deleting notification:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notification deleted');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete notification:', error);
      return { success: false, error: error.message };
    }
  }
}