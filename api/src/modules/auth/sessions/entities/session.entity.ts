import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity({ tableName: 'sessions' })
export class Session {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Property({ fieldName: 'refresh_token', type: 'varchar', length: 500 })
  @Index()
  refreshToken: string;

  @Property({ fieldName: 'user_agent', type: 'varchar', length: 500 })
  userAgent: string;

  @Property({ fieldName: 'client_ip', type: 'varchar', length: 45 })
  clientIp: string;

  @Property({ fieldName: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean = false;

  @Property({ fieldName: 'expires_at', type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();
}
