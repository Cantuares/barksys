import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { PurchaseStatus } from '../entities/package-purchase.entity';

export class UpdatePackagePurchaseDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  usedSessions?: number;

  @IsEnum(PurchaseStatus)
  @IsOptional()
  status?: PurchaseStatus;
}
