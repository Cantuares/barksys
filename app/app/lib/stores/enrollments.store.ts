import { create } from 'zustand';
import { enrollmentsApi } from '../api/enrollments.api';
import type {
  Enrollment,
  EnrollmentFilters,
  CreateEnrollmentData,
} from '../../types/enrollment.types';

interface EnrollmentStore {
  enrollments: Enrollment[];
  currentEnrollment: Enrollment | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  // Actions
  fetchEnrollments: (filters?: EnrollmentFilters) => Promise<void>;
  fetchEnrollmentById: (enrollmentId: string) => Promise<void>;
  createEnrollment: (data: CreateEnrollmentData) => Promise<Enrollment>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  deleteEnrollment: (enrollmentId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentEnrollment: () => void;
}

export const useEnrollmentStore = create<EnrollmentStore>((set, get) => ({
  enrollments: [],
  currentEnrollment: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchEnrollments: async (filters?: EnrollmentFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await enrollmentsApi.getEnrollments(filters);
      set({
        enrollments: response.docs,
        totalPages: response.totalPages,
        currentPage: response.page,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar inscrições',
        isLoading: false,
      });
    }
  },

  fetchEnrollmentById: async (enrollmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const enrollment = await enrollmentsApi.getEnrollmentById(enrollmentId);
      set({
        currentEnrollment: enrollment,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar inscrição',
        isLoading: false,
      });
    }
  },

  createEnrollment: async (data: CreateEnrollmentData) => {
    set({ isLoading: true, error: null });
    try {
      const enrollment = await enrollmentsApi.createEnrollment(data);
      set(state => ({
        enrollments: [enrollment, ...state.enrollments],
        isLoading: false,
      }));
      return enrollment;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar inscrição',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelEnrollment: async (enrollmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cancelledEnrollment = await enrollmentsApi.cancelEnrollment(enrollmentId);
      set(state => ({
        enrollments: state.enrollments.map(e =>
          e.id === enrollmentId ? cancelledEnrollment : e
        ),
        currentEnrollment:
          state.currentEnrollment?.id === enrollmentId
            ? cancelledEnrollment
            : state.currentEnrollment,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao cancelar inscrição',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEnrollment: async (enrollmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await enrollmentsApi.deleteEnrollment(enrollmentId);
      set(state => ({
        enrollments: state.enrollments.filter(e => e.id !== enrollmentId),
        currentEnrollment:
          state.currentEnrollment?.id === enrollmentId ? null : state.currentEnrollment,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao apagar inscrição',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentEnrollment: () => set({ currentEnrollment: null }),
}));
