export class TrainingSessionCreatedEvent {
  constructor(
    public readonly trainingSessionId: string,
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly packageId: string,
    public readonly packageName: string,
    public readonly sessionDate: Date,
    public readonly sessionStartTime: string,
    public readonly sessionEndTime: string,
    public readonly companyId: string,
  ) {}
}
