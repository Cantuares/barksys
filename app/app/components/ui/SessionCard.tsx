import React from 'react';
import { Calendar, Clock, Users, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils/date';
import { Button } from './Button';
import type { TrainingSession } from '../../types/training-session.types';

interface SessionCardProps {
  session: TrainingSession;
  onViewDetails?: (sessionId: string) => void;
  onEnroll?: (sessionId: string) => void;
  showEnrollButton?: boolean;
  className?: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onViewDetails,
  onEnroll,
  showEnrollButton = false,
  className
}) => {
  const { t } = useTranslation();
  const { id, date, startTime, endTime, availableSlots, maxParticipants, status, trainer, package: pkg } = session;

  const getStatusBadge = () => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      scheduled: 'bg-green-100 text-green-700',
      confirmed: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-600',
      no_show: 'bg-orange-100 text-orange-700',
    };

    const labels = {
      active: t('sessions.status.active'),
      scheduled: t('sessions.status.scheduled'),
      confirmed: t('sessions.status.confirmed'),
      in_progress: t('sessions.status.inProgress'),
      completed: t('sessions.status.completed'),
      cancelled: t('sessions.status.cancelled'),
      expired: t('sessions.status.expired'),
      no_show: t('sessions.status.noShow'),
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getSlotsIndicator = () => {
    const percentage = (availableSlots / maxParticipants) * 100;
    let color = 'bg-green-500';

    if (percentage <= 25) {
      color = 'bg-red-500';
    } else if (percentage <= 50) {
      color = 'bg-yellow-500';
    }

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">{t('sessions.availableSlots')}</span>
          <span className="font-semibold text-gray-900">{availableSlots}/{maxParticipants}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {pkg && (
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              {pkg.name}
            </h3>
          )}
          {pkg?.description && (
            <p className="text-sm text-gray-600">
              {pkg.description}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Calendar className="h-5 w-5 text-green-600" />
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Clock className="h-5 w-5 text-green-600" />
          <span>{startTime} - {endTime}</span>
        </div>
        {trainer && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <User className="h-5 w-5 text-green-600" />
            <span>{trainer.fullName}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Users className="h-5 w-5 text-green-600" />
          <span>{maxParticipants - availableSlots}/{maxParticipants} {t('sessions.enrolled')}</span>
        </div>
      </div>

      {getSlotsIndicator()}

      {(onViewDetails || (onEnroll && showEnrollButton)) && (
        <div className="flex gap-3 mt-6">
          {onViewDetails && (
            <Button
              variant="outline"
              size="md"
              onClick={() => onViewDetails(id)}
              className="flex-1"
            >
              {t('sessions.viewDetails')}
            </Button>
          )}
          {onEnroll && showEnrollButton && availableSlots > 0 && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onEnroll(id)}
              disabled={availableSlots === 0}
              className="flex-1"
            >
              {t('sessions.enroll')}
            </Button>
          )}
        </div>
      )}

      {availableSlots === 0 && (
        <div className="mt-4 text-center text-sm text-red-600 font-medium">
          {t('sessions.sessionFull')}
        </div>
      )}
    </div>
  );
};
