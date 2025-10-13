import { Controller, Post, Param, HttpStatus, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SessionsService } from './sessions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Sessions')
@ApiBearerAuth('JWT-auth')
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly i18n: I18nService,
  ) {}

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({
    name: 'id',
    description: 'Session ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Session revoked successfully' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Cannot revoke sessions of other users' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  async revokeSession(@Param('id') id: string, @CurrentUser() user: User): Promise<{ message: string }> {
    const lang = I18nContext.current()?.lang || 'en';

    // Find session to verify ownership
    const session = await this.sessionsService.findById(id);

    if (!session) {
      throw new NotFoundException(this.i18n.translate('sessions.errors.notFound', { lang }));
    }

    // Check if session belongs to current user
    if (session.email !== user.email) {
      throw new ForbiddenException(this.i18n.translate('sessions.errors.cannotRevokeOtherSessions', { lang }));
    }

    await this.sessionsService.revokeSessionById(id);

    const message = this.i18n.translate('sessions.success.revoked', { lang });
    return { message };
  }
}
