import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { User, UserRole } from './entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRegisteredEvent } from '../notifications/events/user-registered.event';
import { PasswordResetEvent } from '../notifications/events/password-reset.event';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private readonly em: EntityManager,
    private readonly sessionsService: SessionsService,
    private readonly i18n: I18nService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      const lang = I18nContext.current()?.lang || 'en';
      throw new ConflictException(this.i18n.translate('users.errors.emailExists', { lang }));
    }

    const user = this.em.create(User, {
      email: createUserDto.email,
      passwordHash: createUserDto.password,
      fullName: createUserDto.fullName,
      role: UserRole.ADMIN,
      isActive: false,
      isEmailVerified: false,
      emailVerificationToken: uuidv4(),
      emailVerificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passwordChangedAt: new Date('0001-01-01 00:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(user);

    // Emit user.registered event
    const lang = I18nContext.current()?.lang || 'en';
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(
        user.email,
        user.fullName,
        user.emailVerificationToken!,
        lang,
      ),
    );

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.em.findOne(User, { emailVerificationToken: token });
  }

  async activateUser(user: User): Promise<void> {
    user.isActive = true;
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.em.findOne(User, { passwordResetToken: token });
  }

  async setPasswordResetToken(user: User): Promise<void> {
    user.passwordResetToken = uuidv4();
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Emit password.reset.requested event
    const lang = I18nContext.current()?.lang || 'en';
    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetEvent(
        user.email,
        user.fullName,
        user.passwordResetToken!,
        lang,
      ),
    );
  }

  async resendActivationToken(user: User): Promise<void> {
    user.emailVerificationToken = uuidv4();
    user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Emit user.registered event
    const lang = I18nContext.current()?.lang || 'en';
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(
        user.email,
        user.fullName,
        user.emailVerificationToken!,
        lang,
      ),
    );
  }

  async updatePassword(user: User, newPassword: string): Promise<void> {
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    const lang = I18nContext.current()?.lang || 'en';

    if (!user) {
      throw new UnauthorizedException(this.i18n.translate('users.errors.userNotFound', { lang }));
    }

    const isPasswordValid = await user.validatePassword(currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException(this.i18n.translate('users.errors.currentPasswordIncorrect', { lang }));
    }

    user.passwordHash = newPassword;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Revoke all user sessions after password change
    await this.sessionsService.revokeAllUserSessions(user.email);
  }

  async getUserSessions(email: string): Promise<Session[]> {
    return this.em.find(Session, { email, isBlocked: false }, { orderBy: { createdAt: 'DESC' } });
  }
}
