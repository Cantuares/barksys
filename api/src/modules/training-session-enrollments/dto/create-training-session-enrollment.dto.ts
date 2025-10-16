import { IsUUID } from 'class-validator';

export class CreateTrainingSessionEnrollmentDto {
  @IsUUID()
  trainingSessionId: string;

  @IsUUID()
  tutorId: string;

  @IsUUID()
  petId: string;
}
