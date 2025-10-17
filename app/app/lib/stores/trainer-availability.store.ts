import { create } from 'zustand';
import { trainerAvailabilityApi } from '../api/trainer-availability.api';
import type {
  AvailabilityConfig,
  CreateAvailabilityConfigData,
  UpdateAvailabilityConfigData,
  AvailabilityException,
  CreateAvailabilityExceptionData,
} from '../../types/trainer-availability.types';

interface TrainerAvailabilityStore {
  config: AvailabilityConfig | null;
  exceptions: AvailabilityException[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConfig: (trainerId: string) => Promise<void>;
  createConfig: (trainerId: string, data: CreateAvailabilityConfigData) => Promise<void>;
  updateConfig: (trainerId: string, data: UpdateAvailabilityConfigData) => Promise<void>;
  deleteConfig: (trainerId: string) => Promise<void>;
  fetchExceptions: (trainerId: string) => Promise<void>;
  createException: (trainerId: string, data: CreateAvailabilityExceptionData) => Promise<void>;
  deleteException: (trainerId: string, exceptionId: string) => Promise<void>;
  clearError: () => void;
}

export const useTrainerAvailabilityStore = create<TrainerAvailabilityStore>((set, get) => ({
  config: null,
  exceptions: [],
  isLoading: false,
  error: null,

  fetchConfig: async (trainerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const config = await trainerAvailabilityApi.getAvailabilityConfig(trainerId);
      set({ config, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar configuração',
        isLoading: false,
      });
    }
  },

  createConfig: async (trainerId: string, data: CreateAvailabilityConfigData) => {
    set({ isLoading: true, error: null });
    try {
      const config = await trainerAvailabilityApi.createAvailabilityConfig(trainerId, data);
      set({ config, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar configuração',
        isLoading: false,
      });
      throw error;
    }
  },

  updateConfig: async (trainerId: string, data: UpdateAvailabilityConfigData) => {
    set({ isLoading: true, error: null });
    try {
      const config = await trainerAvailabilityApi.updateAvailabilityConfig(trainerId, data);
      set({ config, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao atualizar configuração',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteConfig: async (trainerId: string) => {
    set({ isLoading: true, error: null });
    try {
      await trainerAvailabilityApi.deleteAvailabilityConfig(trainerId);
      set({ config: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao apagar configuração',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchExceptions: async (trainerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainerAvailabilityApi.getExceptions(trainerId);
      set({ exceptions: response.docs, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar exceções',
        isLoading: false,
      });
    }
  },

  createException: async (trainerId: string, data: CreateAvailabilityExceptionData) => {
    set({ isLoading: true, error: null });
    try {
      const exception = await trainerAvailabilityApi.createException(trainerId, data);
      set(state => ({
        exceptions: [exception, ...state.exceptions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar exceção',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteException: async (trainerId: string, exceptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await trainerAvailabilityApi.deleteException(trainerId, exceptionId);
      set(state => ({
        exceptions: state.exceptions.filter(e => e.id !== exceptionId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao apagar exceção',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
