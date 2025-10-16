import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Session } from './entities/session.entity';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsService {
  constructor(
    private readonly em: EntityManager,
    private readonly i18n: I18nService,
  ) {}

  async createSession(
    email: string,
    userAgent: string,
    clientIp: string,
    refreshTokenExpiresInDays: number = 7,
  ): Promise<Session> {
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);

    const session = this.em.create(Session, {
      email,
      refreshToken,
      userAgent,
      clientIp,
      isBlocked: false,
      expiresAt,
      createdAt: new Date(),
    });

    await this.em.persistAndFlush(session);

    return session;
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.em.findOne(Session, { refreshToken });
  }

  async findById(id: string): Promise<Session | null> {
    return this.em.findOne(Session, { id });
  }

  async revokeSession(session: Session): Promise<void> {
    session.isBlocked = true;
    await this.em.persistAndFlush(session);
  }

  async revokeSessionById(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (session) {
      await this.revokeSession(session);
    }
  }

  async revokeAllUserSessions(email: string): Promise<void> {
    await this.em.nativeUpdate(
      Session,
      { email, isBlocked: false },
      { isBlocked: true },
    );
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.em.nativeDelete(Session, {
      expiresAt: { $lt: new Date() },
    });
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    const session = await this.findByRefreshToken(refreshToken);
    const lang = I18nContext.current()?.lang || 'en';

    if (!session) {
      throw new UnauthorizedException(this.i18n.translate('sessions.errors.invalidToken', { lang }));
    }

    // Revoke the session
    await this.revokeSession(session);

    const message = this.i18n.translate('sessions.success.logout', { lang });
    return new LogoutResponseDto(message);
  }
}
