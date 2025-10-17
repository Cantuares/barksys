import { apiClient } from './client';
import type {
  TrainingSession,
  CreateTrainingSessionData,
  UpdateTrainingSessionData,
  TrainingSessionFilters,
} from '../../types/training-session.types';

export const trainingSessionsApi = {
  /**
   * Get training sessions with optional filters
   * Backend accepts: trainerId, packageId, limit, offset
   */
  getSessions: async (filters?: TrainingSessionFilters): Promise<TrainingSession[]> => {
    const params = new URLSearchParams();

    // Backend query params
    if (filters?.trainerId) {
      params.append('trainerId', filters.trainerId);
    }
    if (filters?.packageId) {
      params.append('packageId', filters.packageId);
    }

    // Limit and offset
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      params.append('offset', offset.toString());
    }

    const queryString = params.toString();
    return apiClient.get<TrainingSession[]>(
      `/training-sessions${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get available training sessions (with free slots)
   * Backend accepts: packageId, limit, offset
   */
  getAvailableSessions: async (filters?: {
    packageId?: string;
    limit?: number;
    offset?: number;
  }): Promise<TrainingSession[]> => {
    const params = new URLSearchParams();

    if (filters?.packageId) {
      params.append('packageId', filters.packageId);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    return apiClient.get<TrainingSession[]>(
      `/training-sessions/available${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get a specific training session by ID
   */
  getSessionById: async (sessionId: string): Promise<TrainingSession> => {
    return apiClient.get(`/training-sessions/${sessionId}`);
  },

  /**
   * Get enrollments for a specific session
   */
  getSessionEnrollments: async (sessionId: string) => {
    const response = await apiClient.get(`/training-sessions/${sessionId}/enrollments`);
    return Array.isArray(response) ? response : [];
  },

  /**
   * Create a new training session (trainer/admin only)
   */
  createSession: async (data: CreateTrainingSessionData): Promise<TrainingSession> => {
    return apiClient.post('/training-sessions', data);
  },

  /**
   * Update an existing training session
   * Backend uses PUT method
   */
  updateSession: async (
    sessionId: string,
    data: UpdateTrainingSessionData
  ): Promise<TrainingSession> => {
    return apiClient.put(`/training-sessions/${sessionId}`, data);
  },

  /**
   * Delete a training session
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    return apiClient.delete(`/training-sessions/${sessionId}`);
  },
};
