import { Entity, PrimaryKey, Property, ManyToOne, Unique, Index } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../../users/entities/user.entity';

export interface WorkingDays {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

@Entity({ tableName: 'trainer_availability_configs' })
export class TrainerAvailabilityConfig {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => User, { fieldName: 'trainer_id' })
  @Unique()
  @Index()
  trainer: User;

  @Property({ fieldName: 'work_start_time', type: 'time' })
  workStartTime: string; // HH:mm format

  @Property({ fieldName: 'work_end_time', type: 'time' })
  workEndTime: string; // HH:mm format

  @Property({ fieldName: 'slot_duration_minutes', type: 'int' })
  slotDurationMinutes: number;

  @Property({ fieldName: 'lunch_break_start', type: 'time', nullable: true })
  lunchBreakStart?: string; // HH:mm format

  @Property({ fieldName: 'lunch_break_end', type: 'time', nullable: true })
  lunchBreakEnd?: string; // HH:mm format

  @Property({ fieldName: 'break_time_start', type: 'time', nullable: true })
  breakTimeStart?: string; // HH:mm format

  @Property({ fieldName: 'break_time_end', type: 'time', nullable: true })
  breakTimeEnd?: string; // HH:mm format

  @Property({ fieldName: 'working_days', type: 'json', default: '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}' })
  workingDays: WorkingDays = {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
  };

  @Property({ type: 'varchar', length: 50, default: 'America/Sao_Paulo' })
  timezone: string = 'America/Sao_Paulo';

  @Property({ fieldName: 'buffer_time_minutes', type: 'int', nullable: true })
  bufferTimeMinutes?: number;

  @Property({ fieldName: 'max_bookings_per_day', type: 'int', nullable: true })
  maxBookingsPerDay?: number;

  @Property({ fieldName: 'advance_booking_days', type: 'int', default: 30 })
  advanceBookingDays: number = 30;

  @Property({ fieldName: 'min_notice_hours', type: 'int', default: 24 })
  minNoticeHours: number = 24;

  @Property({ fieldName: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean = true;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
