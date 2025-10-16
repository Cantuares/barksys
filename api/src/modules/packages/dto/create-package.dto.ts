import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PackageStatus } from '../entities/package.entity';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  totalSessions: number;

  @IsNumber()
  @Min(1)
  validityDays: number;

  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;
}
