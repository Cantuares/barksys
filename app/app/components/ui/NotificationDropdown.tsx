import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { formatTimeAgo } from '../../lib/utils/index';
import { useNotificationStore } from '../../lib/stores/notifications.store';

interface NotificationDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen = false,
  onToggle,
  className,
  ...props
}) => {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead, isLoading } = useNotificationStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setIsFirstLoad(true);
      fetchNotifications({ limit: 5 }).finally(() => {
        setIsFirstLoad(false);
      });
    }
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    try {
      await markAsRead(notificationId);
      onToggle?.();

      if (actionUrl) {
        navigate(actionUrl);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewAll = () => {
    onToggle?.();
    navigate('/notifications');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        'absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50',
        className
      )}
      {...props}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">{t('notifications.dropdown.title')}</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading && isFirstLoad ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">{t('notifications.dropdown.loading')}</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">{t('notifications.dropdown.empty')}</p>
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
              className={cn(
                'p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
                !notification.read && 'bg-green-50'
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  !notification.read ? 'bg-green-500' : 'bg-gray-300'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {recentNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('notifications.dropdown.viewAll')}
          </button>
        </div>
      )}
    </div>
  );
};
