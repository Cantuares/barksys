import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Session } from './entities/session.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsService {
  constructor(private readonly em: EntityManager) {}

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
}
