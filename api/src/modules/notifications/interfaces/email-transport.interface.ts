export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailTransport {
  sendEmail(options: EmailSendOptions): Promise<void>;
}
