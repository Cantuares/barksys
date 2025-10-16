import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SmtpTransport } from './transports/smtp.transport';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService, SmtpTransport],
  exports: [NotificationsService],
})
export class NotificationsModule {}
