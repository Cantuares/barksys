import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import { apiClient } from '../api/client';
import { ApiError } from '../../types/api.types';
import { navigateToDashboard } from '../utils/navigation';
import type {
  AuthState,
  AuthActions,
  User,
  LoginCredentials,
  RegisterData,
  OnboardingData,
} from '../../types/auth.types';

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Update API client with new token
          apiClient.setAuthTokenGetter(() => get().accessToken);

          // Navigate to appropriate dashboard based on user role
          navigateToDashboard(response.user.role);
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Login failed. Please try again.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.register(data);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Registration failed. Please try again.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      onboarding: async (token: string, data: OnboardingData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.onboarding(token, data);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Onboarding failed. Please try again.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Password reset request failed. Please try again.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.resetPassword(token, newPassword);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Password reset failed. Please try again.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          
          set({
            accessToken: response.access_token,
            error: null,
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (error) {
            console.warn('Logout API call failed:', error);
          }
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear API client auth token
        apiClient.setAuthTokenGetter(() => null);

        // Navigate to login page
        window.location.href = '/login';
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: async () => {
        const { accessToken, refreshToken } = get();
        
        if (!accessToken || !refreshToken) {
          return;
        }

        // Set up API client with current token
        apiClient.setAuthTokenGetter(() => get().accessToken);

        // Try to refresh token to validate session
        try {
          await get().refreshAccessToken();
        } catch (error) {
          // If refresh fails, clear auth state
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
