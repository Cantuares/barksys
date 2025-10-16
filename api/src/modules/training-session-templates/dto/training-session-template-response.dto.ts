import { TrainingSessionTemplate } from '../entities/training-session-template.entity';

export class TrainingSessionTemplateResponseDto {
  id: string;
  packageId: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  recurrence: string;
  weekdays?: string[];
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(template: TrainingSessionTemplate): TrainingSessionTemplateResponseDto {
    return {
      id: template.id,
      packageId: typeof template.package === 'object' ? template.package.id : template.package,
      trainerId: typeof template.trainer === 'object' ? template.trainer.id : template.trainer,
      startTime: template.startTime,
      endTime: template.endTime,
      maxParticipants: template.maxParticipants,
      recurrence: template.recurrence,
      weekdays: template.weekdays,
      startDate: template.startDate,
      endDate: template.endDate,
      status: template.status,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
