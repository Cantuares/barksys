import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { PetSpecies, PetStatus } from '../entities/pet.entity';

export class CreatePetDto {
  @IsUUID()
  @IsOptional()
  tutorId?: string;

  @IsString()
  name: string;

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
