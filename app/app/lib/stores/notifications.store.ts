import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';
import { ApiError } from '../../types/api.types';
import type {
  Notification,
  NotificationFilters,
  NotificationState,
  NotificationActions,
} from '../../types/notification.types';

interface NotificationStore extends NotificationState, NotificationActions {}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchNotifications: async (filters?: NotificationFilters) => {
    set({ isLoading: true, error: null });

    try {
      const response = await notificationsApi.getNotifications(filters);
      set({
        notifications: response.notifications,
        unreadCount: response.unreadCount,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Erro ao carregar notificações';

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { count } = await notificationsApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Don't set error state for silent failures
    }
  },

  markAsRead: async (id: string) => {
    try {
      const updatedNotification = await notificationsApi.markAsRead(id);

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? updatedNotification : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Erro ao marcar notificação como lida';

      set({ error: errorMessage });
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Erro ao marcar todas como lidas';

      set({ error: errorMessage });
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);

      set(state => {
        const notification = state.notifications.find(n => n.id === id);
        const wasUnread = notification && !notification.read;

        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Erro ao apagar notificação';

      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
