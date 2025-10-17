import { create } from 'zustand';
import { trainingSessionsApi } from '../api/training-sessions.api';
import type {
  TrainingSession,
  TrainingSessionFilters,
  CreateTrainingSessionData,
  UpdateTrainingSessionData,
} from '../../types/training-session.types';

interface TrainingSessionStore {
  sessions: TrainingSession[];
  currentSession: TrainingSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: (filters?: TrainingSessionFilters) => Promise<void>;
  fetchAvailableSessions: (filters?: {
    packageId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  fetchSessionById: (sessionId: string) => Promise<void>;
  createSession: (data: CreateTrainingSessionData) => Promise<TrainingSession>;
  updateSession: (sessionId: string, data: UpdateTrainingSessionData) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentSession: () => void;
}

export const useTrainingSessionStore = create<TrainingSessionStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async (filters?: TrainingSessionFilters) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await trainingSessionsApi.getSessions(filters);
      set({
        sessions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar sessões',
        isLoading: false,
      });
    }
  },

  fetchAvailableSessions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await trainingSessionsApi.getAvailableSessions(filters);
      set({
        sessions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar sessões disponíveis',
        isLoading: false,
      });
    }
  },

  fetchSessionById: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await trainingSessionsApi.getSessionById(sessionId);
      set({
        currentSession: session,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar sessão',
        isLoading: false,
      });
    }
  },

  createSession: async (data: CreateTrainingSessionData) => {
    set({ isLoading: true, error: null });
    try {
      const session = await trainingSessionsApi.createSession(data);
      set(state => ({
        sessions: [session, ...state.sessions],
        isLoading: false,
      }));
      return session;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar sessão',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSession: async (sessionId: string, data: UpdateTrainingSessionData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSession = await trainingSessionsApi.updateSession(sessionId, data);
      set(state => ({
        sessions: state.sessions.map(s => (s.id === sessionId ? updatedSession : s)),
        currentSession:
          state.currentSession?.id === sessionId ? updatedSession : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao atualizar sessão',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await trainingSessionsApi.deleteSession(sessionId);
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao apagar sessão',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentSession: () => set({ currentSession: null }),
}));
