import React from 'react';
import { cn } from '../../lib/utils';

export interface StatsCardData {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBgColor: string;
  subtitle?: string;
  subtitleColor?: string;
}

interface StatsCardProps {
  data: StatsCardData;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ data, className }) => {
  const Icon = data.icon;

  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6', className)}>
      <div className="flex items-center gap-4">
        <div className={cn('inline-flex items-center justify-center p-3 rounded-full', data.iconBgColor)}>
          <Icon className={cn('h-6 w-6', data.iconColor)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{data.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.value}</p>
          {data.subtitle && (
            <p className={cn('text-xs mt-1', data.subtitleColor || 'text-gray-600')}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
