import React from 'react';
import { cn } from '../../lib/utils';

export interface QuickAction {
  icon: string;
  label: string;
  colorClass: string;
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
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={cn('bg-white rounded-xl shadow p-4', className)}>
      <h2 className="font-bold text-lg mb-3">{title}</h2>
      <div className={cn('grid gap-3', gridCols[columns])}>
        {actions.map((action, index) => (
          <button
            key={index}
            className={cn(
              'flex flex-col items-center p-3 rounded-lg transition-colors hover:bg-opacity-80',
              `${action.colorClass}-50 hover:${action.colorClass}-100`
            )}
            onClick={action.onClick}
          >
            <div className={cn('text-white p-3 rounded-full mb-2', action.colorClass === 'primary' ? 'bg-primary-500' : `bg-${action.colorClass}-500`)}>
              <i className={cn('fas', `fa-${action.icon}`)}></i>
            </div>
            <span className="text-xs text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
