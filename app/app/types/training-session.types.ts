/**
 * Training Session Types
 * Based on API DTOs from /api/src/modules/training-sessions
 */

export enum TrainingSessionStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  NO_SHOW = 'no_show',
}

export interface TrainingSession {
  id: string;
  trainingSessionKey: string;
  templateId?: string;
  packageId: string;
  trainerId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  maxParticipants: number;
  availableSlots: number;
  status: TrainingSessionStatus;
  createdAt: string;
  updatedAt: string;

  // Populated fields (when expanded)
  package?: {
    id: string;
    name: string;
    description?: string;
  };
  trainer?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface CreateTrainingSessionData {
  templateId?: string;
  packageId: string;
  trainerId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxParticipants: number;
  status?: TrainingSessionStatus;
}

export interface UpdateTrainingSessionData {
  templateId?: string;
  packageId?: string;
  trainerId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  status?: TrainingSessionStatus;
}

export interface TrainingSessionFilters {
  trainerId?: string;
  packageId?: string;
  page?: number;
  limit?: number;
}
