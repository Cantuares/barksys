export class PackageCreatedEvent {
  constructor(
    public readonly packageId: string,
    public readonly packageName: string,
    public readonly totalSessions: number,
    public readonly companyId: string,
  ) {}
}
