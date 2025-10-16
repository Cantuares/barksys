export class TrainingSessionUpdatedEvent {
  constructor(
    public readonly trainingSessionId: string,
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly trainerEmail: string,
    public readonly packageId: string,
    public readonly packageName: string,
    public readonly oldDate: Date,
    public readonly newDate: Date | undefined,
    public readonly oldStartTime: string,
    public readonly newStartTime: string | undefined,
    public readonly oldEndTime: string,
    public readonly newEndTime: string | undefined,
    public readonly companyId: string,
  ) {}
}
