import { apiClient } from './client';
import type {
  Enrollment,
  EnrollmentResponse,
  CreateEnrollmentData,
  EnrollmentFilters,
} from '../../types/enrollment.types';

export const enrollmentsApi = {
  /**
   * Get enrollments with optional filters
   */
  getEnrollments: async (filters?: EnrollmentFilters): Promise<EnrollmentResponse> => {
    const params = new URLSearchParams();

    if (filters?.tutorId) {
      params.append('where[tutor][equals]', filters.tutorId);
    }
    if (filters?.petId) {
      params.append('where[pet][equals]', filters.petId);
    }
    if (filters?.trainingSessionId) {
      params.append('where[trainingSession][equals]', filters.trainingSessionId);
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('where[status][in]', s));
      } else {
        params.append('where[status][equals]', filters.status);
      }
    }

    params.append('page', (filters?.page || 1).toString());
    params.append('limit', (filters?.limit || 20).toString());
    params.append('sort', '-createdAt');

    const response = await apiClient.get(`/training-session-enrollments?${params}`) as Enrollment[] | EnrollmentResponse;

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
   * Get a specific enrollment by ID
   */
  getEnrollmentById: async (enrollmentId: string): Promise<Enrollment> => {
    return apiClient.get(`/training-session-enrollments/${enrollmentId}`);
  },

  /**
   * Create a new enrollment (enroll pet in session)
   */
  createEnrollment: async (data: CreateEnrollmentData): Promise<Enrollment> => {
    return apiClient.post('/training-session-enrollments', data);
  },

  /**
   * Cancel an enrollment
   */
  cancelEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
    return apiClient.put(`/training-session-enrollments/${enrollmentId}/cancel`, {});
  },

  /**
   * Delete an enrollment
   */
  deleteEnrollment: async (enrollmentId: string): Promise<void> => {
    return apiClient.delete(`/training-session-enrollments/${enrollmentId}`);
  },

  /**
   * Confirm enrollment via token (public link from email)
   */
  confirmEnrollment: async (token: string): Promise<void> => {
    return apiClient.get(`/training-session-enrollments/confirm/${token}`);
  },

  /**
   * Cancel enrollment via token (public link from email)
   */
  cancelEnrollmentByToken: async (token: string): Promise<void> => {
    return apiClient.get(`/training-session-enrollments/cancel/${token}`);
  },
};
