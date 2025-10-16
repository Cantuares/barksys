import { UserRole } from '../../types/auth.types';

/**
 * Get the appropriate dashboard route for a user based on their role
 */
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard';
    case UserRole.TRAINER:
      return '/trainer/dashboard';
    case UserRole.TUTOR:
      return '/tutor/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Navigate to the appropriate dashboard for a user
 * This function can be called from outside React components
 */
export const navigateToDashboard = (role: UserRole): void => {
  const route = getDashboardRoute(role);
  // Use window.location for navigation outside React components
  window.location.href = route;
};
