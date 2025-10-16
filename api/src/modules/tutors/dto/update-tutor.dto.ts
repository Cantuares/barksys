import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTutorDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
