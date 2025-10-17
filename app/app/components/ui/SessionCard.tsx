import React from 'react';
import { Calendar, Clock, Users, User } from 'lucide-react';
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
  const { id, date, startTime, endTime, availableSlots, maxParticipants, status, trainer, package: pkg } = session;

  const getStatusBadge = () => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-600',
      no_show: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      active: 'Ativa',
      scheduled: 'Agendada',
      confirmed: 'Confirmada',
      in_progress: 'Em Progresso',
      completed: 'Completa',
      cancelled: 'Cancelada',
      expired: 'Expirada',
      no_show: 'Ausência',
    };

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
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
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Vagas disponíveis</span>
          <span className="font-medium">{availableSlots}/{maxParticipants}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {pkg && (
            <h3 className="font-semibold text-gray-900 mb-1">
              {pkg.name}
            </h3>
          )}
          {pkg?.description && (
            <p className="text-sm text-gray-600 mb-2">
              {pkg.description}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-green-500" />
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-green-500" />
          <span>{startTime} - {endTime}</span>
        </div>
        {trainer && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-green-500" />
            <span>{trainer.fullName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-green-500" />
          <span>{maxParticipants - availableSlots}/{maxParticipants} inscritos</span>
        </div>
      </div>

      {getSlotsIndicator()}

      {(onViewDetails || (onEnroll && showEnrollButton)) && (
        <div className="flex gap-2 mt-4">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(id)}
              className="flex-1"
            >
              Ver Detalhes
            </Button>
          )}
          {onEnroll && showEnrollButton && availableSlots > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEnroll(id)}
              disabled={availableSlots === 0}
              className="flex-1"
            >
              Inscrever
            </Button>
          )}
        </div>
      )}

      {availableSlots === 0 && (
        <div className="mt-3 text-center text-sm text-red-600 font-medium">
          Sessão lotada
        </div>
      )}
    </div>
  );
};
