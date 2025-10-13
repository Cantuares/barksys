import { NotificationEvent } from './notification.event';

export class UserRegisteredEvent extends NotificationEvent {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly verificationToken: string,
    public readonly lang: string = 'en',
  ) {
    super('user.registered');
  }
}
