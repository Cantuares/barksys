import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v7 as uuidv7 } from 'uuid';
import { TrainingSessionEnrollment, EnrollmentStatus } from './entities/training-session-enrollment.entity';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { PackagePurchase, PurchaseStatus } from '../tutors/purchases/entities/package-purchase.entity';
import { TrainingSessionEnrolledEvent } from './events/training-session-enrolled.event';
import { TrainingSessionEnrollmentConfirmedEvent } from './events/training-session-enrollment-confirmed.event';
import { TrainingSessionEnrollmentCancelledEvent } from './events/training-session-enrollment-cancelled.event';

@Injectable()
export class TrainingSessionEnrollmentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(trainingSessionId: string, tutorId: string, petId: string, company: Company): Promise<TrainingSessionEnrollment> {
    // Load trainingSession with populated package
    const trainingSession = await this.em.findOne(
      TrainingSession,
      { id: trainingSessionId, trainer: { company, role: UserRole.TRAINER } },
      { populate: ['package', 'trainer'] }
    );

    if (!trainingSession) {
      throw new BadRequestException('Training session not found or does not belong to your company');
    }

    // Check if trainingSession has available slots
    if (trainingSession.availableSlots <= 0) {
      throw new BadRequestException('No available slots in this training session');
    }

    // Load tutor
    const tutor = await this.em.findOne(User, { id: tutorId, company, role: UserRole.TUTOR });

    if (!tutor) {
      throw new BadRequestException('Tutor not found or does not belong to your company');
    }

    // Load pet
    const pet = await this.em.findOne(Pet, { id: petId, tutor });

    if (!pet) {
      throw new BadRequestException('Pet not found or does not belong to tutor');
    }

    // Check if pet is already enrolled in this trainingSession (active enrollment)
    const existingEnrollment = await this.em.findOne(TrainingSessionEnrollment, {
      trainingSession,
      pet,
      status: EnrollmentStatus.ENROLLED,
    });

    if (existingEnrollment) {
      throw new ConflictException('This pet is already enrolled in this training session');
    }

    // Check if tutor has an active package purchase
    const packageId = typeof trainingSession.package === 'object' ? trainingSession.package.id : trainingSession.package;

    const activePurchase = await this.em.findOne(
      PackagePurchase,
      {
        tutor,
        package: packageId,
        status: PurchaseStatus.ACTIVE,
      },
      { populate: ['package'] }
    );

    if (!activePurchase) {
      throw new BadRequestException('Tutor does not have an active purchase for this training session package');
    }

    // Check if purchase has available sessions
    if (activePurchase.usedSessions >= activePurchase.package.totalSessions) {
      throw new BadRequestException('No available sessions in package purchase');
    }

    // Create enrollment with auto-generated tokens
    const enrollment = this.em.create(TrainingSessionEnrollment, {
      trainingSession,
      tutor,
      pet,
      enrollmentDate: new Date(),
      status: EnrollmentStatus.ENROLLED,
      confirmationToken: uuidv7(),
      cancellationToken: uuidv7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(enrollment);

    // Update package purchase: increment usedSessions
    activePurchase.usedSessions += 1;
    activePurchase.updatedAt = new Date();

    if (activePurchase.usedSessions >= activePurchase.package.totalSessions) {
      activePurchase.status = PurchaseStatus.USED;
    }

    await this.em.persistAndFlush(activePurchase);

    // Update trainingSession: decrement availableSlots
    trainingSession.availableSlots = Math.max(0, trainingSession.availableSlots - 1);
    trainingSession.updatedAt = new Date();

    await this.em.persistAndFlush(trainingSession);

    // Populate enrollment with relations for event
    await this.em.populate(enrollment, ['trainingSession', 'tutor', 'pet']);

    // Emit event for notification
    this.eventEmitter.emit(
      'trainingSession.enrolled',
      new TrainingSessionEnrolledEvent(
        enrollment.id,
        trainingSession.id,
        tutor.id,
        tutor.fullName,
        tutor.email,
        pet.id,
        pet.name,
        trainingSession.date,
        trainingSession.startTime,
        trainingSession.endTime,
        enrollment.confirmationToken,
        enrollment.cancellationToken,
      ),
    );

    return enrollment;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<TrainingSessionEnrollment[]> {
    return this.em.find(
      TrainingSessionEnrollment,
      { tutor: { company, role: UserRole.TUTOR } },
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: ['trainingSession', 'tutor', 'pet'],
      }
    );
  }

  async findByTutor(tutorId: string, company: Company): Promise<TrainingSessionEnrollment[]> {
    return this.em.find(
      TrainingSessionEnrollment,
      { tutor: { id: tutorId, company, role: UserRole.TUTOR } },
      { populate: ['trainingSession', 'tutor', 'pet'], orderBy: { createdAt: 'DESC' } }
    );
  }

  async findByTrainingSession(trainingSessionId: string, company: Company): Promise<TrainingSessionEnrollment[]> {
    return this.em.find(
      TrainingSessionEnrollment,
      { trainingSession: { id: trainingSessionId, trainer: { company, role: UserRole.TRAINER } } },
      { populate: ['trainingSession', 'tutor', 'pet'], orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, company: Company): Promise<TrainingSessionEnrollment | null> {
    return this.em.findOne(
      TrainingSessionEnrollment,
      { id, tutor: { company, role: UserRole.TUTOR } },
      { populate: ['trainingSession', 'tutor', 'pet'] }
    );
  }

  async cancel(id: string, company: Company): Promise<TrainingSessionEnrollment> {
    const enrollment = await this.findById(id, company);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('Enrollment is already cancelled');
    }

    // Load trainingSession and package purchase
    await this.em.populate(enrollment, ['trainingSession.package']);

    const trainingSession = enrollment.trainingSession;
    const packageId = typeof trainingSession.package === 'object' ? trainingSession.package.id : trainingSession.package;

    const purchase = await this.em.findOne(
      PackagePurchase,
      {
        tutor: enrollment.tutor,
        package: packageId,
      },
      { populate: ['package'] }
    );

    if (purchase) {
      // Decrement usedSessions
      purchase.usedSessions = Math.max(0, purchase.usedSessions - 1);
      purchase.updatedAt = new Date();

      // Reactivate if was marked as used
      if (purchase.status === PurchaseStatus.USED && purchase.usedSessions < purchase.package.totalSessions) {
        purchase.status = PurchaseStatus.ACTIVE;
      }

      await this.em.persistAndFlush(purchase);
    }

    // Increment availableSlots
    trainingSession.availableSlots = Math.min(trainingSession.maxParticipants, trainingSession.availableSlots + 1);
    trainingSession.updatedAt = new Date();

    await this.em.persistAndFlush(trainingSession);

    // Update enrollment status
    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.updatedAt = new Date();

    await this.em.persistAndFlush(enrollment);

    return enrollment;
  }

  async delete(id: string, company: Company): Promise<void> {
    const enrollment = await this.findById(id, company);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.em.removeAndFlush(enrollment);
  }

  async confirmByToken(token: string): Promise<TrainingSessionEnrollment> {
    const enrollment = await this.em.findOne(
      TrainingSessionEnrollment,
      { confirmationToken: token },
      { populate: ['trainingSession', 'trainingSession.trainer', 'tutor', 'tutor.company', 'pet'] },
    );

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or invalid token');
    }

    if (enrollment.status === EnrollmentStatus.CONFIRMED) {
      throw new BadRequestException('Enrollment is already confirmed');
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm a cancelled enrollment');
    }

    enrollment.status = EnrollmentStatus.CONFIRMED;
    enrollment.confirmedAt = new Date();
    enrollment.updatedAt = new Date();

    await this.em.persistAndFlush(enrollment);

    // Extract populated entities (already loaded in findOne)
    const trainingSession = enrollment.trainingSession as TrainingSession;
    const trainer = trainingSession.trainer as User;
    const tutor = enrollment.tutor as User;
    const pet = enrollment.pet as Pet;

    this.eventEmitter.emit(
      'trainingSession.enrollment.confirmed',
      new TrainingSessionEnrollmentConfirmedEvent(
        enrollment.id,
        trainingSession.id,
        tutor.id,
        tutor.fullName,
        pet.id,
        pet.name,
        trainer?.id || '',
        trainer?.fullName || '',
        trainer?.email || '',
        trainingSession.date,
        trainingSession.startTime,
        trainingSession.endTime,
        (tutor.company as Company)?.id || '',
      ),
    );

    return enrollment;
  }

  async cancelByToken(token: string, reason?: string): Promise<TrainingSessionEnrollment> {
    const enrollment = await this.em.findOne(
      TrainingSessionEnrollment,
      { cancellationToken: token },
      { populate: ['trainingSession', 'trainingSession.trainer', 'trainingSession.package', 'tutor', 'tutor.company', 'pet'] },
    );

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or invalid token');
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('Enrollment is already cancelled');
    }

    // Extract populated entities (already loaded in findOne)
    const trainingSession = enrollment.trainingSession as TrainingSession;
    const trainer = trainingSession.trainer as User;
    const tutor = enrollment.tutor as User;
    const pet = enrollment.pet as Pet;

    const packageId = typeof trainingSession.package === 'object' ? trainingSession.package.id : trainingSession.package;

    const purchase = await this.em.findOne(
      PackagePurchase,
      {
        tutor: enrollment.tutor,
        package: packageId,
      },
      { populate: ['package'] },
    );

    if (purchase) {
      purchase.usedSessions = Math.max(0, purchase.usedSessions - 1);
      purchase.updatedAt = new Date();

      if (purchase.status === PurchaseStatus.USED && purchase.usedSessions < purchase.package.totalSessions) {
        purchase.status = PurchaseStatus.ACTIVE;
      }

      await this.em.persistAndFlush(purchase);
    }

    trainingSession.availableSlots = Math.min(trainingSession.maxParticipants, trainingSession.availableSlots + 1);
    trainingSession.updatedAt = new Date();

    await this.em.persistAndFlush(trainingSession);

    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.cancelledAt = new Date();
    enrollment.cancellationReason = reason;
    enrollment.updatedAt = new Date();

    await this.em.persistAndFlush(enrollment);

    this.eventEmitter.emit(
      'trainingSession.enrollment.cancelled',
      new TrainingSessionEnrollmentCancelledEvent(
        enrollment.id,
        trainingSession.id,
        tutor.id,
        tutor.fullName,
        tutor.email,
        pet.id,
        pet.name,
        trainer?.id || '',
        trainer?.fullName || '',
        trainer?.email || '',
        trainingSession.date,
        trainingSession.startTime,
        trainingSession.endTime,
        (tutor.company as Company)?.id || '',
        reason,
      ),
    );

    return enrollment;
  }
}
