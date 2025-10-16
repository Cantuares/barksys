import React from 'react';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils/date';

interface SessionCardProps {
  id: string;
  petName?: string;
  trainerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  enrolledCount?: number;
  maxParticipants?: number;
  className?: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  id,
  petName,
  trainerName,
  date,
  startTime,
  endTime,
  status = 'Scheduled',
  enrolledCount,
  maxParticipants,
  className
}) => {
  return (
    <div className={cn('flex items-center p-3 border border-primary-200 rounded-lg', className)}>
      <div className="bg-primary-100 p-2 rounded-lg mr-3">
        <i className="fas fa-paw text-primary-500"></i>
      </div>
      <div className="flex-1">
        <div className="font-medium">{petName || 'Training Session'}</div>
        <div className="text-sm text-gray-500">{formatDate(date)}, {startTime} - {endTime}</div>
        {trainerName && (
          <div className="text-xs text-gray-500">With {trainerName}</div>
        )}
        {enrolledCount !== undefined && maxParticipants !== undefined && (
          <div className="text-xs text-gray-500">{enrolledCount}/{maxParticipants} enrolled</div>
        )}
      </div>
      <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
        {status}
      </span>
    </div>
  );
};
