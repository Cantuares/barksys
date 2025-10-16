import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/hooks/useAuth';

interface NavigationItem {
  icon: string;
  label: string;
  route?: string;
  action?: string;
  active?: boolean;
}

interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  role?: 'admin' | 'trainer' | 'tutor';
  activeRoute?: string;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  role = 'admin', 
  activeRoute = 'home',
  className, 
  ...props 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const getNavigationItems = (): NavigationItem[] => {
    const roleNavigation = {
      admin: [
        { icon: 'fa-home', label: 'Início', route: '/dashboard', active: activeRoute === 'dashboard' },
        { icon: 'fa-chart-bar', label: 'Relatórios', route: '/admin/reports', active: activeRoute === 'reports' },
        { icon: 'fa-users', label: 'Equipa', route: '/admin/team', active: activeRoute === 'team' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout', active: false }
      ],
      trainer: [
        { icon: 'fa-home', label: 'Início', route: '/trainer/dashboard', active: activeRoute === 'dashboard' },
        { icon: 'fa-calendar', label: 'Agenda', route: '/trainer/schedule', active: activeRoute === 'schedule' },
        { icon: 'fa-users', label: 'Inscrições', route: '/trainer/enrollments', active: activeRoute === 'enrollments' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout', active: false }
      ],
      tutor: [
        { icon: 'fa-home', label: 'Início', route: '/tutor/dashboard', active: activeRoute === 'dashboard' },
        { icon: 'fa-calendar', label: 'Sessões', route: '/tutor/sessions', active: activeRoute === 'sessions' },
        { icon: 'fa-paw', label: 'Meus Pets', route: '/tutor/pets', active: activeRoute === 'pets' },
        { icon: 'fa-box', label: 'Pacotes', route: '/tutor/packages', active: activeRoute === 'packages' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout', active: false }
      ]
    };

    return roleNavigation[role];
  };

  const handleItemClick = (item: NavigationItem, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (item.action === 'logout') {
      // Handle logout
      logout();
      return;
    }
    
    // Handle navigation
    if (item.route) {
      navigate(item.route);
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200', className)} {...props}>
      <div className="grid grid-cols-4">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'flex flex-col items-center py-3 transition-colors hover:bg-gray-50 active:bg-gray-100',
              item.active ? 'text-blue-500' : 'text-gray-500'
            )}
            onClick={(e) => handleItemClick(item, e)}
          >
            <i className={`fas ${item.icon} text-xl`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};