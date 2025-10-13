import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { CompaniesService } from '../companies/companies.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { PasswordForgotResponseDto } from './dto/password-forgot-response.dto';
import { ActivationResendResponseDto } from './dto/activation-resend-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
    private i18n: I18nService,
    private em: EntityManager,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    await this.usersService.create(registerDto);

    const message = this.i18n.translate('auth.register.success', {
      lang: I18nContext.current()?.lang || 'en',
    });

    return new RegisterResponseDto(message);
  }

  async login(user: User, userAgent: string, clientIp: string): Promise<AuthResponseDto> {
    const access_token = await this.generateToken(user);
    const session = await this.sessionsService.createSession(user.email, userAgent, clientIp);

    return new AuthResponseDto(access_token, session.refreshToken, user);
  }

  async onboarding(token: string, onboardingDto: OnboardingDto): Promise<OnboardingResponseDto> {
    const lang = I18nContext.current()?.lang || 'en';

    // Use transaction to ensure atomicity - all or nothing
    return await this.em.transactional(async (em) => {
      // Find user by verification token
      const user = await this.usersService.findByVerificationToken(token);

      if (!user) {
        throw new NotFoundException(this.i18n.translate('auth.activate.invalidToken', { lang }));
      }

      // Validate user role is admin
      if (user.role !== UserRole.ADMIN) {
        throw new BadRequestException(this.i18n.translate('auth.onboarding.notAdmin', { lang }));
      }

      // Validate account status
      if (user.isActive && user.isEmailVerified) {
        throw new BadRequestException(this.i18n.translate('auth.activate.alreadyActivated', { lang }));
      }

      // Validate token expiration
      if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < new Date()) {
        throw new BadRequestException(this.i18n.translate('auth.activate.tokenExpired', { lang }));
      }

      // Activate user account
      await this.usersService.activateUser(user);

      // Register company
      await this.companiesService.create(user, {
        name: onboardingDto.name,
        email: onboardingDto.email,
        taxId: onboardingDto.taxId,
        taxType: onboardingDto.taxType,
        billingAddress: onboardingDto.billingAddress,
        city: onboardingDto.city,
        country: onboardingDto.country,
        postalCode: onboardingDto.postalCode,
      });

      const message = this.i18n.translate('auth.onboarding.success', { lang });
      return new OnboardingResponseDto(message);
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      const lang = I18nContext.current()?.lang || 'en';
      throw new UnauthorizedException(this.i18n.translate('auth.login.inactiveAccount', { lang }));
    }

    return user;
  }

  async requestPasswordReset(email: string): Promise<PasswordForgotResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const lang = I18nContext.current()?.lang || 'en';

    if (!user) {
      // Return success message even if user not found (security best practice)
      const message = this.i18n.translate('auth.forgotPassword.success', { lang });
      return new PasswordForgotResponseDto(message);
    }

    if (!user.isActive) {
      throw new BadRequestException(this.i18n.translate('auth.forgotPassword.inactiveAccount', { lang }));
    }

    await this.usersService.setPasswordResetToken(user);

    const message = this.i18n.translate('auth.forgotPassword.success', { lang });
    return new PasswordForgotResponseDto(message);
  }

  async resendActivationToken(email: string): Promise<ActivationResendResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const lang = I18nContext.current()?.lang || 'en';

    if (!user) {
      // Return success message even if user not found (security best practice)
      const message = this.i18n.translate('auth.resendActivation.success', { lang });
      return new ActivationResendResponseDto(message);
    }

    if (user.isActive && user.isEmailVerified) {
      // Return success message if already activated (security best practice)
      const message = this.i18n.translate('auth.resendActivation.success', { lang });
      return new ActivationResendResponseDto(message);
    }

    await this.usersService.resendActivationToken(user);

    const message = this.i18n.translate('auth.resendActivation.success', { lang });
    return new ActivationResendResponseDto(message);
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);
    const lang = I18nContext.current()?.lang || 'en';

    if (!user) {
      throw new NotFoundException(this.i18n.translate('auth.resetPassword.invalidToken', { lang }));
    }

    if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
      throw new BadRequestException(this.i18n.translate('auth.resetPassword.tokenExpired', { lang }));
    }

    await this.usersService.updatePassword(user, newPassword);

    const message = this.i18n.translate('auth.resetPassword.success', { lang });
    return { message };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const session = await this.sessionsService.findByRefreshToken(refreshToken);
    const lang = I18nContext.current()?.lang || 'en';

    if (!session) {
      throw new UnauthorizedException(this.i18n.translate('auth.refreshToken.invalid', { lang }));
    }

    if (session.isBlocked) {
      throw new UnauthorizedException(this.i18n.translate('auth.refreshToken.revoked', { lang }));
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException(this.i18n.translate('auth.refreshToken.expired', { lang }));
    }

    const user = await this.usersService.findByEmail(session.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(this.i18n.translate('auth.refreshToken.userInactive', { lang }));
    }

    const access_token = await this.generateToken(user);

    return new RefreshTokenResponseDto(access_token);
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    const session = await this.sessionsService.findByRefreshToken(refreshToken);
    const lang = I18nContext.current()?.lang || 'en';

    if (!session) {
      throw new UnauthorizedException(this.i18n.translate('auth.logout.invalidToken', { lang }));
    }

    // Revoke the session
    await this.sessionsService.revokeSession(session);

    const message = this.i18n.translate('auth.logout.success', { lang });
    return new LogoutResponseDto(message);
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
