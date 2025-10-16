import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Matches } from 'class-validator';
import { TrainingSessionStatus } from '../entities/training-session.entity';

export class UpdateTrainingSessionDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  availableSlots?: number;

  @IsEnum(TrainingSessionStatus)
  @IsOptional()
  status?: TrainingSessionStatus;
}
