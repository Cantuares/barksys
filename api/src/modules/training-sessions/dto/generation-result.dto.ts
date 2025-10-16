export class TrainingSessionGenerationResultDto {
  success: boolean;
  message: string;
  generated: number;
  skipped: number;
  conflicts: Array<{
    date: string;
    reason: string;
  }>;
  trainingSessions: Array<{
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  }>;
}
