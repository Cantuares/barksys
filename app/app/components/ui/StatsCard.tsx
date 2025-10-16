import React from 'react';
import { cn } from '../../lib/utils';

export interface StatsCardData {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  subtitle?: string;
  subtitleColorClass?: string;
}

interface StatsCardProps {
  data: StatsCardData;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ data, className }) => {
  return (
    <div className={cn('bg-white rounded-xl shadow p-4', className)}>
      <div className="flex items-center">
        <div className={cn('p-3 rounded-full', `${data.colorClass}-100`)}>
          <i className={cn('fas', `fa-${data.icon}`, `${data.colorClass}-600`)}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{data.label}</p>
          <p className="text-2xl font-bold text-gray-900">{data.value}</p>
          {data.subtitle && (
            <p className={cn('text-xs mt-1', data.subtitleColorClass || 'text-gray-600')}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
