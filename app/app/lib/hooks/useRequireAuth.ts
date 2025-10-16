import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './useAuth';
import { UserRole } from '../../types/auth.types';

export const useRequireAuth = (allowedRoles?: UserRole[]) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isInitialized) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case UserRole.ADMIN:
            navigate('/dashboard');
            break;
          case UserRole.TRAINER:
            navigate('/trainer/dashboard');
            break;
          case UserRole.TUTOR:
            navigate('/tutor/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, isLoading, isInitialized, allowedRoles, navigate]);

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || !isInitialized,
  };
};
