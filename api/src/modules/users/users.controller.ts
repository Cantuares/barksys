import { Controller, Post, Get, Body, Param, HttpStatus, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { CreateTutorResponseDto } from './dto/create-tutor-response.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { CreateTrainerResponseDto } from './dto/create-trainer-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from './entities/user.entity';

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
    if (user.id !== id) {
      const lang = I18nContext.current()?.lang || 'en';
      throw new ForbiddenException(this.i18n.translate('users.errors.cannotAccessOtherSessions', { lang }));
    }

    const sessions = await this.usersService.getUserSessions(user.email);

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

    if (user.id !== id) {
      throw new ForbiddenException(this.i18n.translate('users.errors.cannotChangeOtherPassword', { lang }));
    }

    await this.usersService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    const message = this.i18n.translate('users.success.passwordChanged', { lang });
    return new ChangePasswordResponseDto(message);
  }

  @Post('tutors')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Create a new tutor (admin and trainer)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tutor created successfully',
    type: CreateTutorResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only admins and trainers can create tutors' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User has no company associated' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  async createTutor(
    @Body() createTutorDto: CreateTutorDto,
    @CurrentUser() user: User,
  ): Promise<CreateTutorResponseDto> {
    const lang = I18nContext.current()?.lang || 'en';

    await this.usersService.createTutor(createTutorDto, user);

    const message = this.i18n.translate('users.success.tutorCreated', { lang });
    return new CreateTutorResponseDto(message);
  }

  @Post('trainers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new trainer (admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trainer created successfully',
    type: CreateTrainerResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only admins can create trainers' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Admin has no company associated' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  async createTrainer(
    @Body() createTrainerDto: CreateTrainerDto,
    @CurrentUser() user: User,
  ): Promise<CreateTrainerResponseDto> {
    const lang = I18nContext.current()?.lang || 'en';

    await this.usersService.createTrainer(createTrainerDto, user);

    const message = this.i18n.translate('users.success.trainerCreated', { lang });
    return new CreateTrainerResponseDto(message);
  }
}
