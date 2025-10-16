import { IsUUID, IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Matches } from 'class-validator';
import { TrainingSessionStatus } from '../entities/training-session.entity';

export class CreateTrainingSessionDto {
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsUUID()
  packageId: string;

  @IsUUID()
  trainerId: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @IsEnum(TrainingSessionStatus)
  @IsOptional()
  status?: TrainingSessionStatus;
}
