import { TrainingSession } from '../entities/training-session.entity';

export class TrainingSessionResponseDto {
  id: string;
  trainingSessionKey: string;
  templateId?: string;
  packageId: string;
  trainerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSlots: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(trainingSession: TrainingSession): TrainingSessionResponseDto {
    return {
      id: trainingSession.id,
      trainingSessionKey: trainingSession.trainingSessionKey,
      templateId: trainingSession.template ? (typeof trainingSession.template === 'object' ? trainingSession.template.id : trainingSession.template) : undefined,
      packageId: typeof trainingSession.package === 'object' ? trainingSession.package.id : trainingSession.package,
      trainerId: typeof trainingSession.trainer === 'object' ? trainingSession.trainer.id : trainingSession.trainer,
      date: trainingSession.date,
      startTime: trainingSession.startTime,
      endTime: trainingSession.endTime,
      maxParticipants: trainingSession.maxParticipants,
      availableSlots: trainingSession.availableSlots,
      status: trainingSession.status,
      createdAt: trainingSession.createdAt,
      updatedAt: trainingSession.updatedAt,
    };
  }
}
