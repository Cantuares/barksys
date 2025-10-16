import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ParseBoolPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsListResponseDto } from './dto/notifications-list-response.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('unreadOnly', new ParseBoolPipe({ optional: true })) unreadOnly?: boolean,
  ): Promise<NotificationsListResponseDto> {
    const notifications = await this.notificationsService.findByUser(
      user.id,
      limit ? +limit : 20,
      offset ? +offset : 0,
      unreadOnly || false,
    );

    const total = await this.notificationsService.countByUser(user.id, false);
    const unreadCount = await this.notificationsService.countUnread(user.id);

    return {
      notifications: notifications.map(NotificationResponseDto.fromEntity),
      total,
      unreadCount,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.notificationsService.countUnread(user.id);
    return { count };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.findById(id, user.id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return NotificationResponseDto.fromEntity(notification);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.notificationsService.markAsRead(id, user.id);
      return NotificationResponseDto.fromEntity(notification);
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }

  @Patch('mark-all-read')
  async markAllAsRead(@CurrentUser() user: User): Promise<{ updated: number }> {
    const updated = await this.notificationsService.markAllAsRead(user.id);
    return { updated };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    try {
      await this.notificationsService.deleteNotification(id, user.id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }
}
