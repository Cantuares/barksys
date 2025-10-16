import { IsString, IsInt, Min, Max, IsOptional, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingDaysDto } from './working-days.dto';

export class CreateAvailabilityConfigDto {
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'workStartTime must be in HH:mm format' })
  workStartTime: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'workEndTime must be in HH:mm format' })
  workEndTime: string;

  @IsInt()
  @Min(5)
  @Max(480)
  slotDurationMinutes: number;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'lunchBreakStart must be in HH:mm format' })
  lunchBreakStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'lunchBreakEnd must be in HH:mm format' })
  lunchBreakEnd?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'breakTimeStart must be in HH:mm format' })
  breakTimeStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'breakTimeEnd must be in HH:mm format' })
  breakTimeEnd?: string;

  @ValidateNested()
  @Type(() => WorkingDaysDto)
  workingDays: WorkingDaysDto;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBookingsPerDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  advanceBookingDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minNoticeHours?: number;
}
