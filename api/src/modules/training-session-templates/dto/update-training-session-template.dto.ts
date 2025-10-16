import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min, Matches } from 'class-validator';
import { Recurrence, Weekday, TemplateStatus } from '../entities/training-session-template.entity';

export class UpdateTrainingSessionTemplateDto {
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

  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @IsArray()
  @IsEnum(Weekday, { each: true })
  @IsOptional()
  weekdays?: Weekday[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}
