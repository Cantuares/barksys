import { apiClient } from './client';
import type {
  TrainingSessionTemplate,
  CreateTemplateData,
  UpdateTemplateData,
  GenerateSessionsData,
  GenerateSessionsResult,
  TemplateFilters,
  TemplateResponse,
} from '../../types/template.types';

export const templatesApi = {
  /**
   * Get training session templates with optional filters
   */
  getTemplates: async (filters?: TemplateFilters): Promise<TemplateResponse> => {
    const params = new URLSearchParams();

    if (filters?.trainerId) {
      params.append('where[trainer][equals]', filters.trainerId);
    }
    if (filters?.packageId) {
      params.append('where[package][equals]', filters.packageId);
    }
    if (filters?.status) {
      params.append('where[status][equals]', filters.status);
    }

    params.append('page', (filters?.page || 1).toString());
    params.append('limit', (filters?.limit || 20).toString());
    params.append('sort', '-createdAt');

    const response = await apiClient.get(`/training-session-templates?${params}`) as TrainingSessionTemplate[] | TemplateResponse;

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
   * Get a specific template by ID
   */
  getTemplateById: async (templateId: string): Promise<TrainingSessionTemplate> => {
    return apiClient.get(`/training-session-templates/${templateId}`);
  },

  /**
   * Create a new training session template
   */
  createTemplate: async (data: CreateTemplateData): Promise<TrainingSessionTemplate> => {
    return apiClient.post('/training-session-templates', data);
  },

  /**
   * Update an existing template
   */
  updateTemplate: async (
    templateId: string,
    data: UpdateTemplateData
  ): Promise<TrainingSessionTemplate> => {
    return apiClient.patch(`/training-session-templates/${templateId}`, data);
  },

  /**
   * Delete a template
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    return apiClient.delete(`/training-session-templates/${templateId}`);
  },

  /**
   * Generate training sessions from a template
   */
  generateSessions: async (
    trainerId: string,
    data: GenerateSessionsData
  ): Promise<GenerateSessionsResult> => {
    return apiClient.post(`/trainers/${trainerId}/sessions/generate`, data);
  },
};
