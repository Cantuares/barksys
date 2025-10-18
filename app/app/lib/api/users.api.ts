import { apiClient } from './client';
import type {
  UserProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SessionsResponse,
} from '../../types/user.types';

export const usersApi = {
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>('/users/me');
  },

  async changePassword(
    userId: string,
    changePasswordData: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return apiClient.post<ChangePasswordResponse>(
      `/users/${userId}/change-password`,
      changePasswordData
    );
  },

  async getSessions(userId: string): Promise<SessionsResponse> {
    return apiClient.get<SessionsResponse>(`/users/${userId}/sessions`);
  },
};
