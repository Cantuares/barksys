export abstract class NotificationEvent {
  public readonly eventName: string;
  public readonly timestamp: Date;

  constructor(eventName: string) {
    this.eventName = eventName;
    this.timestamp = new Date();
  }
}
