import React from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { cn } from '../../lib/utils';

export interface TutorLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  onBackClick?: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const TutorLayout = React.forwardRef<HTMLDivElement, TutorLayoutProps>(
  (
    {
      title,
      subtitle,
      showBackButton = false,
      showNotifications = true,
      onBackClick,
      headerAction,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { user } = useAuth();

    return (
      <div
        ref={ref}
        className={cn('bg-gray-50 min-h-screen flex flex-col pb-20', className)}
        {...props}
      >
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          showNotifications={showNotifications}
          onBackClick={onBackClick}
        >
          {headerAction}
        </Header>

        {/* Main Content */}
        <main className="flex-grow p-4">
          {children}
        </main>

        {/* Bottom Navigation (Footer for Tutor) */}
        <BottomNavigation role="tutor" />
      </div>
    );
  }
);

TutorLayout.displayName = 'TutorLayout';
