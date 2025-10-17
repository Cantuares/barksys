import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { TutorDashboardResponse } from '../../types/dashboard.types';

export const useTutorDashboard = () => {
  const [stats, setStats] = useState<TutorDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardApi.getTutorDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load tutor dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats: loadDashboardStats
  };
};
