import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { StatsCard } from '../components/ui/StatsCard';
import { WelcomeBanner } from '../components/ui/WelcomeBanner';
import { QuickActions } from '../components/ui/QuickActions';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useAdminDashboard } from '../lib/hooks/useAdminDashboard';
import { formatCurrency, formatDate } from '../lib/utils/date';
import { UserRole } from '../types/auth.types';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.ADMIN]);
  const { stats, isLoading, error, refreshStats } = useAdminDashboard();
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
      icon: 'users',
      label: t('dashboard.admin.tutors'),
      colorClass: 'primary',
      onClick: () => navigate('/tutors')
    },
    {
      icon: 'user-tie',
      label: t('dashboard.admin.trainers'),
      colorClass: 'blue',
      onClick: () => navigate('/trainers')
    },
    {
      icon: 'chart-bar',
      label: t('dashboard.admin.reports'),
      colorClass: 'purple',
      onClick: () => navigate('/reports')
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header
        title="BarkSys"
        subtitle={`${t('dashboard.admin.title')} - ${user?.fullName || 'Admin'}!`}
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
            title={t('dashboard.admin.title')}
            description={t('dashboard.admin.subtitle')}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              data={{
                label: t('dashboard.admin.monthlyRevenue'),
                value: formatCurrency(stats.revenue.currentMonth),
                icon: 'euro-sign',
                colorClass: 'primary',
                subtitle: stats.revenue.growth !== 0 ? 
                  `${stats.revenue.growth >= 0 ? '+' : ''}${stats.revenue.growth}% vs ${t('dashboard.admin.previousMonth').toLowerCase()}` : 
                  undefined,
                subtitleColorClass: stats.revenue.growth >= 0 ? 'text-primary-500' : 'text-red-500'
              }}
            />
            
            <StatsCard
              data={{
                label: t('dashboard.admin.totalClients'),
                value: stats.team.totalTutors,
                icon: 'users',
                colorClass: 'blue',
                subtitle: `${stats.team.totalPets} pets`
              }}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions
            title={t('dashboard.admin.quickActions')}
            actions={quickActions}
            columns={3}
          />

          {/* Business Metrics */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">{t('dashboard.admin.businessMetrics')}</h2>
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
                    <div className="font-medium">{t('dashboard.admin.totalSessions')}</div>
                    <div className="text-sm text-gray-500">
                      {t('dashboard.trainer.thisWeek')}: {stats.business.currentMonthSessions}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-lg">{stats.business.totalSessions}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-percentage text-blue-500"></i>
                  </div>
                  <div>
                    <div className="font-medium">{t('dashboard.admin.occupancyRate')}</div>
                    <div className="text-sm text-gray-500">{t('dashboard.trainer.general')}</div>
                  </div>
                </div>
                <span className="font-bold text-lg text-primary-500">{stats.business.occupancyRate}%</span>
              </div>
            </div>
          </div>

          {/* Trainer Performance */}
          {stats.trainerPerformance?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">{t('dashboard.admin.trainerPerformance')}</h2>
                <button className="text-primary-500 text-sm">{t('dashboard.common.seeAll')}</button>
              </div>
              <div className="space-y-3">
                {stats.trainerPerformance.map((trainer) => (
                  <div key={trainer.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className="bg-primary-100 p-2 rounded-lg mr-3">
                      <i className="fas fa-user-tie text-primary-500"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{trainer.name}</div>
                      <div className="text-sm text-gray-500">
                        {trainer.totalSessions} sessions • {trainer.totalEnrollments} enrollments
                      </div>
                    </div>
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      {trainer.occupancyRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {stats.recentActivity?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-lg mb-3">{t('dashboard.admin.recentActivity')}</h2>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                      <i className="fas fa-shopping-cart text-green-500"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.tutorName}</p>
                      <p className="text-xs text-gray-500">{activity.packageName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(activity.date.toString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Summary */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-lg mb-3">{t('dashboard.admin.revenueSummary')}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('dashboard.admin.totalGeneral')}</span>
                <span className="font-semibold text-lg">{formatCurrency(stats.revenue.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('dashboard.admin.previousMonth')}</span>
                <span className="font-medium">{formatCurrency(stats.revenue.previousMonth)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('dashboard.admin.growth')}</span>
                  <span className={`font-semibold ${stats.revenue.growth >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
                    {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : null}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="admin"
        activeRoute="home"
      />
    </div>
  );
}