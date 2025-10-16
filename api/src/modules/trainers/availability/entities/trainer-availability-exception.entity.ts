import { Entity, PrimaryKey, Property, ManyToOne, Enum, Index, Unique } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../../users/entities/user.entity';

export enum ExceptionType {
  BLOCKED = 'blocked',
  CUSTOM_HOURS = 'custom_hours',
}

@Entity({ tableName: 'trainer_availability_exceptions' })
@Unique({ properties: ['trainer', 'exceptionDate'] })
export class TrainerAvailabilityException {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => User, { fieldName: 'trainer_id' })
  @Index()
  trainer: User;

  @Property({ fieldName: 'exception_date', type: 'date' })
  @Index()
  exceptionDate: Date;

  @Enum({ items: () => ExceptionType, fieldName: 'exception_type' })
  exceptionType: ExceptionType;

  @Property({ fieldName: 'custom_start_time', type: 'time', nullable: true })
  customStartTime?: string; // HH:mm format

  @Property({ fieldName: 'custom_end_time', type: 'time', nullable: true })
  customEndTime?: string; // HH:mm format

  @Property({ type: 'text', nullable: true })
  reason?: string;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
