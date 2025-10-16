export class TutorCreatedEvent {
  constructor(
    public readonly tutorId: string,
    public readonly tutorName: string,
    public readonly tutorEmail: string,
    public readonly companyId: string,
    public readonly createdByUserId: string,
    public readonly createdByUserName: string,
  ) {}
}
