import { apiClient } from './client';
import type { 
  AdminDashboardResponse, 
  TrainerDashboardResponse, 
  TutorDashboardResponse 
} from '../../types/dashboard.types';

export const dashboardApi = {
  /**
   * Get admin/owner dashboard stats
   */
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await apiClient.get<AdminDashboardResponse>('/dashboard/admin');
    return response;
  },

  /**
   * Get trainer dashboard stats
   */
  getTrainerDashboard: async (): Promise<TrainerDashboardResponse> => {
    const response = await apiClient.get<TrainerDashboardResponse>('/dashboard/trainer');
    return response;
  },

  /**
   * Get tutor dashboard stats
   */
  getTutorDashboard: async (): Promise<TutorDashboardResponse> => {
    const response = await apiClient.get<TutorDashboardResponse>('/dashboard/tutor');
    return response;
  },
};
