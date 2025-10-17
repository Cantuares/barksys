/**
 * Trainer Availability Types
 * Based on API DTOs from /api/src/modules/trainer-availability
 */

export interface WorkingDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface AvailabilityConfig {
  id: string;
  trainerId: string;
  workStartTime: string; // HH:mm format
  workEndTime: string; // HH:mm format
  slotDurationMinutes: number; // 5-480 minutes
  lunchBreakStart?: string; // HH:mm
  lunchBreakEnd?: string; // HH:mm
  breakTimeStart?: string; // HH:mm
  breakTimeEnd?: string; // HH:mm
  workingDays: WorkingDays;
  timezone?: string;
  bufferTimeMinutes?: number;
  maxBookingsPerDay?: number;
  advanceBookingDays?: number;
  minNoticeHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityConfigData {
  workStartTime: string; // HH:mm
  workEndTime: string; // HH:mm
  slotDurationMinutes: number;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  breakTimeStart?: string;
  breakTimeEnd?: string;
  workingDays: WorkingDays;
  timezone?: string;
  bufferTimeMinutes?: number;
  maxBookingsPerDay?: number;
  advanceBookingDays?: number;
  minNoticeHours?: number;
}

export interface UpdateAvailabilityConfigData {
  workStartTime?: string;
  workEndTime?: string;
  slotDurationMinutes?: number;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  breakTimeStart?: string;
  breakTimeEnd?: string;
  workingDays?: WorkingDays;
  timezone?: string;
  bufferTimeMinutes?: number;
  maxBookingsPerDay?: number;
  advanceBookingDays?: number;
  minNoticeHours?: number;
}

export interface AvailabilityException {
  id: string;
  trainerId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  reason: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityExceptionData {
  date: string; // ISO date
  reason: string;
  allDay: boolean;
}

export interface AvailabilityExceptionResponse {
  docs: AvailabilityException[];
  totalDocs: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
