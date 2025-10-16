import { IsString, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { PetSpecies, PetStatus } from '../entities/pet.entity';

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(PetSpecies)
  @IsOptional()
  species?: PetSpecies;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDateString()
  @IsOptional()
  birth?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PetStatus)
  @IsOptional()
  status?: PetStatus;
}
