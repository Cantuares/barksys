import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/hooks/useAuth';
import { UserRole } from '../../types/auth.types';

interface NavigationItem {
  icon: string;
  label: string;
  route?: string;
  action?: 'logout';
}

interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  role?: UserRole;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  role,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Use role from props or fall back to user's role
  const effectiveRole = role || user?.role || UserRole.TUTOR;

  const getNavigationItems = (): NavigationItem[] => {
    const roleNavigation: Record<UserRole, NavigationItem[]> = {
      [UserRole.ADMIN]: [
        { icon: 'fa-home', label: 'Início', route: '/dashboard' },
        { icon: 'fa-chart-bar', label: 'Relatórios', route: '/admin/reports' },
        { icon: 'fa-users', label: 'Equipa', route: '/admin/team' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout' }
      ],
      [UserRole.TRAINER]: [
        { icon: 'fa-home', label: 'Início', route: '/trainer/dashboard' },
        { icon: 'fa-calendar', label: 'Agenda', route: '/trainer/schedule' },
        { icon: 'fa-users', label: 'Inscrições', route: '/trainer/enrollments' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout' }
      ],
      [UserRole.TUTOR]: [
        { icon: 'fa-home', label: 'Início', route: '/tutor/dashboard' },
        { icon: 'fa-calendar', label: 'Sessões', route: '/tutor/sessions' },
        { icon: 'fa-paw', label: 'Meus Pets', route: '/tutor/pets' },
        { icon: 'fa-box', label: 'Pacotes', route: '/tutor/packages' },
        { icon: 'fa-sign-out-alt', label: 'Sair', action: 'logout' }
      ]
    };

    return roleNavigation[effectiveRole];
  };

  const isRouteActive = (itemRoute?: string): boolean => {
    if (!itemRoute) return false;
    return location.pathname.startsWith(itemRoute);
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
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10', className)} {...props}>
      <div className={cn(
        'grid',
        navigationItems.length === 4 ? 'grid-cols-4' :
        navigationItems.length === 5 ? 'grid-cols-5' :
        'grid-cols-3'
      )}>
        {navigationItems.map((item, index) => {
          const isActive = isRouteActive(item.route);

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'flex flex-col items-center py-3 transition-colors hover:bg-gray-50 active:bg-gray-100',
                isActive ? 'text-primary-500' : 'text-gray-500'
              )}
              onClick={(e) => handleItemClick(item, e)}
            >
              <i className={`fas ${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};