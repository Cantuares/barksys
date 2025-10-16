import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PackagePurchase, PurchaseStatus } from './entities/package-purchase.entity';
import { Company } from '../../companies/entities/company.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Package } from '../../packages/entities/package.entity';
import { PackagePurchasedEvent } from './events/package-purchased.event';
import { PackagePurchaseNearlyUsedEvent } from './events/package-purchase-nearly-used.event';
import { PackagePurchaseFullyUsedEvent } from './events/package-purchase-fully-used.event';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tutorId: string, packageId: string, company: Company): Promise<PackagePurchase> {
    // Load tutor with populate
    const tutor = await this.em.findOne(
      User,
      { id: tutorId, company, role: UserRole.TUTOR },
    );

    if (!tutor) {
      throw new BadRequestException('Tutor not found or does not belong to your company');
    }

    // Load package
    const pkg = await this.em.findOne(Package, { id: packageId, company });

    if (!pkg) {
      throw new BadRequestException('Package not found or does not belong to your company');
    }

    // Check if tutor already has an active purchase for this package
    const existingPurchase = await this.em.findOne(PackagePurchase, {
      tutor,
      package: pkg,
      status: PurchaseStatus.ACTIVE,
    });

    if (existingPurchase) {
      throw new ConflictException('Tutor already has an active purchase for this package');
    }

    const purchase = this.em.create(PackagePurchase, {
      tutor,
      package: pkg,
      purchaseDate: new Date(),
      usedSessions: 0,
      status: PurchaseStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(purchase);

    // Emit event for notification
    this.eventEmitter.emit(
      'package.purchased',
      new PackagePurchasedEvent(
        purchase.id,
        tutor.id,
        tutor.fullName,
        tutor.email,
        pkg.id,
        pkg.name,
        pkg.totalSessions,
        company.id,
      ),
    );

    return purchase;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<PackagePurchase[]> {
    return this.em.find(
      PackagePurchase,
      { tutor: { company, role: UserRole.TUTOR } },
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: ['tutor', 'package'],
      }
    );
  }

  async findByTutor(tutorId: string, company: Company): Promise<PackagePurchase[]> {
    return this.em.find(
      PackagePurchase,
      { tutor: { id: tutorId, company, role: UserRole.TUTOR } },
      { populate: ['tutor', 'package'], orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, tutorId: string, company: Company): Promise<PackagePurchase | null> {
    return this.em.findOne(
      PackagePurchase,
      { id, tutor: { id: tutorId, company, role: UserRole.TUTOR } },
      { populate: ['tutor', 'package'] }
    );
  }

  async findByIdGlobal(id: string, company: Company): Promise<PackagePurchase | null> {
    return this.em.findOne(
      PackagePurchase,
      { id, tutor: { company, role: UserRole.TUTOR } },
      { populate: ['tutor', 'package'] }
    );
  }

  async update(id: string, tutorId: string, company: Company, updateData: Partial<PackagePurchase>): Promise<PackagePurchase> {
    const purchase = await this.findById(id, tutorId, company);

    if (!purchase) {
      throw new NotFoundException('Package purchase not found');
    }

    // Prevent changing tutor and package
    delete updateData.tutor;
    delete updateData.package;

    Object.assign(purchase, updateData);
    purchase.updatedAt = new Date();

    await this.em.persistAndFlush(purchase);
    return purchase;
  }

  async incrementUsedSessions(id: string): Promise<PackagePurchase> {
    const purchase = await this.em.findOne(
      PackagePurchase,
      { id },
      { populate: ['package'] }
    );

    if (!purchase) {
      throw new NotFoundException('Package purchase not found');
    }

    purchase.usedSessions += 1;
    purchase.updatedAt = new Date();

    const remaining = purchase.package.totalSessions - purchase.usedSessions;

    // Check if nearly used (2 sessions remaining)
    if (remaining === 2 && purchase.status === PurchaseStatus.ACTIVE) {
      const tutor = typeof purchase.tutor === 'object' ? purchase.tutor : null;
      if (tutor) {
        this.eventEmitter.emit(
          'package.purchase.nearlyUsed',
          new PackagePurchaseNearlyUsedEvent(
            purchase.id,
            tutor.id,
            tutor.fullName,
            tutor.email,
            purchase.package.name,
            remaining,
            purchase.package.totalSessions,
          ),
        );
      }
    }

    // Check if all sessions are used
    if (purchase.usedSessions >= purchase.package.totalSessions) {
      purchase.status = PurchaseStatus.USED;

      const tutor = typeof purchase.tutor === 'object' ? purchase.tutor : null;
      if (tutor) {
        this.eventEmitter.emit(
          'package.purchase.fullyUsed',
          new PackagePurchaseFullyUsedEvent(
            purchase.id,
            tutor.id,
            tutor.fullName,
            tutor.email,
            purchase.package.name,
            purchase.package.totalSessions,
          ),
        );
      }
    }

    await this.em.persistAndFlush(purchase);
    return purchase;
  }

  async decrementUsedSessions(id: string): Promise<PackagePurchase> {
    const purchase = await this.em.findOne(
      PackagePurchase,
      { id },
      { populate: ['package'] }
    );

    if (!purchase) {
      throw new NotFoundException('Package purchase not found');
    }

    purchase.usedSessions = Math.max(0, purchase.usedSessions - 1);
    purchase.updatedAt = new Date();

    // Reactivate if was marked as used
    if (purchase.status === PurchaseStatus.USED && purchase.usedSessions < purchase.package.totalSessions) {
      purchase.status = PurchaseStatus.ACTIVE;
    }

    await this.em.persistAndFlush(purchase);
    return purchase;
  }

  async delete(id: string, tutorId: string, company: Company): Promise<void> {
    const purchase = await this.findById(id, tutorId, company);

    if (!purchase) {
      throw new NotFoundException('Package purchase not found');
    }

    await this.em.removeAndFlush(purchase);
  }
}
