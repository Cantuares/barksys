import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Dog, Menu, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotificationStore } from '../../lib/stores/notifications.store';
import { useAuthStore } from '../../lib/stores/auth.store';
import { UserRole } from '../../types/auth.types';
import { NotificationBadge } from '../ui/NotificationBadge';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  showMenuButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showNotifications = true,
  showMenuButton = false,
  onBackClick,
  onMenuClick,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (showNotifications) {
      // Fetch unread count immediately
      fetchUnreadCount();

      // Start polling every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [showNotifications]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleLogoClick = () => {
    if (!user) return;

    switch (user.role) {
      case UserRole.ADMIN:
        navigate('/dashboard');
        break;
      case UserRole.TRAINER:
        navigate('/trainer/dashboard');
        break;
      case UserRole.TUTOR:
        navigate('/tutor/dashboard');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className={cn('bg-white shadow-sm sticky top-0 z-10', className)} {...props}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <button
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-colors"
              onClick={handleBackClick}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button
              className="p-2 -ml-2 text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-colors"
              onClick={handleLogoClick}
              type="button"
              aria-label="Ir para dashboard"
            >
              <Dog className="h-7 w-7" />
            </button>
          )}
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          {showNotifications && (
            <div className="relative">
              <button
                className="p-2 rounded-full bg-gray-100 relative hover:bg-gray-200 transition-colors"
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onToggle={toggleNotifications}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};