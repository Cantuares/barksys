export class AvailabilityConfiguredEvent {
  constructor(
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly trainerEmail: string,
    public readonly workStartTime: string,
    public readonly workEndTime: string,
    public readonly workingDays: string[],
    public readonly companyId: string,
    public readonly isUpdate: boolean,
  ) {}
}
