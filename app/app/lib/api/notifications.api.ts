import { apiClient } from './client';
import type {
  NotificationsListResponse,
  Notification,
  NotificationFilters,
  UnreadCountResponse,
} from '../../types/notification.types';

export const notificationsApi = {
  /**
   * Get notifications with optional filters
   */
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationsListResponse> => {
    const params = new URLSearchParams();

    params.append('limit', (filters?.limit || 50).toString());
    params.append('offset', (filters?.offset || 0).toString());

    if (filters?.unreadOnly) {
      params.append('unreadOnly', 'true');
    }
    if (filters?.type) {
      if (Array.isArray(filters.type)) {
        filters.type.forEach(t => params.append('type', t));
      } else {
        params.append('type', filters.type);
      }
    }
    if (filters?.priority) {
      params.append('priority', filters.priority);
    }

    return apiClient.get(`/notifications?${params}`);
  },

  /**
   * Get unread notification count
   * Backend returns { count: number }
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return apiClient.get('/notifications/unread-count');
  },

  /**
   * Get a specific notification by ID
   */
  getNotificationById: async (id: string): Promise<Notification> => {
    return apiClient.get(`/notifications/${id}`);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   * Backend returns { updated: number }
   */
  markAllAsRead: async (): Promise<{ updated: number }> => {
    return apiClient.patch('/notifications/mark-all-read', {});
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};
