import { TrainingSession } from '../entities/training-session.entity';

export class TrainingSessionResponseDto {
  id: string;
  trainingSessionKey: string;
  templateId?: string;
  packageId: string;
  package?: {
    id: string;
    name: string;
    description?: string;
  };
  trainerId: string;
  trainer?: {
    id: string;
    fullName: string;
    email: string;
  };
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSlots: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(trainingSession: TrainingSession): TrainingSessionResponseDto {
    const pkg = typeof trainingSession.package === 'object' ? trainingSession.package : null;
    const trainer = typeof trainingSession.trainer === 'object' ? trainingSession.trainer : null;

    return {
      id: trainingSession.id,
      trainingSessionKey: trainingSession.trainingSessionKey,
      templateId: trainingSession.template ? (typeof trainingSession.template === 'object' ? trainingSession.template.id : trainingSession.template) : undefined,
      packageId: pkg ? pkg.id : (trainingSession.package as unknown as string),
      package: pkg ? {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
      } : undefined,
      trainerId: trainer ? trainer.id : (trainingSession.trainer as unknown as string),
      trainer: trainer ? {
        id: trainer.id,
        fullName: trainer.fullName,
        email: trainer.email,
      } : undefined,
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
