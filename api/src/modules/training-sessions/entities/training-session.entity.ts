import { Entity, PrimaryKey, Property, ManyToOne, Enum, BeforeCreate, Unique, Index } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { TrainingSessionTemplate } from '../../training-session-templates/entities/training-session-template.entity';
import { Package } from '../../packages/entities/package.entity';
import { User } from '../../users/entities/user.entity';

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

@Entity({ tableName: 'training_sessions' })
export class TrainingSession {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property({ fieldName: 'training_session_key', type: 'uuid' })
  @Unique()
  @Index()
  trainingSessionKey: string = uuidv7();

  @ManyToOne(() => TrainingSessionTemplate, { fieldName: 'template_id', nullable: true })
  template?: TrainingSessionTemplate;

  @ManyToOne(() => Package, { fieldName: 'package_id' })
  package: Package;

  @ManyToOne(() => User, { fieldName: 'trainer_id' })
  trainer: User;

  @Property({ type: 'date' })
  date: Date;

  @Property({ fieldName: 'start_time', type: 'varchar', length: 10 })
  startTime: string; // HH:mm format

  @Property({ fieldName: 'end_time', type: 'varchar', length: 10 })
  endTime: string; // HH:mm format

  @Property({ fieldName: 'max_participants', type: 'int', default: 1 })
  maxParticipants: number = 1;

  @Property({ fieldName: 'available_slots', type: 'int', default: 1 })
  availableSlots: number = 1;

  @Enum({ items: () => TrainingSessionStatus, default: TrainingSessionStatus.ACTIVE })
  status: TrainingSessionStatus = TrainingSessionStatus.ACTIVE;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ fieldName: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Property({ fieldName: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Property({ fieldName: 'in_progress_at', type: 'timestamp', nullable: true })
  inProgressAt?: Date;

  @Property({ fieldName: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Property({ fieldName: 'no_show_at', type: 'timestamp', nullable: true })
  noShowAt?: Date;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @BeforeCreate()
  ensureTrainingSessionKey() {
    if (!this.trainingSessionKey) {
      this.trainingSessionKey = uuidv7();
    }
  }
}
