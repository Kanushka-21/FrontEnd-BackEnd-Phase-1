import { NotificationInfo } from '@/types';

const API_BASE_URL = 'http://localhost:9092/api';

/**
 * Service for managing system notifications
 */
export class NotificationService {
  /**
   * Get notifications for a specific user
   */
  static async getNotifications(userId: string): Promise<NotificationInfo[]> {
    try {
      console.log('🔔 Fetching notifications for user:', userId);
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('🔔 Notifications response:', data);
      
      return data.success ? data.data.notifications : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      console.log('🔔 Fetching unread count for user:', userId);
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}/unread-count`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      console.log('🔔 Unread count response:', data);
      
      return data.success ? data.data : 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('🔔 Marking notification as read:', notificationId);
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      const data = await response.json();
      console.log('🔔 Mark as read response:', data);
      
      return data.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      console.log('🔔 Marking all notifications as read for user:', userId);
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}/mark-all-read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      const data = await response.json();
      console.log('🔔 Mark all as read response:', data);
      
      return data.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}
