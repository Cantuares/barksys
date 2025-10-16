import { IsString, IsEnum, IsOptional, IsDateString, Matches, ValidateIf } from 'class-validator';
import { ExceptionType } from '../entities/trainer-availability-exception.entity';

export class CreateAvailabilityExceptionDto {
  @IsDateString()
  exceptionDate: string; // YYYY-MM-DD format

  @IsEnum(ExceptionType)
  exceptionType: ExceptionType;

  @ValidateIf((o) => o.exceptionType === ExceptionType.CUSTOM_HOURS)
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'customStartTime must be in HH:mm format' })
  customStartTime?: string;

  @ValidateIf((o) => o.exceptionType === ExceptionType.CUSTOM_HOURS)
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'customEndTime must be in HH:mm format' })
  customEndTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
