import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TrainingSessionTemplate, Recurrence, TemplateStatus } from './entities/training-session-template.entity';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Package } from '../packages/entities/package.entity';
import { CreateTrainingSessionTemplateDto } from './dto/create-training-session-template.dto';

@Injectable()
export class TrainingSessionTemplatesService {
  constructor(private readonly em: EntityManager) {}

  async create(createTemplateDto: CreateTrainingSessionTemplateDto, company: Company): Promise<TrainingSessionTemplate> {
    // Verify trainer belongs to company
    const trainer = await this.em.findOne(User, {
      id: createTemplateDto.trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new BadRequestException('Trainer not found or does not belong to your company');
    }

    // Verify package belongs to company
    const pkg = await this.em.findOne(Package, {
      id: createTemplateDto.packageId,
      company,
    });

    if (!pkg) {
      throw new BadRequestException('Package not found or does not belong to your company');
    }

    const template = this.em.create(TrainingSessionTemplate, {
      trainer,
      package: pkg,
      startTime: createTemplateDto.startTime,
      endTime: createTemplateDto.endTime,
      maxParticipants: createTemplateDto.maxParticipants ?? 1,
      recurrence: createTemplateDto.recurrence ?? Recurrence.WEEKLY,
      weekdays: createTemplateDto.weekdays,
      startDate: new Date(createTemplateDto.startDate),
      endDate: new Date(createTemplateDto.endDate),
      status: createTemplateDto.status ?? TemplateStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(template);
    return template;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<TrainingSessionTemplate[]> {
    return this.em.find(
      TrainingSessionTemplate,
      { trainer: { company, role: UserRole.TRAINER } },
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: ['trainer', 'package'],
      }
    );
  }

  async findByTrainer(trainerId: string, company: Company): Promise<TrainingSessionTemplate[]> {
    return this.em.find(
      TrainingSessionTemplate,
      { trainer: { id: trainerId, company, role: UserRole.TRAINER } },
      { populate: ['trainer', 'package'], orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, company: Company): Promise<TrainingSessionTemplate | null> {
    return this.em.findOne(
      TrainingSessionTemplate,
      { id, trainer: { company, role: UserRole.TRAINER } },
      { populate: ['trainer', 'package'] }
    );
  }

  async update(id: string, company: Company, updateData: Partial<TrainingSessionTemplate>): Promise<TrainingSessionTemplate> {
    const template = await this.findById(id, company);

    if (!template) {
      throw new NotFoundException('Training session template not found');
    }

    // Prevent changing trainer and package
    delete updateData.trainer;
    delete updateData.package;

    Object.assign(template, updateData);
    template.updatedAt = new Date();

    await this.em.persistAndFlush(template);
    return template;
  }

  async delete(id: string, company: Company): Promise<void> {
    const template = await this.findById(id, company);

    if (!template) {
      throw new NotFoundException('Training session template not found');
    }

    await this.em.removeAndFlush(template);
  }
}
