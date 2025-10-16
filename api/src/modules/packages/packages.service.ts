import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Package, PackageStatus } from './entities/package.entity';
import { Company } from '../companies/entities/company.entity';
import { PackageCreatedEvent } from './events/package-created.event';

@Injectable()
export class PackagesService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Package, 'status'>>): Promise<Package> {
    const pkg = this.em.create(Package, {
      status: PackageStatus.ACTIVE,
      ...packageData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(pkg);

    // Emit event
    this.eventEmitter.emit(
      'package.created',
      new PackageCreatedEvent(
        pkg.id,
        pkg.name,
        pkg.totalSessions,
        typeof pkg.company === 'object' ? pkg.company.id : pkg.company,
      ),
    );

    return pkg;
  }

  async findAllByCompany(company: Company, limit = 50, offset = 0): Promise<Package[]> {
    return this.em.find(
      Package,
      { company },
      { limit, offset, orderBy: { createdAt: 'DESC' } }
    );
  }

  async findById(id: string, company: Company): Promise<Package | null> {
    return this.em.findOne(Package, { id, company });
  }

  async update(id: string, company: Company, updateData: Partial<Package>): Promise<Package> {
    const pkg = await this.findById(id, company);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Prevent changing company
    delete updateData.company;

    Object.assign(pkg, updateData);
    pkg.updatedAt = new Date();

    await this.em.persistAndFlush(pkg);
    return pkg;
  }

  async delete(id: string, company: Company): Promise<void> {
    const pkg = await this.findById(id, company);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    await this.em.removeAndFlush(pkg);
  }
}
