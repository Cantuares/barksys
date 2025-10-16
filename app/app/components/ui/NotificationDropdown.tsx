import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: 'Nova sessão agendada',
      message: 'Sessão de treino agendada para amanhã às 14:00',
      time: '2 min atrás',
      unread: true
    },
    {
      id: 2,
      title: 'Pagamento confirmado',
      message: 'Pagamento do pacote Premium confirmado',
      time: '1 hora atrás',
      unread: true
    },
    {
      id: 3,
      title: 'Lembrete de sessão',
      message: 'Sua sessão começa em 30 minutos',
      time: '3 horas atrás',
      unread: false
    }
  ];

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
        <h3 className="font-semibold text-gray-800">Notificações</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.map((notification) => (
          <div 
            key={notification.id}
            className={cn(
              'p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors',
              notification.unread && 'bg-blue-50'
            )}
          >
            <div className="flex items-start space-x-3">
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                notification.unread ? 'bg-blue-500' : 'bg-gray-300'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver todas as notificações
        </button>
      </div>
    </div>
  );
};
