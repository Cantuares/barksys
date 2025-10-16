import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  userId?: string;
  channel: string;
  title?: string; // Mapped from subject for in-app notifications
  body?: string; // Mapped from templateContext.body
  actionUrl?: string; // Mapped from templateContext.actionUrl
  priority?: string; // Mapped from templateContext.priority
  metadata?: Record<string, any>; // Mapped from templateContext
  read?: boolean;
  readAt?: Date;
  createdAt: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    const context = notification.templateContext || {};

    return {
      id: notification.id,
      userId: notification.userId,
      channel: notification.channel,
      title: notification.subject || context.title,
      body: context.body,
      actionUrl: context.actionUrl,
      priority: context.priority,
      metadata: context,
      read: notification.read,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
