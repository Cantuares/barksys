import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../users/entities/user.entity';

export enum PetSpecies {
  DOG = 'dog',
  OTHER = 'other',
}

export enum PetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ tableName: 'pets' })
export class Pet {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => User, { fieldName: 'tutor_id' })
  tutor: User;

  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Enum({ items: () => PetSpecies, default: PetSpecies.DOG })
  species: PetSpecies = PetSpecies.DOG;

  @Property({ type: 'varchar', length: 255, nullable: true })
  breed?: string;

  @Property({ type: 'date', nullable: true })
  birth?: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Enum({ items: () => PetStatus, default: PetStatus.ACTIVE })
  status: PetStatus = PetStatus.ACTIVE;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
