import { create } from 'zustand';
import { templatesApi } from '../api/templates.api';
import type {
  TrainingSessionTemplate,
  CreateTemplateData,
  UpdateTemplateData,
  GenerateSessionsData,
  TemplateFilters,
} from '../../types/template.types';

interface TemplateStore {
  templates: TrainingSessionTemplate[];
  currentTemplate: TrainingSessionTemplate | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  // Actions
  fetchTemplates: (filters?: TemplateFilters) => Promise<void>;
  fetchTemplateById: (templateId: string) => Promise<void>;
  createTemplate: (data: CreateTemplateData) => Promise<TrainingSessionTemplate>;
  updateTemplate: (templateId: string, data: UpdateTemplateData) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  generateSessions: (trainerId: string, data: GenerateSessionsData) => Promise<void>;
  clearError: () => void;
  clearCurrentTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchTemplates: async (filters?: TemplateFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesApi.getTemplates(filters);
      set({
        templates: response.docs,
        totalPages: response.totalPages,
        currentPage: response.page,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar templates',
        isLoading: false,
      });
    }
  },

  fetchTemplateById: async (templateId: string) => {
    set({ isLoading: true, error: null });
    try {
      const template = await templatesApi.getTemplateById(templateId);
      set({
        currentTemplate: template,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar template',
        isLoading: false,
      });
    }
  },

  createTemplate: async (data: CreateTemplateData) => {
    set({ isLoading: true, error: null });
    try {
      const template = await templatesApi.createTemplate(data);
      set(state => ({
        templates: [template, ...state.templates],
        isLoading: false,
      }));
      return template;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar template',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTemplate: async (templateId: string, data: UpdateTemplateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTemplate = await templatesApi.updateTemplate(templateId, data);
      set(state => ({
        templates: state.templates.map(t => (t.id === templateId ? updatedTemplate : t)),
        currentTemplate:
          state.currentTemplate?.id === templateId ? updatedTemplate : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao atualizar template',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTemplate: async (templateId: string) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.deleteTemplate(templateId);
      set(state => ({
        templates: state.templates.filter(t => t.id !== templateId),
        currentTemplate: state.currentTemplate?.id === templateId ? null : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao apagar template',
        isLoading: false,
      });
      throw error;
    }
  },

  generateSessions: async (trainerId: string, data: GenerateSessionsData) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.generateSessions(trainerId, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao gerar sessões',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentTemplate: () => set({ currentTemplate: null }),
}));
