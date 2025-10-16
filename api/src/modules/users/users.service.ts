import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { User, UserRole } from './entities/user.entity';
import { Session } from '../auth/sessions/entities/session.entity';
import { Company } from '../companies/entities/company.entity';
import { SessionsService } from '../auth/sessions/sessions.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UserRegisteredEvent } from '../notifications/events/user-registered.event';
import { PasswordResetEvent } from '../notifications/events/password-reset.event';
import { PasswordChangedEvent } from '../notifications/events/password-changed.event';
import { TrainerCreatedEvent } from './events/trainer-created.event';
import { TutorCreatedEvent } from './events/tutor-created.event';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

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
      onboardingToken: uuidv4(),
      onboardingTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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
        user.onboardingToken!,
        lang,
      ),
    );

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id }, { populate: ['company'] });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.em.findOne(User, { onboardingToken: token });
  }

  async activateUser(user: User): Promise<void> {
    user.isActive = true;
    user.isEmailVerified = true;
    user.onboardingToken = undefined;
    user.onboardingTokenExpiresAt = undefined;
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

  async resendOnboardingToken(user: User): Promise<void> {
    user.onboardingToken = uuidv4();
    user.onboardingTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Emit user.registered event
    const lang = I18nContext.current()?.lang || 'en';
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(
        user.email,
        user.fullName,
        user.onboardingToken!,
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

  async changePassword(userId: string, requestingUserId: string, currentPassword: string, newPassword: string): Promise<void> {
    const lang = I18nContext.current()?.lang || 'en';

    if (userId !== requestingUserId) {
      throw new UnauthorizedException(this.i18n.translate('users.errors.cannotChangeOtherPassword', { lang }));
    }

    const user = await this.findById(userId);

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

    // Emit password.changed event
    this.eventEmitter.emit(
      'password.changed',
      new PasswordChangedEvent(
        user.id,
        user.email,
        user.fullName,
        lang,
      ),
    );
  }

  async getUserSessions(userId: string, requestingUserId: string): Promise<Session[]> {
    const lang = I18nContext.current()?.lang || 'en';

    if (userId !== requestingUserId) {
      throw new UnauthorizedException(this.i18n.translate('users.errors.cannotAccessOtherSessions', { lang }));
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException(this.i18n.translate('users.errors.userNotFound', { lang }));
    }

    return this.em.find(Session, { email: user.email, isBlocked: false }, { orderBy: { createdAt: 'DESC' } });
  }

  async createTutor(createTutorDto: CreateTutorDto, creatorUser: User): Promise<User> {
    const lang = I18nContext.current()?.lang || 'en';

    // Check if creator has a company
    if (!creatorUser.company) {
      throw new BadRequestException(this.i18n.translate('users.errors.userHasNoCompany', { lang }));
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(createTutorDto.email);
    if (existingUser) {
      throw new ConflictException(this.i18n.translate('users.errors.emailExists', { lang }));
    }

    // Generate temporary random password
    const temporaryPassword = crypto.randomBytes(16).toString('hex');

    // Create tutor user
    const tutor = this.em.create(User, {
      email: createTutorDto.email,
      passwordHash: temporaryPassword,
      fullName: createTutorDto.fullName,
      role: UserRole.TUTOR,
      company: creatorUser.company,
      isActive: true,
      isEmailVerified: true,
      passwordChangedAt: new Date('0001-01-01 00:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(tutor);

    // Set password reset token and send email
    await this.setPasswordResetToken(tutor);

    // Emit tutor.created event
    const companyId = typeof creatorUser.company === 'object' ? creatorUser.company.id : creatorUser.company;
    this.eventEmitter.emit(
      'tutor.created',
      new TutorCreatedEvent(
        tutor.id,
        tutor.fullName,
        tutor.email,
        companyId,
        creatorUser.id,
        creatorUser.fullName,
      ),
    );

    return tutor;
  }

  async createTrainer(createTrainerDto: CreateTrainerDto, creatorUser: User): Promise<User> {
    const lang = I18nContext.current()?.lang || 'en';

    // Check if admin has a company
    if (!creatorUser.company) {
      throw new BadRequestException(this.i18n.translate('users.errors.adminHasNoCompany', { lang }));
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(createTrainerDto.email);
    if (existingUser) {
      throw new ConflictException(this.i18n.translate('users.errors.emailExists', { lang }));
    }

    // Generate temporary random password
    const temporaryPassword = crypto.randomBytes(16).toString('hex');

    // Create trainer user
    const trainer = this.em.create(User, {
      email: createTrainerDto.email,
      passwordHash: temporaryPassword,
      fullName: createTrainerDto.fullName,
      role: UserRole.TRAINER,
      company: creatorUser.company,
      isActive: true,
      isEmailVerified: true,
      passwordChangedAt: new Date('0001-01-01 00:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(trainer);

    // Set password reset token and send email
    await this.setPasswordResetToken(trainer);

    // Emit trainer.created event
    const companyId = typeof creatorUser.company === 'object' ? creatorUser.company.id : creatorUser.company;
    this.eventEmitter.emit(
      'trainer.created',
      new TrainerCreatedEvent(
        trainer.id,
        trainer.fullName,
        trainer.email,
        companyId,
        creatorUser.id,
        creatorUser.fullName,
      ),
    );

    return trainer;
  }
}
