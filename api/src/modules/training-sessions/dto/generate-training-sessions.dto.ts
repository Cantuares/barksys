import { IsDateString, IsUUID } from 'class-validator';

export class GenerateTrainingSessionsDto {
  @IsUUID()
  templateId: string;

  @IsDateString()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  endDate: string; // YYYY-MM-DD
}
