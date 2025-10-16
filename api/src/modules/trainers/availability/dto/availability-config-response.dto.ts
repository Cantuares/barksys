import { WorkingDays } from '../entities/trainer-availability-config.entity';

export class AvailabilityConfigResponseDto {
  id: string;
  trainerId: string;
  workStartTime: string;
  workEndTime: string;
  slotDurationMinutes: number;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  breakTimeStart?: string;
  breakTimeEnd?: string;
  workingDays: WorkingDays;
  timezone: string;
  bufferTimeMinutes?: number;
  maxBookingsPerDay?: number;
  advanceBookingDays: number;
  minNoticeHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
