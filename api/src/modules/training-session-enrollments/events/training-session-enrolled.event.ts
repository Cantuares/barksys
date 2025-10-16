export class TrainingSessionEnrolledEvent {
  constructor(
    public readonly enrollmentId: string,
    public readonly trainingSessionId: string,
    public readonly tutorId: string,
    public readonly tutorName: string,
    public readonly tutorEmail: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly sessionDate: Date,
    public readonly sessionStartTime: string,
    public readonly sessionEndTime: string,
    public readonly confirmationToken: string,
    public readonly cancellationToken: string,
  ) {}
}
