import { useAuthStore } from '../stores/auth.store';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const store = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize auth state on mount
    const initAuth = async () => {
      try {
        await store.initialize();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [store]);

  return {
    user: store.user,
    accessToken: store.accessToken,
    refreshToken: store.refreshToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    isInitialized,
    login: store.login,
    register: store.register,
    onboarding: store.onboarding,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    logout: store.logout,
    clearError: store.clearError,
  };
};
