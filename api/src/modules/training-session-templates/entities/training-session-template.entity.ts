import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { Package } from '../../packages/entities/package.entity';
import { User } from '../../users/entities/user.entity';

export enum Recurrence {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
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

@Entity({ tableName: 'training_session_templates' })
export class TrainingSessionTemplate {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => Package, { fieldName: 'package_id' })
  package: Package;

  @ManyToOne(() => User, { fieldName: 'trainer_id' })
  trainer: User;

  @Property({ fieldName: 'start_time', type: 'varchar', length: 10 })
  startTime: string; // HH:mm format

  @Property({ fieldName: 'end_time', type: 'varchar', length: 10 })
  endTime: string; // HH:mm format

  @Property({ fieldName: 'max_participants', type: 'int', default: 1 })
  maxParticipants: number = 1;

  @Enum({ items: () => Recurrence, default: Recurrence.WEEKLY })
  recurrence: Recurrence = Recurrence.WEEKLY;

  @Property({ type: 'json', nullable: true })
  weekdays?: Weekday[];

  @Property({ fieldName: 'start_date', type: 'date' })
  startDate: Date;

  @Property({ fieldName: 'end_date', type: 'date' })
  endDate: Date;

  @Enum({ items: () => TemplateStatus, default: TemplateStatus.ACTIVE })
  status: TemplateStatus = TemplateStatus.ACTIVE;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
