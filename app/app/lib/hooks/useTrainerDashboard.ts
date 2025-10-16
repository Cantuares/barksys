import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { TrainerDashboardResponse } from '../../types/dashboard.types';

export const useTrainerDashboard = () => {
  const [stats, setStats] = useState<TrainerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dashboardApi.getTrainerDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load trainer dashboard stats:', err);
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
