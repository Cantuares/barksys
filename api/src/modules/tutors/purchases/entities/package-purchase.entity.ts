import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../../users/entities/user.entity';
import { Package } from '../../../packages/entities/package.entity';

export enum PurchaseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  USED = 'used',
}

@Entity({ tableName: 'package_purchases' })
export class PackagePurchase {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => User, { fieldName: 'tutor_id' })
  tutor: User;

  @ManyToOne(() => Package, { fieldName: 'package_id' })
  package: Package;

  @Property({ fieldName: 'purchase_date', type: 'timestamptz' })
  purchaseDate: Date = new Date();

  @Property({ fieldName: 'used_sessions', type: 'int', default: 0 })
  usedSessions: number = 0;

  @Enum({ items: () => PurchaseStatus, default: PurchaseStatus.ACTIVE })
  status: PurchaseStatus = PurchaseStatus.ACTIVE;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
