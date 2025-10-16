import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, PawPrint, Menu, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
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

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
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
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              onClick={handleBackClick}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="bg-primary-500 text-white p-2 rounded-full">
              <PawPrint className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          
          {showNotifications && (
            <div className="relative">
              <button 
                className="p-2 rounded-full bg-gray-100 relative hover:bg-gray-200 transition-colors"
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
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