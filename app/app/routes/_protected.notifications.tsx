import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useNotificationStore } from '../lib/stores/notifications.store';
import { formatTimeAgo } from '../lib/utils/index';
import { Bell, Check, CheckCheck, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import type { Notification, NotificationPriority } from '../types/notification.types';

// Components
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export default function NotificationsPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadNotifications = useMemo(() =>
    notifications.filter(n => !n.read),
    [notifications]
  );

  const readNotifications = useMemo(() =>
    notifications.filter(n => n.read),
    [notifications]
  );

  const getNotificationIcon = (metadata?: Record<string, any>) => {
    const type = metadata?.type;
    const iconMap: Record<string, string> = {
      training_session_confirmed: 'fas fa-check-circle',
      training_session_cancelled: 'fas fa-times-circle',
      training_session_created: 'fas fa-calendar-plus',
      training_session_updated: 'fas fa-calendar-edit',
      session_reminder: 'fas fa-bell',
      enrollment_confirmed: 'fas fa-calendar-check',
      enrollment_cancelled: 'fas fa-calendar-times',
      package_purchased: 'fas fa-shopping-cart',
      package_created: 'fas fa-box',
      package_nearly_used: 'fas fa-exclamation-triangle',
      package_fully_used: 'fas fa-check-square',
      package_expiring: 'fas fa-exclamation-triangle',
      pet_created: 'fas fa-paw',
      trainer_created: 'fas fa-user-plus',
      tutor_created: 'fas fa-user-plus',
      availability_configured: 'fas fa-calendar-alt',
      system_announcement: 'fas fa-bullhorn',
    };

    return iconMap[type] || 'fas fa-info-circle';
  };

  const getPriorityColor = (priority?: NotificationPriority) => {
    const colorMap = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return colorMap[priority || 'low'];
  };


  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('notifications.page.confirmDelete') || 'Tem certeza que deseja apagar esta notificação?')) {
      try {
        await deleteNotification(id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      onClick={() => handleNotificationClick(notification)}
      className={`border rounded-lg p-4 transition-all ${
        notification.read
          ? 'bg-white border-gray-200'
          : 'bg-green-50 border-green-200'
      } ${notification.actionUrl ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          notification.read ? 'bg-gray-100' : 'bg-green-100'
        }`}>
          <i className={`${getNotificationIcon(notification.metadata)} ${
            notification.read ? 'text-gray-600' : 'text-green-600'
          }`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold ${
              notification.read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h3>
            {notification.priority && notification.priority !== 'low' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                getPriorityColor(notification.priority)
              }`}>
                {notification.priority === 'urgent' && t('notifications.priority.urgent')}
                {notification.priority === 'high' && t('notifications.priority.high')}
                {notification.priority === 'medium' && t('notifications.priority.medium')}
              </span>
            )}
          </div>

          <p className={`text-sm mb-2 ${
            notification.read ? 'text-gray-600' : 'text-gray-700'
          }`}>
            {notification.body}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {t('notifications.page.markAsRead')}
                </button>
              )}
              <button
                onClick={() => handleDelete(notification.id)}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('notifications.page.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading && notifications.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header title={t('notifications.page.title')} />
        <main className="p-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">{t('notifications.page.loading')}</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header title={t('notifications.page.title')} />
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-800 font-medium mb-2">{t('notifications.page.error')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button variant="primary" onClick={() => fetchNotifications()}>
              {t('notifications.page.tryAgain')}
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header title={t('notifications.page.title')}>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
              title={t('notifications.page.markAllAsRead')}
            >
              <CheckCheck className="w-5 h-5 text-green-600" />
            </button>
          )}
          <button
            onClick={() => fetchNotifications()}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title={t('notifications.page.refresh')}
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </Header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">{t('notifications.page.unread')}</div>
                <div className="text-xl font-bold text-green-600">{unreadCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                <Check className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Total</div>
                <div className="text-xl font-bold text-gray-600">{notifications.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">{t('notifications.page.unread')}</h2>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {unreadNotifications.length}
              </span>
            </div>

            <div className="space-y-3">
              {unreadNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">{t('notifications.page.read')}</h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {readNotifications.length}
              </span>
            </div>

            <div className="space-y-3">
              {readNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-700 mb-2">{t('notifications.page.noUnread')}</h3>
            <p className="text-gray-500">{t('notifications.page.allCaughtUp')}</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
