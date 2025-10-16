import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { I18nService } from 'nestjs-i18n';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import { EmailOptions } from './interfaces/email-options.interface';
import { UserRegisteredEvent } from './events/user-registered.event';
import { PasswordResetEvent } from './events/password-reset.event';
import { PackagePurchasedEvent } from '../tutors/purchases/events/package-purchased.event';
import { TrainingSessionEnrolledEvent } from '../training-session-enrollments/events/training-session-enrolled.event';
import { TrainingSessionEnrollmentConfirmedEvent } from '../training-session-enrollments/events/training-session-enrollment-confirmed.event';
import { TrainingSessionEnrollmentCancelledEvent } from '../training-session-enrollments/events/training-session-enrollment-cancelled.event';
import { PasswordChangedEvent } from './events/password-changed.event';
import { TrainingSessionCreatedEvent } from '../training-sessions/events/training-session-created.event';
import { TrainingSessionUpdatedEvent } from '../training-sessions/events/training-session-updated.event';
import { PackagePurchaseNearlyUsedEvent } from '../tutors/purchases/events/package-purchase-nearly-used.event';
import { PackagePurchaseFullyUsedEvent } from '../tutors/purchases/events/package-purchase-fully-used.event';
import { PackageCreatedEvent } from '../packages/events/package-created.event';
import { PetCreatedEvent } from '../pets/events/pet-created.event';
import { TrainerCreatedEvent } from '../users/events/trainer-created.event';
import { TutorCreatedEvent } from '../users/events/tutor-created.event';
import { AvailabilityConfiguredEvent } from '../trainers/availability/events/availability-configured.event';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { PackagePurchase, PurchaseStatus } from '../tutors/purchases/entities/package-purchase.entity';
import { SmtpTransport } from './transports/smtp.transport';
import { Notification, NotificationChannel, NotificationStatus } from './entities/notification.entity';
import { TrainingSessionEnrollment } from '../training-session-enrollments/entities/training-session-enrollment.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly templatesPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly smtpTransport: SmtpTransport,
    private readonly em: EntityManager,
    private readonly i18n: I18nService,
  ) {
    this.templatesPath = path.join(__dirname, 'templates');
  }

  /**
   * Send email notification with audit
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const notification = this.em.create(Notification, {
      userId: options.context?.userId,
      channel: NotificationChannel.EMAIL,
      recipient: options.to,
      subject: options.subject,
      templateName: options.template,
      templateContext: options.context,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const html = await this.renderTemplate(options.template, options.context);

      await this.smtpTransport.sendEmail({
        to: options.to,
        subject: options.subject,
        html,
      });

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      this.logger.error(`Failed to send email to ${options.to}:`, error.message);
      throw error;
    } finally {
      await this.em.persistAndFlush(notification);
    }
  }

  /**
   * Render EJS template with translations
   */
  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
    const basePath = path.join(this.templatesPath, 'base.ejs');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Load translations using I18nService
    const lang = context.lang || 'en';
    const translations = this.i18n.translate('notifications', { lang }) as any;

    // Render content template
    const content = await ejs.renderFile(templatePath, { ...context, translations });

    // Render base template with content
    const subject = context.subject || '';

    // Map template names to their translation titles
    const titleMap: Record<string, string> = {
      'user-onboarding': translations.onboarding?.title,
      'password-reset': translations.passwordReset?.title,
      'package-purchased': translations.packagePurchased?.title,
      'training-session-enrolled': translations.trainingSessionEnrolled?.title,
      'training-session-confirmed': translations.trainingSessionConfirmed?.title,
      'training-session-cancelled': translations.trainingSessionCancelled?.title,
      'training-session-updated': translations.trainingSessionUpdated?.title,
      'password-changed': translations.passwordChanged?.title,
      'package-nearly-used': 'Package Low Sessions',
      'package-fully-used': 'Package Complete',
    };

    const title = titleMap[templateName] || subject;
    const subtitle = '';

    return ejs.renderFile(basePath, {
      lang,
      subject,
      title,
      subtitle,
      content,
      translations,
    });
  }

  /**
   * Event listener: user.registered
   */
  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4200';
    const activationUrl = `${appUrl}/auth/onboarding/${event.verificationToken}`;

    const lang = event.lang || 'en';
    const subject = this.i18n.translate('notifications.subjects.userOnboarding', { lang });

    await this.sendEmail({
      to: event.email,
      subject,
      template: 'user-onboarding',
      context: {
        fullName: event.fullName,
        activationUrl,
        lang,
        subject,
      },
    });
  }

  /**
   * Event listener: password.reset.requested
   */
  @OnEvent('password.reset.requested')
  async handlePasswordReset(event: PasswordResetEvent): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4200';
    const resetUrl = `${appUrl}/auth/password/reset/${event.resetToken}`;

    const lang = event.lang || 'en';
    const subject = this.i18n.translate('notifications.subjects.passwordReset', { lang });

    await this.sendEmail({
      to: event.email,
      subject,
      template: 'password-reset',
      context: {
        fullName: event.fullName,
        resetUrl,
        lang,
        subject,
      },
    });
  }

  /**
   * Event listener: package.purchased
   */
  @OnEvent('package.purchased')
  async handlePackagePurchased(event: PackagePurchasedEvent): Promise<void> {
    // Find company and populate user (admin)
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (!company || !company.user) {
      this.logger.error(`Company or admin user not found for company ID: ${event.companyId}`);
      return;
    }

    const lang = 'en';
    const subjectTemplate = this.i18n.translate('notifications.subjects.packagePurchased', { lang }) as string;
    const subject = subjectTemplate.replace('{{tutorName}}', event.tutorName);

    await this.sendEmail({
      to: company.user.email,
      subject,
      template: 'package-purchased',
      context: {
        adminName: company.user.fullName,
        tutorName: event.tutorName,
        tutorEmail: event.tutorEmail,
        packageName: event.packageName,
        totalSessions: event.totalSessions,
        purchaseDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        lang,
        subject,
      },
    });
  }

  /**
   * Event listener: trainingSession.enrolled
   */
  @OnEvent('trainingSession.enrolled')
  async handleTrainingSessionEnrolled(event: TrainingSessionEnrolledEvent): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4200';
    const confirmUrl = `${appUrl}/api/training-session-enrollments/confirm/${event.confirmationToken}`;
    const cancelUrl = `${appUrl}/api/training-session-enrollments/cancel/${event.cancellationToken}`;

    const lang = 'en'; // TODO: Get language from tutor preferences
    const subjectTemplate = this.i18n.translate('notifications.subjects.trainingSessionEnrolled', { lang }) as string;
    const subject = subjectTemplate.replace('{{petName}}', event.petName);

    // Format date and time for display
    const sessionDate = new Date(event.sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await this.sendEmail({
      to: event.tutorEmail,
      subject,
      template: 'training-session-enrolled',
      context: {
        tutorName: event.tutorName,
        petName: event.petName,
        sessionDate,
        sessionStartTime: event.sessionStartTime,
        sessionEndTime: event.sessionEndTime,
        confirmUrl,
        cancelUrl,
        lang,
        subject,
      },
    });
  }

  /**
   * Event listener: trainingSession.enrollment.confirmed
   */
  @OnEvent('trainingSession.enrollment.confirmed')
  async handleTrainingSessionConfirmed(event: TrainingSessionEnrollmentConfirmedEvent): Promise<void> {
    const lang = 'en'; // TODO: Get language from trainer preferences

    // Format date for display
    const sessionDate = new Date(event.sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subjectTemplate = this.i18n.translate('notifications.subjects.trainingSessionConfirmed', { lang }) as string;
    const subject = subjectTemplate.replace('{{petName}}', event.petName);

    // Send email to trainer
    await this.sendEmail({
      to: event.trainerEmail,
      subject,
      template: 'training-session-confirmed',
      context: {
        trainerName: event.trainerName,
        tutorName: event.tutorName,
        petName: event.petName,
        sessionDate,
        sessionStartTime: event.sessionStartTime,
        sessionEndTime: event.sessionEndTime,
        lang,
        subject,
      },
    });

    // Create in-app notification for trainer
    await this.createInAppNotification(
      event.trainerId,
      subject,
      `${event.tutorName} confirmed enrollment for ${event.petName} on ${sessionDate}`,
      {
        actionUrl: `/training-sessions/${event.trainingSessionId}`,
        priority: 'medium',
        metadata: {
          type: 'training_session_confirmed',
          enrollmentId: event.enrollmentId,
          trainingSessionId: event.trainingSessionId,
        },
      },
    );

    // Find company and create in-app notification for admin
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        subject,
        `Training session confirmed by ${event.tutorName} for ${event.petName}`,
        {
          actionUrl: `/training-sessions/${event.trainingSessionId}`,
          priority: 'low',
          metadata: {
            type: 'training_session_confirmed',
            enrollmentId: event.enrollmentId,
            trainingSessionId: event.trainingSessionId,
          },
        },
      );
    }
  }

  /**
   * Event listener: trainingSession.enrollment.cancelled
   */
  @OnEvent('trainingSession.enrollment.cancelled')
  async handleTrainingSessionCancelled(event: TrainingSessionEnrollmentCancelledEvent): Promise<void> {
    const lang = 'en'; // TODO: Get language from user preferences

    // Format date for display
    const sessionDate = new Date(event.sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subjectTemplate = this.i18n.translate('notifications.subjects.trainingSessionCancelled', { lang }) as string;
    const subject = subjectTemplate.replace('{{petName}}', event.petName);

    // Send email to trainer
    await this.sendEmail({
      to: event.trainerEmail,
      subject,
      template: 'training-session-cancelled',
      context: {
        recipientName: event.trainerName,
        tutorName: event.tutorName,
        petName: event.petName,
        sessionDate,
        sessionStartTime: event.sessionStartTime,
        sessionEndTime: event.sessionEndTime,
        reason: event.reason,
        lang,
        subject,
      },
    });

    // Create in-app notification for trainer
    await this.createInAppNotification(
      event.trainerId,
      subject,
      `${event.tutorName} cancelled enrollment for ${event.petName} on ${sessionDate}`,
      {
        actionUrl: `/training-sessions/${event.trainingSessionId}`,
        priority: 'medium',
        metadata: {
          type: 'training_session_cancelled',
          enrollmentId: event.enrollmentId,
          trainingSessionId: event.trainingSessionId,
          reason: event.reason,
        },
      },
    );

    // Send email to tutor
    await this.sendEmail({
      to: event.tutorEmail,
      subject,
      template: 'training-session-cancelled',
      context: {
        recipientName: event.tutorName,
        tutorName: event.tutorName,
        petName: event.petName,
        sessionDate,
        sessionStartTime: event.sessionStartTime,
        sessionEndTime: event.sessionEndTime,
        reason: event.reason,
        lang,
        subject,
      },
    });

    // Create in-app notification for tutor
    await this.createInAppNotification(
      event.tutorId,
      subject,
      `Your enrollment for ${event.petName} on ${sessionDate} has been cancelled. Session credit returned.`,
      {
        actionUrl: `/training-sessions/${event.trainingSessionId}`,
        priority: 'medium',
        metadata: {
          type: 'training_session_cancelled',
          enrollmentId: event.enrollmentId,
          trainingSessionId: event.trainingSessionId,
          reason: event.reason,
        },
      },
    );

    // Find company and create in-app notification for admin
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        subject,
        `Training session cancelled: ${event.tutorName} - ${event.petName}`,
        {
          actionUrl: `/training-sessions/${event.trainingSessionId}`,
          priority: 'low',
          metadata: {
            type: 'training_session_cancelled',
            enrollmentId: event.enrollmentId,
            trainingSessionId: event.trainingSessionId,
            reason: event.reason,
          },
        },
      );
    }
  }

  /**
   * Event listener: password.changed
   */
  @OnEvent('password.changed')
  async handlePasswordChanged(event: PasswordChangedEvent): Promise<void> {
    const lang = event.lang || 'en';
    const subject = this.i18n.translate('notifications.subjects.passwordChanged', { lang });

    // Send email notification
    await this.sendEmail({
      to: event.email,
      subject,
      template: 'password-changed',
      context: {
        fullName: event.fullName,
        lang,
        subject,
      },
    });
  }

  /**
   * Event listener: trainingSession.created
   */
  @OnEvent('trainingSession.created')
  async handleTrainingSessionCreated(event: TrainingSessionCreatedEvent): Promise<void> {
    // Format date for display
    const sessionDate = new Date(event.sessionDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // Find tutors with active purchases for this package
    const activePurchases = await this.em.find(
      PackagePurchase,
      {
        package: event.packageId,
        status: PurchaseStatus.ACTIVE,
      },
      { populate: ['tutor'] },
    );

    // Create in-app notification for each tutor
    for (const purchase of activePurchases) {
      const tutor = typeof purchase.tutor === 'object' ? purchase.tutor : null;

      if (tutor) {
        await this.createInAppNotification(
          tutor.id,
          `New Session Available - ${event.packageName}`,
          `${sessionDate} at ${event.sessionStartTime} with ${event.trainerName}`,
          {
            actionUrl: `/training-sessions/${event.trainingSessionId}`,
            priority: 'low',
            metadata: {
              type: 'training_session_created',
              trainingSessionId: event.trainingSessionId,
              packageId: event.packageId,
            },
          },
        );
      }
    }
  }

  /**
   * Event listener: trainingSession.updated
   */
  @OnEvent('trainingSession.updated')
  async handleTrainingSessionUpdated(event: TrainingSessionUpdatedEvent): Promise<void> {
    const lang = 'en'; // TODO: Get language from preferences

    // Format dates for display
    const oldDateFormatted = new Date(event.oldDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const newDateFormatted = event.newDate ? new Date(event.newDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : oldDateFormatted;

    const subjectTemplate = this.i18n.translate('notifications.subjects.trainingSessionUpdated', { lang }) as string;
    const subject = subjectTemplate.replace('{{packageName}}', event.packageName);
    const translations = this.i18n.translate('notifications.trainingSessionUpdated', { lang }) as any;

    // Send email to trainer
    await this.sendEmail({
      to: event.trainerEmail,
      subject,
      template: 'training-session-updated',
      context: {
        greeting: `${translations.greeting} ${event.trainerName},`,
        message: translations.message,
        sessionDetails: translations.sessionDetails,
        packageLabel: translations.packageLabel,
        packageName: event.packageName,
        trainerLabel: translations.trainerLabel,
        trainerName: event.trainerName,
        changesLabel: translations.changesLabel,
        dateLabel: translations.dateLabel,
        startTimeLabel: translations.startTimeLabel,
        endTimeLabel: translations.endTimeLabel,
        oldDate: event.newDate ? event.oldDate : null,
        newDate: event.newDate,
        oldDateFormatted,
        newDateFormatted,
        oldStartTime: event.newStartTime ? event.oldStartTime : null,
        newStartTime: event.newStartTime,
        oldEndTime: event.newEndTime ? event.oldEndTime : null,
        newEndTime: event.newEndTime,
        closingMessage: translations.closingMessage,
        footerText: translations.footerText,
        title: translations.title,
        lang,
        subject,
      },
    });

    // Create in-app notification for trainer
    await this.createInAppNotification(
      event.trainerId,
      subject,
      `Session schedule updated: ${newDateFormatted} at ${event.newStartTime || event.oldStartTime}`,
      {
        actionUrl: `/training-sessions/${event.trainingSessionId}`,
        priority: 'medium',
        metadata: {
          type: 'training_session_updated',
          trainingSessionId: event.trainingSessionId,
        },
      },
    );

    // Find all enrollments for this training session to notify tutors
    const enrollments = await this.em.find(
      TrainingSessionEnrollment,
      { trainingSession: { id: event.trainingSessionId } },
      { populate: ['tutor'] },
    );

    // Send notifications to all enrolled tutors
    for (const enrollment of enrollments) {
      const tutor = typeof enrollment.tutor === 'object' ? enrollment.tutor : null;

      if (tutor) {
        // Send email to tutor
        await this.sendEmail({
          to: tutor.email,
          subject,
          template: 'training-session-updated',
          context: {
            greeting: `${translations.greeting} ${tutor.fullName},`,
            message: translations.message,
            sessionDetails: translations.sessionDetails,
            packageLabel: translations.packageLabel,
            packageName: event.packageName,
            trainerLabel: translations.trainerLabel,
            trainerName: event.trainerName,
            changesLabel: translations.changesLabel,
            dateLabel: translations.dateLabel,
            startTimeLabel: translations.startTimeLabel,
            endTimeLabel: translations.endTimeLabel,
            oldDate: event.newDate ? event.oldDate : null,
            newDate: event.newDate,
            oldDateFormatted,
            newDateFormatted,
            oldStartTime: event.newStartTime ? event.oldStartTime : null,
            newStartTime: event.newStartTime,
            oldEndTime: event.newEndTime ? event.oldEndTime : null,
            newEndTime: event.newEndTime,
            closingMessage: translations.closingMessage,
            footerText: translations.footerText,
            title: translations.title,
            lang,
            subject,
          },
        });

        // Create in-app notification for tutor
        await this.createInAppNotification(
          tutor.id,
          subject,
          `Your training session has been rescheduled: ${newDateFormatted} at ${event.newStartTime || event.oldStartTime}`,
          {
            actionUrl: `/training-sessions/${event.trainingSessionId}`,
            priority: 'high',
            metadata: {
              type: 'training_session_updated',
              trainingSessionId: event.trainingSessionId,
            },
          },
        );
      }
    }
  }

  /**
   * Event listener: package.purchase.nearlyUsed
   */
  @OnEvent('package.purchase.nearlyUsed')
  async handlePackageNearlyUsed(event: PackagePurchaseNearlyUsedEvent): Promise<void> {
    const subject = `Low Sessions Alert - ${event.packageName}`;

    await this.sendEmail({
      to: event.tutorEmail,
      subject,
      template: 'package-nearly-used',
      context: {
        tutorName: event.tutorName,
        packageName: event.packageName,
        remainingSessions: event.remainingSessions,
        totalSessions: event.totalSessions,
        subject,
      },
    });

    await this.createInAppNotification(
      event.tutorId,
      subject,
      `Only ${event.remainingSessions} sessions remaining!`,
      {
        actionUrl: `/packages`,
        priority: 'medium',
        metadata: {
          type: 'package_nearly_used',
          purchaseId: event.purchaseId,
        },
      },
    );
  }

  /**
   * Event listener: package.purchase.fullyUsed
   */
  @OnEvent('package.purchase.fullyUsed')
  async handlePackageFullyUsed(event: PackagePurchaseFullyUsedEvent): Promise<void> {
    const subject = `Package Complete - ${event.packageName}`;

    await this.sendEmail({
      to: event.tutorEmail,
      subject,
      template: 'package-fully-used',
      context: {
        tutorName: event.tutorName,
        packageName: event.packageName,
        totalSessions: event.totalSessions,
        subject,
      },
    });

    await this.createInAppNotification(
      event.tutorId,
      subject,
      `Completed all ${event.totalSessions} sessions! Get a new package.`,
      {
        actionUrl: `/packages`,
        priority: 'high',
        metadata: {
          type: 'package_fully_used',
          purchaseId: event.purchaseId,
        },
      },
    );
  }

  /**
   * Event listener: package.created
   */
  @OnEvent('package.created')
  async handlePackageCreated(event: PackageCreatedEvent): Promise<void> {
    // Find all tutors in the company
    const tutors = await this.em.find(User, {
      company: event.companyId,
      role: UserRole.TUTOR,
    });

    // Create in-app notification for each tutor
    for (const tutor of tutors) {
      await this.createInAppNotification(
        tutor.id,
        `New Package Available - ${event.packageName}`,
        `${event.totalSessions} sessions package now available!`,
        {
          actionUrl: `/packages/${event.packageId}`,
          priority: 'low',
          metadata: {
            type: 'package_created',
            packageId: event.packageId,
          },
        },
      );
    }
  }

  /**
   * Event listener: pet.created
   */
  @OnEvent('pet.created')
  async handlePetCreated(event: PetCreatedEvent): Promise<void> {
    // Find admin and trainers in the company
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        `New Pet Registered - ${event.petName}`,
        `${event.tutorName} registered ${event.petName}`,
        {
          actionUrl: `/pets/${event.petId}`,
          priority: 'low',
          metadata: {
            type: 'pet_created',
            petId: event.petId,
            tutorId: event.tutorId,
          },
        },
      );
    }

    // Find trainers
    const trainers = await this.em.find(User, {
      company: event.companyId,
      role: UserRole.TRAINER,
    });

    for (const trainer of trainers) {
      await this.createInAppNotification(
        trainer.id,
        `New Pet - ${event.petName}`,
        `${event.tutorName}'s pet is ready for training`,
        {
          actionUrl: `/pets/${event.petId}`,
          priority: 'low',
          metadata: {
            type: 'pet_created',
            petId: event.petId,
          },
        },
      );
    }
  }

  /**
   * Event listener: trainer.created
   */
  @OnEvent('trainer.created')
  async handleTrainerCreated(event: TrainerCreatedEvent): Promise<void> {
    // Find admin in the company
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        `New Trainer Added - ${event.trainerName}`,
        `${event.createdByUserName} added ${event.trainerName} as a trainer`,
        {
          actionUrl: `/trainers/${event.trainerId}`,
          priority: 'low',
          metadata: {
            type: 'trainer_created',
            trainerId: event.trainerId,
            createdBy: event.createdByUserId,
          },
        },
      );
    }

    // Find other trainers in the company to notify them
    const trainers = await this.em.find(User, {
      company: event.companyId,
      role: UserRole.TRAINER,
      id: { $ne: event.trainerId }, // Exclude the newly created trainer
    });

    for (const trainer of trainers) {
      await this.createInAppNotification(
        trainer.id,
        `Welcome ${event.trainerName}!`,
        `${event.trainerName} joined as a trainer`,
        {
          actionUrl: `/trainers/${event.trainerId}`,
          priority: 'low',
          metadata: {
            type: 'trainer_created',
            trainerId: event.trainerId,
          },
        },
      );
    }
  }

  /**
   * Event listener: tutor.created
   */
  @OnEvent('tutor.created')
  async handleTutorCreated(event: TutorCreatedEvent): Promise<void> {
    // Find admin in the company
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        `New Tutor Added - ${event.tutorName}`,
        `${event.createdByUserName} added ${event.tutorName} as a tutor`,
        {
          actionUrl: `/tutors/${event.tutorId}`,
          priority: 'low',
          metadata: {
            type: 'tutor_created',
            tutorId: event.tutorId,
            createdBy: event.createdByUserId,
          },
        },
      );
    }

    // Find trainers in the company to notify them of new tutor
    const trainers = await this.em.find(User, {
      company: event.companyId,
      role: UserRole.TRAINER,
    });

    for (const trainer of trainers) {
      await this.createInAppNotification(
        trainer.id,
        `New Tutor - ${event.tutorName}`,
        `${event.tutorName} joined as a tutor`,
        {
          actionUrl: `/tutors/${event.tutorId}`,
          priority: 'low',
          metadata: {
            type: 'tutor_created',
            tutorId: event.tutorId,
          },
        },
      );
    }
  }

  /**
   * Event listener: availability.configured
   */
  @OnEvent('availability.configured')
  async handleAvailabilityConfigured(event: AvailabilityConfiguredEvent): Promise<void> {
    // Format working days
    const workingDaysStr = event.workingDays.join(', ');
    const actionType = event.isUpdate ? 'updated' : 'configured';
    const actionTypeCapitalized = event.isUpdate ? 'Updated' : 'Configured';

    // Find admin in the company
    const company = await this.em.findOne(Company, { id: event.companyId }, { populate: ['user'] });

    if (company && company.user) {
      await this.createInAppNotification(
        company.user.id,
        `Trainer Availability ${actionTypeCapitalized} - ${event.trainerName}`,
        `${event.trainerName} ${actionType} availability: ${event.workStartTime}-${event.workEndTime} (${workingDaysStr})`,
        {
          actionUrl: `/trainers/${event.trainerId}/availability`,
          priority: 'low',
          metadata: {
            type: 'availability_configured',
            trainerId: event.trainerId,
            isUpdate: event.isUpdate,
          },
        },
      );
    }
  }

  /**
   * Create in-app notification
   */
  async createInAppNotification(
    userId: string,
    title: string,
    body: string,
    options?: {
      actionUrl?: string;
      priority?: 'low' | 'medium' | 'high';
      metadata?: Record<string, any>;
    },
  ): Promise<Notification> {
    const notification = this.em.create(Notification, {
      userId,
      channel: NotificationChannel.IN_APP,
      recipient: userId, // For in-app, recipient is the userId
      subject: title,
      templateName: 'in-app',
      templateContext: {
        body,
        actionUrl: options?.actionUrl,
        priority: options?.priority || 'medium',
        ...options?.metadata,
      },
      status: NotificationStatus.DELIVERED, // In-app notifications are immediately delivered
      read: false,
      sentAt: new Date(),
      deliveredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(notification);
    return notification;
  }

  /**
   * Find notifications by user
   */
  async findByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    const where: any = {
      userId,
      channel: NotificationChannel.IN_APP,
    };

    if (unreadOnly) {
      where.read = false;
    }

    return this.em.find(
      Notification,
      where,
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );
  }

  /**
   * Count total notifications for user
   */
  async countByUser(userId: string, unreadOnly: boolean = false): Promise<number> {
    const where: any = {
      userId,
      channel: NotificationChannel.IN_APP,
    };

    if (unreadOnly) {
      where.read = false;
    }

    return this.em.count(Notification, where);
  }

  /**
   * Find notification by id and user
   */
  async findById(notificationId: string, userId: string): Promise<Notification | null> {
    return this.em.findOne(Notification, {
      id: notificationId,
      userId,
      channel: NotificationChannel.IN_APP,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.findById(notificationId, userId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();

    await this.em.persistAndFlush(notification);
    return notification;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const notifications = await this.em.find(Notification, {
      userId,
      channel: NotificationChannel.IN_APP,
      read: false,
    });

    const now = new Date();
    notifications.forEach((notification) => {
      notification.read = true;
      notification.readAt = now;
    });

    await this.em.flush();
    return notifications.length;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.findById(notificationId, userId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.em.removeAndFlush(notification);
  }

  /**
   * Count unread notifications
   */
  async countUnread(userId: string): Promise<number> {
    return this.countByUser(userId, true);
  }
}
