import { IsUUID, IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Recurrence, Weekday, TemplateStatus } from '../entities/training-session-template.entity';

export class CreateTrainingSessionTemplateDto {
  @ApiProperty({
    description: 'Package UUID',
    example: '0199e9d5-ae03-77e7-8379-a2801b92cae4',
  })
  @IsUUID()
  packageId: string;

  @ApiProperty({
    description: 'Trainer UUID (Admin can assign any trainer, Trainer can only assign themselves)',
    example: '0199e9e7-4abf-71b5-84a4-533a4354f775',
  })
  @IsUUID()
  trainerId: string;

  @ApiProperty({
    description: 'Session start time in HH:mm format',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({
    description: 'Session end time in HH:mm format',
    example: '11:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @ApiProperty({
    description: 'Maximum number of participants',
    example: 3,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({
    description: 'Session recurrence pattern',
    enum: Recurrence,
    example: Recurrence.WEEKLY,
    default: Recurrence.WEEKLY,
    required: false,
  })
  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @ApiProperty({
    description: 'Weekdays when sessions occur (for weekly recurrence)',
    type: [String],
    enum: Weekday,
    example: ['monday', 'wednesday', 'friday'],
    required: false,
  })
  @IsArray()
  @IsEnum(Weekday, { each: true })
  @IsOptional()
  weekdays?: Weekday[];

  @ApiProperty({
    description: 'Template start date (ISO date string)',
    example: '2025-10-20',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Template end date (ISO date string)',
    example: '2025-12-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Template status',
    enum: TemplateStatus,
    example: TemplateStatus.ACTIVE,
    default: TemplateStatus.ACTIVE,
    required: false,
  })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}
