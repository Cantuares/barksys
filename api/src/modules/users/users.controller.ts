import { Controller, Post, Get, Body, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns current user profile',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token' })
  async getMe(@CurrentUser() user: User): Promise<UserProfileResponseDto> {
    return new UserProfileResponseDto(user);
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID v7)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User sessions retrieved successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Cannot access other user sessions' })
  async getSessions(@Param('id') id: string, @CurrentUser() user: User): Promise<SessionResponseDto> {
    const sessions = await this.usersService.getUserSessions(id, user.id);
    return new SessionResponseDto(sessions);
  }

  @Post(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID v7)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    type: ChangePasswordResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token or current password incorrect' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Cannot change other user password' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request - Validation failed' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ): Promise<ChangePasswordResponseDto> {
    const lang = I18nContext.current()?.lang || 'en';

    await this.usersService.changePassword(
      id,
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    const message = this.i18n.translate('users.success.passwordChanged', { lang });
    return new ChangePasswordResponseDto(message);
  }

}
