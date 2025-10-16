import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { PasswordForgotResponseDto } from './dto/password-forgot-response.dto';
import { OnboardingResendDto } from './dto/onboarding-resend.dto';
import { OnboardingResendResponseDto } from './dto/onboarding-resend-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { PasswordForgotDto } from './dto/password-forgot.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { RequestMetadata as RequestMetadataDecorator, RequestMetadata as RequestMetadataType } from '../../common/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid credentials' })
  async login(
    @CurrentUser() user: User,
    @Body() loginDto: LoginDto,
    @RequestMetadataDecorator() metadata: RequestMetadataType,
  ): Promise<AuthResponseDto> {
    return this.authService.login(user, metadata.userAgent, metadata.clientIp);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('onboarding/:token')
  @ApiOperation({ summary: 'Complete user onboarding: activate account and register company (admin only)' })
  @ApiParam({
    name: 'token',
    description: 'Email verification token (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account activated and company registered successfully',
    type: OnboardingResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Token expired, account already activated, or user not admin' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid verification token' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Company email or tax ID already exists' })
  async onboarding(
    @Param('token') token: string,
    @Body() onboardingDto: OnboardingDto,
  ): Promise<OnboardingResponseDto> {
    return this.authService.onboarding(token, onboardingDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset request processed',
    type: PasswordForgotResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User account is inactive' })
  async forgotPassword(@Body() passwordForgotDto: PasswordForgotDto): Promise<PasswordForgotResponseDto> {
    return this.authService.requestPasswordReset(passwordForgotDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('onboarding/resend')
  @ApiOperation({ summary: 'Resend onboarding email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Onboarding email resend request processed',
    type: OnboardingResendResponseDto,
  })
  async resendOnboarding(@Body() onboardingResendDto: OnboardingResendDto): Promise<OnboardingResendResponseDto> {
    return this.authService.resendOnboardingToken(onboardingResendDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Reset token has expired or validation failed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid reset token' })
  async resetPassword(@Body() passwordResetDto: PasswordResetDto) {
    return this.authService.resetPassword(passwordResetDto.token, passwordResetDto.newPassword);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access token generated successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid, expired or revoked refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out and session revoked',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token' })
  async logout(@Body() logoutDto: LogoutDto): Promise<LogoutResponseDto> {
    return this.authService.logout(logoutDto.refreshToken);
  }
}
