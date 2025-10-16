import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserRole } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class TutorsService {
  constructor(private readonly em: EntityManager) {}

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<User[]> {
    return this.em.find(
      User,
      { company, role: UserRole.TUTOR },
      { limit, offset, orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, company: Company): Promise<User | null> {
    return this.em.findOne(User, { id, company, role: UserRole.TUTOR });
  }

  async countByCompany(company: Company): Promise<number> {
    return this.em.count(User, { company, role: UserRole.TUTOR });
  }

  async update(id: string, company: Company, updateData: Partial<User>): Promise<User> {
    const tutor = await this.findById(id, company);

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Prevent changing role
    delete updateData.role;
    delete updateData.company;

    Object.assign(tutor, updateData);
    tutor.updatedAt = new Date();

    await this.em.persistAndFlush(tutor);
    return tutor;
  }

  async delete(id: string, company: Company): Promise<void> {
    const tutor = await this.findById(id, company);

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    await this.em.removeAndFlush(tutor);
  }
}
