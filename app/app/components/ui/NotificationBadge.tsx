import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationBadgeProps extends React.HTMLAttributes<HTMLButtonElement> {
  unreadCount?: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  unreadCount = 0, 
  className, 
  ...props 
}) => {
  const badgeColorClass = unreadCount > 0 ? 'bg-red-500' : 'bg-gray-400';

  return (
    <button 
      className={cn(
        'p-2 rounded-full bg-gray-100 relative hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      type="button"
      {...props}
    >
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span 
          className={cn(
            'absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse',
            badgeColorClass
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
