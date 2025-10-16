export class TrainerCreatedEvent {
  constructor(
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly trainerEmail: string,
    public readonly companyId: string,
    public readonly createdByUserId: string,
    public readonly createdByUserName: string,
  ) {}
}
