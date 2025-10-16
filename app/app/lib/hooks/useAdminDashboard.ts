import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { AdminDashboardResponse } from '../../types/dashboard.types';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dashboardApi.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
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
