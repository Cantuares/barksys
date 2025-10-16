export class TrainingSessionEnrollmentCancelledEvent {
  constructor(
    public readonly enrollmentId: string,
    public readonly trainingSessionId: string,
    public readonly tutorId: string,
    public readonly tutorName: string,
    public readonly tutorEmail: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly trainerEmail: string,
    public readonly sessionDate: Date,
    public readonly sessionStartTime: string,
    public readonly sessionEndTime: string,
    public readonly companyId: string,
    public readonly reason?: string,
  ) {}
}
