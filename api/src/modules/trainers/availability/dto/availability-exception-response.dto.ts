import { ExceptionType } from '../entities/trainer-availability-exception.entity';

export class AvailabilityExceptionResponseDto {
  id: string;
  trainerId: string;
  exceptionDate: Date;
  exceptionType: ExceptionType;
  customStartTime?: string;
  customEndTime?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
