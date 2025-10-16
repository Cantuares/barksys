import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { TutorDashboardStats } from '../../types/dashboard.types';

export const useTutorDashboard = () => {
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dashboardApi.getTutorDashboard();
      
      // Transform API response to match existing interface
      const transformedStats: TutorDashboardStats = {
        totalPets: data.totalPets,
        sessionsToday: data.sessionsToday,
        sessionsThisWeek: data.sessionsThisWeek,
        remainingSessions: {
          total: data.remainingSessions.total,
          byPackage: data.remainingSessions.byPackage.map(pkg => ({
            packageName: pkg.packageName,
            usedSessions: pkg.usedSessions,
            total: pkg.total,
            remaining: pkg.remaining
          }))
        },
        upcomingSessions: data.upcomingSessions.map(session => ({
          id: session.id,
          date: session.date.toString(),
          startTime: session.startTime,
          endTime: session.endTime,
          pet: { name: session.pet.name },
          trainer: { name: session.trainer.name }
        }))
      };
      
      setStats(transformedStats);
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
