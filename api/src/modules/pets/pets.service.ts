import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Pet, PetSpecies, PetStatus } from './entities/pet.entity';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { PetCreatedEvent } from './events/pet-created.event';

@Injectable()
export class PetsService {
  constructor(
    private readonly em: EntityManager,
    private readonly i18n: I18nService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createPetDto: CreatePetDto, currentUser: User, company: Company): Promise<Pet> {
    const lang = I18nContext.current()?.lang || 'en';

    // Determine tutorId: use provided value or current user if tutor
    const tutorId = createPetDto.tutorId ?? (currentUser.role === UserRole.TUTOR ? currentUser.id : undefined);

    if (!tutorId) {
      throw new BadRequestException(this.i18n.translate('pets.errors.tutorIdRequired', { lang }));
    }

    if (currentUser.role === UserRole.TUTOR && tutorId !== currentUser.id) {
      throw new BadRequestException(this.i18n.translate('pets.errors.tutorCanOnlyCreateForSelf', { lang }));
    }

    // Verify tutor belongs to company
    const tutor = await this.em.findOne(User, {
      id: tutorId,
      company,
      role: UserRole.TUTOR
    });

    if (!tutor) {
      throw new BadRequestException(
        this.i18n.translate('pets.errors.tutorNotFound', {
          lang,
          args: { tutorId }
        })
      );
    }

    const pet = this.em.create(Pet, {
      tutor,
      name: createPetDto.name,
      species: createPetDto.species ?? PetSpecies.DOG,
      breed: createPetDto.breed,
      birth: createPetDto.birth ? new Date(createPetDto.birth) : undefined,
      weight: createPetDto.weight,
      description: createPetDto.description,
      status: createPetDto.status ?? PetStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(pet);

    // Emit event
    this.eventEmitter.emit(
      'pet.created',
      new PetCreatedEvent(
        pet.id,
        pet.name,
        tutor.id,
        tutor.fullName,
        typeof tutor.company === 'object' ? tutor.company.id : tutor.company || '',
      ),
    );

    return pet;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<Pet[]> {
    // Find pets whose tutors belong to this company
    return this.em.find(
      Pet,
      { tutor: { company, role: UserRole.TUTOR } },
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: ['tutor']
      }
    );
  }

  async findById(id: string, company: Company): Promise<Pet | null> {
    return this.em.findOne(
      Pet,
      { id, tutor: { company, role: UserRole.TUTOR } },
      { populate: ['tutor'] }
    );
  }

  async findByTutor(tutorId: string, company: Company): Promise<Pet[]> {
    return this.em.find(
      Pet,
      { tutor: { id: tutorId, company, role: UserRole.TUTOR } },
      { populate: ['tutor'] }
    );
  }

  async update(id: string, company: Company, updateData: Partial<Pet>): Promise<Pet> {
    const pet = await this.findById(id, company);

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Prevent changing tutor
    delete updateData.tutor;

    Object.assign(pet, updateData);
    pet.updatedAt = new Date();

    await this.em.persistAndFlush(pet);
    return pet;
  }

  async delete(id: string, company: Company): Promise<void> {
    const pet = await this.findById(id, company);

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    await this.em.removeAndFlush(pet);
  }
}
