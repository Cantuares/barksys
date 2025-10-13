import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@Entity({ tableName: 'notifications' })
export class Notification {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property({ type: 'uuid', nullable: true })
  userId?: string;

  @Enum({ items: () => NotificationChannel, default: NotificationChannel.EMAIL })
  channel: NotificationChannel = NotificationChannel.EMAIL;

  @Property({ type: 'varchar', length: 255 })
  recipient!: string;

  @Property({ type: 'varchar', length: 500, nullable: true })
  subject?: string;

  @Property({ type: 'varchar', length: 100 })
  templateName!: string;

  @Property({ type: 'jsonb', nullable: true })
  templateContext?: Record<string, any>;

  @Enum({ items: () => NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus = NotificationStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  errorMessage?: string;

  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  deliveredAt?: Date;

  @Property({ type: 'boolean', nullable: true })
  read?: boolean;

  @Property({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Property({ type: 'timestamptz', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
