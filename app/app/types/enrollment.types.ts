/**
 * Training Session Enrollment Types
 * Based on API DTOs from /api/src/modules/training-session-enrollments
 */

export enum EnrollmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Enrollment {
  id: string;
  trainingSessionId: string;
  tutorId: string;
  petId: string;
  enrollmentDate: string; // ISO date string - when the enrollment was made
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;

  // Populated fields (when expanded)
  trainingSession?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  tutor?: {
    id: string;
    email: string;
    fullName: string;
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
}

export interface CreateEnrollmentData {
  trainingSessionId: string;
  tutorId: string;
  petId: string;
}

export interface EnrollmentFilters {
  tutorId?: string;
  petId?: string;
  trainingSessionId?: string;
  status?: EnrollmentStatus | EnrollmentStatus[];
  page?: number;
  limit?: number;
}

export interface EnrollmentResponse {
  docs: Enrollment[];
  totalDocs: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
