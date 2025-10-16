import { Pet } from '../entities/pet.entity';

export class PetResponseDto {
  id: string;
  tutorId: string;
  name: string;
  species: string;
  breed?: string;
  birth?: Date;
  weight?: number;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(pet: Pet): PetResponseDto {
    return {
      id: pet.id,
      tutorId: typeof pet.tutor === 'object' ? pet.tutor.id : pet.tutor,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birth: pet.birth,
      weight: pet.weight,
      description: pet.description,
      status: pet.status,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }
}
