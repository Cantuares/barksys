import { apiClient } from './client';
import type {
  AvailabilityConfig,
  CreateAvailabilityConfigData,
  UpdateAvailabilityConfigData,
  AvailabilityException,
  CreateAvailabilityExceptionData,
  AvailabilityExceptionResponse,
} from '../../types/trainer-availability.types';

export const trainerAvailabilityApi = {
  /**
   * Create or update availability configuration for a trainer
   */
  createAvailabilityConfig: async (
    trainerId: string,
    data: CreateAvailabilityConfigData
  ): Promise<AvailabilityConfig> => {
    return apiClient.post(`/trainers/${trainerId}/availability/config`, data);
  },

  /**
   * Get availability configuration for a trainer
   */
  getAvailabilityConfig: async (trainerId: string): Promise<AvailabilityConfig> => {
    return apiClient.get(`/trainers/${trainerId}/availability/config`);
  },

  /**
   * Update availability configuration
   */
  updateAvailabilityConfig: async (
    trainerId: string,
    data: UpdateAvailabilityConfigData
  ): Promise<AvailabilityConfig> => {
    return apiClient.put(`/trainers/${trainerId}/availability/config`, data);
  },

  /**
   * Delete availability configuration
   */
  deleteAvailabilityConfig: async (trainerId: string): Promise<void> => {
    return apiClient.delete(`/trainers/${trainerId}/availability/config`);
  },

  /**
   * Create an availability exception (holiday, absence, etc.)
   */
  createException: async (
    trainerId: string,
    data: CreateAvailabilityExceptionData
  ): Promise<AvailabilityException> => {
    return apiClient.post(`/trainers/${trainerId}/availability/exceptions`, data);
  },

  /**
   * Get all availability exceptions for a trainer
   */
  getExceptions: async (
    trainerId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<AvailabilityExceptionResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: 'date',
    });

    const response = await apiClient.get(
      `/trainers/${trainerId}/availability/exceptions?${params}`
    ) as AvailabilityException[] | AvailabilityExceptionResponse;

    // Handle both array and paginated response
    if (Array.isArray(response)) {
      return {
        docs: response,
        totalDocs: response.length,
        page: 1,
        totalPages: 1,
        limit: response.length,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    return response;
  },

  /**
   * Delete an availability exception
   */
  deleteException: async (trainerId: string, exceptionId: string): Promise<void> => {
    return apiClient.delete(`/trainers/${trainerId}/availability/exceptions/${exceptionId}`);
  },
};
