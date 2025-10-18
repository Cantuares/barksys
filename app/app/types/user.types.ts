import { User } from './auth.types';

export interface UserSession {
  id: string;
  userAgent: string;
  clientIp: string;
  isBlocked: boolean;
  expiresAt: Date;
  createdAt: Date;
  refreshToken: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SessionsResponse {
  sessions: UserSession[];
}
