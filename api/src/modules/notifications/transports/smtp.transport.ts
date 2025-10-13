import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailTransport, EmailSendOptions } from '../interfaces/email-transport.interface';

@Injectable()
export class SmtpTransport implements EmailTransport {
  private readonly logger = new Logger(SmtpTransport.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (!host) {
      this.logger.warn('SMTP not configured: MAIL_HOST is missing');
      return;
    }

    const transportConfig: any = {
      host,
      port,
      secure: port === 465,
    };

    // Only add auth if user or pass is provided
    if (user || pass) {
      transportConfig.auth = { user, pass };
    }

    this.transporter = nodemailer.createTransport(transportConfig);

    const authInfo = user ? `${user}@${host}:${port}` : `${host}:${port}`;
    this.logger.log(`SMTP transport initialized: ${authInfo}`);
  }

  async sendEmail(options: EmailSendOptions): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Barksys');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS', 'noreply@barksys.com');
    const from = options.from || `"${fromName}" <${fromAddress}>`;

    if (!this.transporter) {
      throw new Error('SMTP not configured. Please set MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD environment variables.');
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error.message);
      throw error;
    }
  }
}
