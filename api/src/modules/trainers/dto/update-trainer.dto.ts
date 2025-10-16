import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTrainerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
