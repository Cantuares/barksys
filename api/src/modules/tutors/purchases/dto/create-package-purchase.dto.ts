import { IsUUID } from 'class-validator';

export class CreatePackagePurchaseDto {
  @IsUUID()
  tutorId: string;

  @IsUUID()
  packageId: string;
}
