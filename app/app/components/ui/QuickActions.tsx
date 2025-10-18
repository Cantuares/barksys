import React from 'react';
import { cn } from '../../lib/utils';

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconBgColor: string;
  hoverBgColor: string;
  onClick: () => void;
}

interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  actions,
  columns = 2,
  className
}) => {
  const gridCols = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6', className)}>
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className={cn('grid gap-4', gridCols[columns])}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={cn(
                'flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 min-h-[120px]',
                action.hoverBgColor
              )}
              onClick={action.onClick}
            >
              <div className={cn('inline-flex items-center justify-center p-3 rounded-full', action.iconBgColor)}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
