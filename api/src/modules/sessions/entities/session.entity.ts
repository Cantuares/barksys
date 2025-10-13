import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity({ tableName: 'sessions' })
export class Session {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property()
  @Index()
  email: string;

  @Property({ fieldName: 'refresh_token' })
  @Index()
  refreshToken: string;

  @Property({ fieldName: 'user_agent' })
  userAgent: string;

  @Property({ fieldName: 'client_ip' })
  clientIp: string;

  @Property({ fieldName: 'is_blocked', default: false })
  isBlocked: boolean = false;

  @Property({ fieldName: 'expires_at' })
  @Index()
  expiresAt: Date;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();
}
