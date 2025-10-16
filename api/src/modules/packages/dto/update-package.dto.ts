import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PackageStatus } from '../entities/package.entity';

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalSessions?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  validityDays?: number;

  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;
}
