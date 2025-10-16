import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrainingSession, TrainingSessionStatus } from './entities/training-session.entity';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Package } from '../packages/entities/package.entity';
import { TrainingSessionTemplate } from '../training-session-templates/entities/training-session-template.entity';
import { TrainingSessionCreatedEvent } from './events/training-session-created.event';
import { TrainingSessionUpdatedEvent } from './events/training-session-updated.event';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TrainingSessionsService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(trainingSessionData: Omit<TrainingSession, 'id' | 'trainingSessionKey' | 'createdAt' | 'updatedAt' | 'status' | 'maxParticipants' | 'availableSlots' | 'ensureTrainingSessionKey'> & Partial<Pick<TrainingSession, 'status' | 'maxParticipants' | 'availableSlots'>>): Promise<TrainingSession> {
    const trainingSession = this.em.create(TrainingSession, {
      trainingSessionKey: uuidv7(),
      status: TrainingSessionStatus.ACTIVE,
      maxParticipants: 1,
      availableSlots: 1,
      ...trainingSessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(trainingSession);

    // Populate relations for event
    await this.em.populate(trainingSession, ['trainer', 'package', 'trainer.company']);

    const trainer = typeof trainingSession.trainer === 'object' ? trainingSession.trainer : null;
    const pkg = typeof trainingSession.package === 'object' ? trainingSession.package : null;

    // Emit event for notification
    if (trainer && pkg) {
      this.eventEmitter.emit(
        'trainingSession.created',
        new TrainingSessionCreatedEvent(
          trainingSession.id,
          trainer.id,
          trainer.fullName,
          pkg.id,
          pkg.name,
          trainingSession.date,
          trainingSession.startTime,
          trainingSession.endTime,
          trainer.company?.id || '',
        ),
      );
    }

    return trainingSession;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<TrainingSession[]> {
    return this.em.find(
      TrainingSession,
      { trainer: { company, role: UserRole.TRAINER } },
      {
        limit,
        offset,
        orderBy: { date: 'DESC', startTime: 'DESC' },
        populate: ['trainer', 'package', 'template'],
      }
    );
  }

  async findAvailable(company: Company, packageId?: string, limit = 50, offset = 0): Promise<TrainingSession[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter: any = {
      trainer: { company, role: UserRole.TRAINER },
      date: { $gte: today },
      availableSlots: { $gt: 0 },
      status: { $in: [TrainingSessionStatus.SCHEDULED, TrainingSessionStatus.ACTIVE] },
    };

    if (packageId) {
      filter.package = packageId;
    }

    return this.em.find(
      TrainingSession,
      filter,
      {
        limit,
        offset,
        orderBy: { date: 'ASC', startTime: 'ASC' },
        populate: ['trainer', 'package', 'template'],
      }
    );
  }

  async findByTrainer(trainerId: string, company: Company): Promise<TrainingSession[]> {
    return this.em.find(
      TrainingSession,
      { trainer: { id: trainerId, company, role: UserRole.TRAINER } },
      {
        populate: ['trainer', 'package', 'template'],
        orderBy: { date: 'DESC', startTime: 'DESC' },
      }
    );
  }

  async findById(id: string, company: Company, trainerId?: string): Promise<TrainingSession | null> {
    const filter: any = {
      id,
      trainer: { company, role: UserRole.TRAINER }
    };

    if (trainerId) {
      filter.trainer.id = trainerId;
    }

    return this.em.findOne(
      TrainingSession,
      filter,
      { populate: ['trainer', 'package', 'template'] }
    );
  }

  async findByIdGlobal(id: string, company: Company): Promise<TrainingSession | null> {
    return this.em.findOne(
      TrainingSession,
      { id, trainer: { company, role: UserRole.TRAINER } },
      { populate: ['trainer', 'package', 'template'] }
    );
  }

  async findByTrainingSessionKey(trainingSessionKey: string): Promise<TrainingSession | null> {
    return this.em.findOne(
      TrainingSession,
      { trainingSessionKey },
      { populate: ['trainer', 'package', 'template'] }
    );
  }

  async update(id: string, company: Company, updateData: Partial<TrainingSession>, trainerId?: string): Promise<TrainingSession> {
    const trainingSession = await this.findById(id, company, trainerId);

    if (!trainingSession) {
      throw new NotFoundException('Training session not found');
    }

    // Track old values for change detection
    const oldDate = trainingSession.date;
    const oldStartTime = trainingSession.startTime;
    const oldEndTime = trainingSession.endTime;

    // Prevent changing trainer, package, template, trainingSessionKey
    delete updateData.trainer;
    delete updateData.package;
    delete updateData.template;
    delete updateData.trainingSessionKey;

    Object.assign(trainingSession, updateData);
    trainingSession.updatedAt = new Date();

    await this.em.persistAndFlush(trainingSession);

    // Check if date or time changed
    const dateChanged = updateData.date && oldDate.getTime() !== updateData.date.getTime();
    const timeChanged = (updateData.startTime && updateData.startTime !== oldStartTime) ||
                        (updateData.endTime && updateData.endTime !== oldEndTime);

    if (dateChanged || timeChanged) {
      // Populate relations for event
      await this.em.populate(trainingSession, ['trainer', 'package']);

      const trainer = typeof trainingSession.trainer === 'object' ? trainingSession.trainer : null;
      const pkg = typeof trainingSession.package === 'object' ? trainingSession.package : null;

      if (trainer && pkg) {
        this.eventEmitter.emit(
          'trainingSession.updated',
          new TrainingSessionUpdatedEvent(
            trainingSession.id,
            trainer.id,
            trainer.fullName,
            trainer.email,
            pkg.id,
            pkg.name,
            oldDate,
            updateData.date,
            oldStartTime,
            updateData.startTime,
            oldEndTime,
            updateData.endTime,
            typeof trainer.company === 'object' ? trainer.company.id : trainer.company || '',
          ),
        );
      }
    }

    return trainingSession;
  }

  async autoExpireOldTrainingSessions(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.em.nativeUpdate(
      TrainingSession,
      {
        date: { $lt: today },
        status: TrainingSessionStatus.ACTIVE,
      },
      { status: TrainingSessionStatus.EXPIRED, updatedAt: new Date() }
    );

    return result;
  }

  async delete(id: string, company: Company, trainerId?: string): Promise<void> {
    const trainingSession = await this.findById(id, company, trainerId);

    if (!trainingSession) {
      throw new NotFoundException('Training session not found');
    }

    await this.em.removeAndFlush(trainingSession);
  }
}
