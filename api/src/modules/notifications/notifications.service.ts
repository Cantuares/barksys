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
import { SmtpTransport } from './transports/smtp.transport';
import { Notification, NotificationChannel, NotificationStatus } from './entities/notification.entity';

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
    const title = templateName === 'user-onboarding'
      ? translations.onboarding.title
      : translations.passwordReset.title;
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
}
