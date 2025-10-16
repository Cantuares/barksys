export class PetCreatedEvent {
  constructor(
    public readonly petId: string,
    public readonly petName: string,
    public readonly tutorId: string,
    public readonly tutorName: string,
    public readonly companyId: string,
  ) {}
}
