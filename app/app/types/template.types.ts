/**
 * Training Session Template Types
 * Based on API DTOs from /api/src/modules/training-session-templates
 */

export enum Recurrence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum Weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface TrainingSessionTemplate {
  id: string;
  packageId: string;
  trainerId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  maxParticipants: number;
  recurrence: Recurrence;
  weekdays: Weekday[];
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  status: TemplateStatus;
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

export interface CreateTemplateData {
  packageId: string;
  trainerId: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxParticipants: number;
  recurrence: Recurrence;
  weekdays: Weekday[];
  startDate: string; // ISO date
  endDate: string; // ISO date
  status?: TemplateStatus;
}

export interface UpdateTemplateData {
  packageId?: string;
  trainerId?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  recurrence?: Recurrence;
  weekdays?: Weekday[];
  startDate?: string;
  endDate?: string;
  status?: TemplateStatus;
}

export interface GenerateSessionsData {
  templateId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface GenerateSessionsResult {
  createdCount: number;
  sessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface TemplateFilters {
  trainerId?: string;
  packageId?: string;
  status?: TemplateStatus;
  page?: number;
  limit?: number;
}

export interface TemplateResponse {
  docs: TrainingSessionTemplate[];
  totalDocs: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
