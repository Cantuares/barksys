import { apiClient } from './client';
import type {
  LoginCredentials,
  RegisterData,
  OnboardingData,
  AuthResponse,
  RegisterResponse,
  OnboardingResponse,
  PasswordForgotResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../../types/auth.types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  async onboarding(token: string, data: OnboardingData): Promise<OnboardingResponse> {
    return apiClient.post<OnboardingResponse>(`/auth/onboarding/${token}`, data);
  },

  async forgotPassword(email: string): Promise<PasswordForgotResponse> {
    return apiClient.post<PasswordForgotResponse>('/auth/password/forgot', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/password/reset', {
      token,
      newPassword,
    });
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  async logout(refreshToken: string): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>('/auth/logout', { refreshToken });
  },

  async resendOnboarding(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/onboarding/resend', { email });
  },
};
