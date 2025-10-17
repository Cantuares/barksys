/**
 * Notification Types
 * Adapted to match backend NotificationResponseDto
 */

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification as returned by backend API
 * Matches NotificationResponseDto structure
 */
export interface Notification {
  id: string;
  userId?: string;
  channel: string;
  title?: string;
  body?: string;
  actionUrl?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
}

/**
 * Helper to get notification type from metadata
 */
export const getNotificationType = (notification: Notification): string | undefined => {
  return notification.metadata?.type;
};

/**
 * Notifications list response from API
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

/**
 * Unread count response from API
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Filters for fetching notifications
 */
export interface NotificationFilters {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: string | string[];
  priority?: NotificationPriority;
}

/**
 * Notification store state
 */
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Notification store actions
 */
export interface NotificationActions {
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearError: () => void;
}
