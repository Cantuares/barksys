import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { StatsCard } from '../components/ui/StatsCard';
import { WelcomeBanner } from '../components/ui/WelcomeBanner';
import { QuickActions } from '../components/ui/QuickActions';
import { SessionCard } from '../components/ui/SessionCard';
import { PackageProgress } from '../components/ui/PackageProgress';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useTutorDashboard } from '../lib/hooks/useTutorDashboard';
import { UserRole } from '../types/auth.types';

export default function TutorDashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { stats, isLoading, error, refreshStats } = useTutorDashboard();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: 'calendar-plus',
      label: t('dashboard.tutor.scheduleSession'),
      colorClass: 'primary',
      onClick: () => navigate('/sessions')
    },
    {
      icon: 'clipboard-list',
      label: t('dashboard.tutor.myEnrollments'),
      colorClass: 'blue',
      onClick: () => navigate('/enrollments')
    },
    {
      icon: 'paw',
      label: t('dashboard.tutor.myPets'),
      colorClass: 'green',
      onClick: () => navigate('/tutor/pets')
    },
    {
      icon: 'shopping-bag',
      label: t('dashboard.tutor.packages'),
      colorClass: 'purple',
      onClick: () => navigate('/packages')
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header 
        title="DogTrain"
        subtitle={`${t('dashboard.tutor.title')} - ${user?.fullName || 'Tutor'}!`}
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
            title={t('dashboard.tutor.title')}
            description={t('dashboard.tutor.subtitle')}
            buttonText={stats.upcomingSessions?.length ? 
              t('dashboard.tutor.seeUpcomingSessions') : 
              t('dashboard.tutor.scheduleFirstSession')
            }
            onButtonClick={() => navigate('/sessions')}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              data={{
                label: t('dashboard.tutor.remainingSessions'),
                value: stats.remainingSessions?.total || 0,
                icon: 'calendar-check',
                colorClass: 'primary',
                subtitle: stats.remainingSessions?.byPackage?.length ? 
                  stats.remainingSessions.byPackage[0]?.packageName : 
                  undefined,
                subtitleColorClass: 'text-primary-500'
              }}
            />
            
            <StatsCard
              data={{
                label: t('dashboard.tutor.totalPets'),
                value: stats.totalPets || 0,
                icon: 'paw',
                colorClass: 'blue',
                subtitle: t('dashboard.tutor.registered')
              }}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions
            title={t('dashboard.tutor.quickActions')}
            actions={quickActions}
            columns={2}
          />

          {/* Upcoming Sessions */}
          {stats.upcomingSessions?.length > 0 ? (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">{t('dashboard.tutor.upcomingSessions')}</h2>
                <button 
                  className="text-primary-500 text-sm"
                  onClick={() => navigate('/sessions')}
                >
                  {t('dashboard.tutor.seeAll')}
                </button>
              </div>
              <div className="space-y-4">
                {stats.upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    id={session.id}
                    petName={session.pet?.name}
                    trainerName={session.trainer?.name}
                    date={session.date}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status="Scheduled"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-center py-8">
                <i className="fas fa-calendar-times text-gray-300 text-4xl mb-4"></i>
                <p className="text-gray-500 mb-4">{t('dashboard.tutor.noSessions')}</p>
                <button 
                  className="bg-primary-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  onClick={() => navigate('/sessions')}
                >
                  <i className="fas fa-plus mr-2"></i>{t('dashboard.tutor.scheduleSession')}
                </button>
              </div>
            </div>
          )}

          {/* Package Status */}
          {stats.remainingSessions?.byPackage?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">{t('dashboard.tutor.myPackages')}</h2>
                <button 
                  className="text-primary-500 text-sm"
                  onClick={() => navigate('/packages')}
                >
                  {t('dashboard.tutor.seeAll')}
                </button>
              </div>
              <div className="space-y-3">
                {stats.remainingSessions.byPackage.map((pkg, index) => (
                  <PackageProgress
                    key={index}
                    packageName={pkg.packageName}
                    usedSessions={pkg.usedSessions}
                    total={pkg.total}
                    remaining={pkg.remaining}
                  />
                ))}
              </div>
            </div>
          )}

          {/* My Pets */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">{t('dashboard.tutor.myPets')}</h2>
              <button 
                className="text-primary-500 text-sm"
                onClick={() => navigate('/pets/new')}
              >
                {t('dashboard.tutor.addPet')}
              </button>
            </div>
            {(stats.totalPets || 0) > 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-paw text-primary-500 text-4xl mb-4"></i>
                <p className="text-gray-600 mb-4">{stats.totalPets} {t('dashboard.tutor.petsRegistered')}</p>
                <button
                  className="bg-primary-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  onClick={() => navigate('/tutor/pets')}
                >
                  <i className="fas fa-eye mr-2"></i>{t('dashboard.tutor.viewMyPets')}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-paw text-gray-300 text-4xl mb-4"></i>
                <p className="text-gray-500 mb-4">{t('dashboard.tutor.noPetsRegistered')}</p>
                <button 
                  className="bg-primary-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  onClick={() => navigate('/pets/new')}
                >
                  <i className="fas fa-plus mr-2"></i>{t('dashboard.tutor.registerFirstPet')}
                </button>
              </div>
            )}
          </div>
        </main>
      ) : null}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="tutor"
        activeRoute="home"
      />
    </div>
  );
}