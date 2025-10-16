export class PackagePurchasedEvent {
  constructor(
    public readonly purchaseId: string,
    public readonly tutorId: string,
    public readonly tutorName: string,
    public readonly tutorEmail: string,
    public readonly packageId: string,
    public readonly packageName: string,
    public readonly totalSessions: number,
    public readonly companyId: string,
  ) {}
}
