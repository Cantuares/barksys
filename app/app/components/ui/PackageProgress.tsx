import React from 'react';
import { cn } from '../../lib/utils';

interface PackageProgressProps {
  packageName: string;
  usedSessions: number;
  total: number;
  remaining: number;
  className?: string;
}

export const PackageProgress: React.FC<PackageProgressProps> = ({
  packageName,
  usedSessions,
  total,
  remaining,
  className
}) => {
  const progressPercentage = total > 0 ? (usedSessions / total) * 100 : 0;

  return (
    <div className={cn('p-3 bg-gray-50 rounded-lg', className)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{packageName}</h4>
        <span className="text-sm text-gray-500">{usedSessions}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">{remaining} sessions remaining</p>
    </div>
  );
};
