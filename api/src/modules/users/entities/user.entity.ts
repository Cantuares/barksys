import { Entity, PrimaryKey, Property, Unique, Index, BeforeCreate, BeforeUpdate, Enum } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  TUTOR = 'tutor',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property()
  @Unique()
  @Index()
  email: string;

  @Property({ fieldName: 'password_hash', hidden: true })
  passwordHash: string;

  @Property({ fieldName: 'full_name' })
  fullName: string;

  @Enum({ items: () => UserRole, default: UserRole.ADMIN })
  role: UserRole = UserRole.ADMIN;

  @Property({ fieldName: 'is_active', default: false })
  isActive: boolean = false;

  @Property({ fieldName: 'is_email_verified', default: false })
  isEmailVerified: boolean = false;

  @Property({ fieldName: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Property({ fieldName: 'email_verification_token_expires_at', nullable: true })
  emailVerificationTokenExpiresAt?: Date;

  @Property({ fieldName: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Property({ fieldName: 'password_reset_token_expires_at', nullable: true })
  passwordResetTokenExpiresAt?: Date;

  @Property({ fieldName: 'password_changed_at' })
  passwordChangedAt: Date = new Date('0001-01-01 00:00:00Z');

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at' })
  updatedAt: Date = new Date();

  @BeforeCreate()
  async hashPasswordOnCreate() {
    if (this.passwordHash) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Check if password was modified by verifying if it's not already hashed
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
      this.passwordChangedAt = new Date();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}
