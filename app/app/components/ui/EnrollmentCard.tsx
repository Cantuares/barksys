import React from 'react';
import { Calendar, Clock, X, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { formatDate } from '../../lib/utils/date';
import type { Enrollment } from '../../types/enrollment.types';

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onCancel?: (enrollmentId: string) => void;
  onViewSession?: (sessionId: string) => void;
  showCancelButton?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  onCancel,
  onViewSession,
  showCancelButton = true,
  isLoading = false,
  className,
}) => {
  const { trainingSession, pet, status } = enrollment;

  const getStatusBadge = () => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Completo',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
        {labels[status]}
      </span>
    );
  };

  const getCountdown = () => {
    if (!trainingSession?.date) return null;

    const sessionDate = new Date(`${trainingSession.date}T${trainingSession.startTime}`);
    const now = new Date();
    const diff = sessionDate.getTime() - now.getTime();

    if (diff < 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `Em ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    if (hours > 0) {
      return `Em ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    return 'Hoje';
  };

  const canCancel = () => {
    if (status === 'cancelled' || status === 'completed') return false;
    if (!trainingSession?.date) return false;

    const sessionDate = new Date(`${trainingSession.date}T${trainingSession.startTime}`);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel if more than 24 hours before session
    return hoursUntilSession > 24;
  };

  const countdown = getCountdown();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${className || ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {pet?.name || 'Pet'}
          </h3>
          <p className="text-sm text-gray-600">
            {pet?.species && pet?.breed ? `${pet.species} - ${pet.breed}` : pet?.species || ''}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {trainingSession && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-green-500" />
            <span>{formatDate(trainingSession.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-green-500" />
            <span>{trainingSession.startTime} - {trainingSession.endTime}</span>
          </div>
        </div>
      )}

      {countdown && status !== 'cancelled' && status !== 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-sm font-medium text-green-700">{countdown}</p>
        </div>
      )}

      <div className="flex gap-2">
        {onViewSession && trainingSession && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewSession(trainingSession.id)}
            className="flex-1"
          >
            Ver Sessão
          </Button>
        )}

        {showCancelButton && canCancel() && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(enrollment.id)}
            loading={isLoading}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        )}
      </div>

      {status === 'confirmed' && !canCancel() && (
        <p className="text-xs text-gray-500 mt-2">
          Cancelamento apenas disponível até 24h antes da sessão
        </p>
      )}
    </div>
  );
};
