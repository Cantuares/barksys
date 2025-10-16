import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserRole } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class TrainersService {
  constructor(private readonly em: EntityManager) {}

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<User[]> {
    return this.em.find(
      User,
      { company, role: UserRole.TRAINER },
      { limit, offset, orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, company: Company): Promise<User | null> {
    return this.em.findOne(User, { id, company, role: UserRole.TRAINER });
  }

  async countByCompany(company: Company): Promise<number> {
    return this.em.count(User, { company, role: UserRole.TRAINER });
  }

  async update(id: string, company: Company, updateData: Partial<User>): Promise<User> {
    const trainer = await this.findById(id, company);

    if (!trainer) {
      throw new Error('Trainer not found');
    }

    // Prevent changing role
    delete updateData.role;
    delete updateData.company;

    Object.assign(trainer, updateData);
    trainer.updatedAt = new Date();

    await this.em.persistAndFlush(trainer);
    return trainer;
  }

  async delete(id: string, company: Company): Promise<void> {
    const trainer = await this.findById(id, company);

    if (!trainer) {
      throw new Error('Trainer not found');
    }

    await this.em.removeAndFlush(trainer);
  }
}
