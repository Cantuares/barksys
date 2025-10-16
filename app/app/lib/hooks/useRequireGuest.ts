import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './useAuth';
import { UserRole } from '../../types/auth.types';

export const useRequireGuest = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect authenticated users to appropriate dashboard
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
  }, [isAuthenticated, user, isLoading, navigate]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
};
