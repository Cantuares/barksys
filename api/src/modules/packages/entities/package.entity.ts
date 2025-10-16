import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { Company } from '../../companies/entities/company.entity';

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ tableName: 'packages' })
export class Package {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => Company, { fieldName: 'company_id' })
  company: Company;

  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'text' })
  description: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Property({ fieldName: 'total_sessions', type: 'int' })
  totalSessions: number;

  @Property({ fieldName: 'validity_days', type: 'int' })
  validityDays: number;

  @Enum({ items: () => PackageStatus, default: PackageStatus.ACTIVE })
  status: PackageStatus = PackageStatus.ACTIVE;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
