import { TrainingSessionEnrollment } from '../entities/training-session-enrollment.entity';

export class TrainingSessionEnrollmentResponseDto {
  id: string;
  trainingSessionId: string;
  tutorId: string;
  petId: string;
  enrollmentDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(enrollment: TrainingSessionEnrollment): TrainingSessionEnrollmentResponseDto {
    return {
      id: enrollment.id,
      trainingSessionId: typeof enrollment.trainingSession === 'object' ? enrollment.trainingSession.id : enrollment.trainingSession,
      tutorId: typeof enrollment.tutor === 'object' ? enrollment.tutor.id : enrollment.tutor,
      petId: typeof enrollment.pet === 'object' ? enrollment.pet.id : enrollment.pet,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }
}
