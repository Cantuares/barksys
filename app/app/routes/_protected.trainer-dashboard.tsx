import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { StatsCard } from '../components/ui/StatsCard';
import { WelcomeBanner } from '../components/ui/WelcomeBanner';
import { QuickActions } from '../components/ui/QuickActions';
import { SessionCard } from '../components/ui/SessionCard';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useTrainerDashboard } from '../lib/hooks/useTrainerDashboard';
import { UserRole } from '../types/auth.types';

export default function TrainerDashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TRAINER, UserRole.ADMIN]);
  const { stats, isLoading, error, refreshStats } = useTrainerDashboard();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: 'calendar-plus',
      label: t('dashboard.trainer.newSession'),
      colorClass: 'primary',
      onClick: () => navigate('/sessions/new')
    },
    {
      icon: 'users',
      label: t('dashboard.trainer.enrollments'),
      colorClass: 'green',
      onClick: () => navigate('/enrollments')
    },
    {
      icon: 'chart-bar',
      label: t('dashboard.trainer.reports'),
      colorClass: 'purple',
      onClick: () => navigate('/reports')
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header
        title="BarkSys"
        subtitle={`Trainer - ${user?.fullName || 'Trainer'}!`}
      />

      {/* Loading State */}
      {isLoading ? (
        <main className="p-4 space-y-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('dashboard.common.loading')}</p>
          </div>
        </main>
      ) : error ? (
        /* Error State */
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
            <p className="text-red-800 font-medium mb-2">{t('dashboard.common.error')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              onClick={refreshStats}
            >
              {t('dashboard.common.tryAgain')}
            </button>
          </div>
        </main>
      ) : stats ? (
        /* Main Content */
        <main className="p-4 space-y-6">
          {/* Welcome Banner */}
          <WelcomeBanner
            title={t('dashboard.trainer.title')}
            description={t('dashboard.trainer.subtitle')}
            buttonText={stats.upcomingSessions?.length ? 
              t('dashboard.trainer.seeUpcomingSessions') : 
              t('dashboard.trainer.createSession')
            }
            onButtonClick={() => navigate('/sessions')}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              data={{
                label: t('dashboard.trainer.totalSessions'),
                value: stats.totalSessions,
                icon: 'calendar-check',
                colorClass: 'primary',
                subtitle: t('dashboard.trainer.thisWeek')
              }}
            />
            
            <StatsCard
              data={{
                label: t('dashboard.trainer.totalTutors'),
                value: stats.totalTutors,
                icon: 'users',
                colorClass: 'blue',
                subtitle: t('dashboard.trainer.activeClients')
              }}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions
            title={t('dashboard.trainer.quickActions')}
            actions={quickActions}
            columns={3}
          />

          {/* Session Statistics */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">{t('dashboard.trainer.sessionStatistics')}</h2>
              <button 
                className="text-primary-500 text-sm"
                onClick={refreshStats}
              >
                {t('dashboard.admin.update')}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-calendar text-green-500"></i>
                  </div>
                  <div>
                    <div className="font-medium">{t('dashboard.trainer.sessionsToday')}</div>
                    <div className="text-sm text-gray-500">
                      {t('dashboard.trainer.thisWeek')}: {stats.sessionsThisWeek}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-lg">{stats.sessionsToday}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-percentage text-green-500"></i>
                  </div>
                  <div>
                    <div className="font-medium">{t('dashboard.trainer.occupancyRate')}</div>
                    <div className="text-sm text-gray-500">
                      {stats.statistics.occupiedSlots}/{stats.statistics.totalSlots} {t('dashboard.trainer.slots')}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-lg text-primary-500">{stats.occupancyRate}%</span>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          {stats.upcomingSessions?.length > 0 ? (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">{t('dashboard.trainer.upcomingSessions')}</h2>
                <button className="text-primary-500 text-sm">{t('dashboard.common.seeAll')}</button>
              </div>
              <div className="space-y-4">
                {stats.upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onViewDetails={() => navigate(`/trainer/sessions/${session.id}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-center py-8">
                <i className="fas fa-calendar-times text-gray-300 text-4xl mb-4"></i>
                <p className="text-gray-500 mb-4">{t('dashboard.trainer.noSessions')}</p>
                <button className="bg-primary-500 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  <i className="fas fa-plus mr-2"></i>{t('dashboard.trainer.createSession')}
                </button>
              </div>
            </div>
          )}
        </main>
      ) : null}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="trainer"
        activeRoute="home"
      />
    </div>
  );
}