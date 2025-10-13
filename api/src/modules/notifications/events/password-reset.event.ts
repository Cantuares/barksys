import { NotificationEvent } from './notification.event';

export class PasswordResetEvent extends NotificationEvent {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly resetToken: string,
    public readonly lang: string = 'en',
  ) {
    super('password.reset.requested');
  }
}
