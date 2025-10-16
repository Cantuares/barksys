import { Entity, PrimaryKey, Property, ManyToOne, Enum, Unique, Index, BeforeCreate } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { TrainingSession } from '../../training-sessions/entities/training-session.entity';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ENROLLED = 'enrolled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity({ tableName: 'training_session_enrollments' })
export class TrainingSessionEnrollment {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => TrainingSession, { fieldName: 'training_session_id' })
  trainingSession: TrainingSession;

  @ManyToOne(() => User, { fieldName: 'tutor_id' })
  tutor: User;

  @ManyToOne(() => Pet, { fieldName: 'pet_id' })
  pet: Pet;

  @Property({ fieldName: 'enrollment_date', type: 'timestamptz' })
  enrollmentDate: Date = new Date();

  @Enum({ items: () => EnrollmentStatus, default: EnrollmentStatus.ENROLLED })
  status: EnrollmentStatus = EnrollmentStatus.ENROLLED;

  @Property({ fieldName: 'confirmation_token', type: 'uuid' })
  @Unique()
  @Index()
  confirmationToken: string = uuidv7();

  @Property({ fieldName: 'cancellation_token', type: 'uuid' })
  @Unique()
  @Index()
  cancellationToken: string = uuidv7();

  @Property({ fieldName: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Property({ fieldName: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Property({ fieldName: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt?: Date;

  @Property({ fieldName: 'no_show_at', type: 'timestamp', nullable: true })
  noShowAt?: Date;

  @Property({ fieldName: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @BeforeCreate()
  ensureTokens() {
    if (!this.confirmationToken) {
      this.confirmationToken = uuidv7();
    }
    if (!this.cancellationToken) {
      this.cancellationToken = uuidv7();
    }
  }
}
