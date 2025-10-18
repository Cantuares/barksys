import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CalendarCheck, Dog, CalendarPlus, ClipboardList, Package, CalendarX, Eye, Plus } from 'lucide-react';
import { TutorLayout } from '../components/layout/TutorLayout';
import { StatsCard } from '../components/ui/StatsCard';
import { WelcomeBanner } from '../components/ui/WelcomeBanner';
import { QuickActions } from '../components/ui/QuickActions';
import { SessionCard } from '../components/ui/SessionCard';
import { PackageProgress } from '../components/ui/PackageProgress';
import { Button } from '../components/ui/Button';
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: CalendarPlus,
      label: t('dashboard.tutor.scheduleSession'),
      iconBgColor: 'bg-green-500',
      hoverBgColor: 'bg-green-50 hover:bg-green-100',
      onClick: () => navigate('/tutor/sessions')
    },
    {
      icon: ClipboardList,
      label: t('dashboard.tutor.myEnrollments'),
      iconBgColor: 'bg-purple-500',
      hoverBgColor: 'bg-purple-50 hover:bg-purple-100',
      onClick: () => navigate('/tutor/enrollments')
    },
    {
      icon: Dog,
      label: t('dashboard.tutor.myPets'),
      iconBgColor: 'bg-green-500',
      hoverBgColor: 'bg-green-50 hover:bg-green-100',
      onClick: () => navigate('/tutor/pets')
    },
    {
      icon: Package,
      label: t('dashboard.tutor.packages'),
      iconBgColor: 'bg-orange-500',
      hoverBgColor: 'bg-orange-50 hover:bg-orange-100',
      onClick: () => navigate('/tutor/packages')
    }
  ];

  return (
    <TutorLayout
      title="BarkSys"
      subtitle={`${t('dashboard.tutor.title')} - ${user?.fullName || 'Tutor'}!`}
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('dashboard.common.loading')}</p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
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
      ) : stats ? (
        /* Main Content */
        <div className="space-y-6">
          {/* Welcome Banner */}
          <WelcomeBanner
            title={t('dashboard.tutor.title')}
            description={t('dashboard.tutor.subtitle')}
            buttonText={stats.upcomingSessions?.length ?
              t('dashboard.tutor.seeUpcomingSessions') :
              t('dashboard.tutor.scheduleFirstSession')
            }
            onButtonClick={() => navigate('/tutor/sessions')}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              data={{
                label: t('dashboard.tutor.remainingSessions'),
                value: stats.remainingSessions?.total || 0,
                icon: CalendarCheck,
                iconColor: 'text-green-600',
                iconBgColor: 'bg-green-100',
                subtitle: stats.remainingSessions?.byPackage?.length ?
                  stats.remainingSessions.byPackage[0]?.packageName :
                  undefined,
                subtitleColor: 'text-green-600'
              }}
            />

            <StatsCard
              data={{
                label: t('dashboard.tutor.totalPets'),
                value: stats.totalPets || 0,
                icon: Dog,
                iconColor: 'text-green-600',
                iconBgColor: 'bg-green-100',
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
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('dashboard.tutor.upcomingSessions')}</h2>
                <button
                  className="inline-block text-sm font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors py-2 px-1"
                  onClick={() => navigate('/tutor/sessions')}
                >
                  {t('dashboard.tutor.seeAll')}
                </button>
              </div>
              <div className="space-y-4">
                {stats.upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={{
                      ...session,
                      date: session.date instanceof Date ? session.date.toISOString().split('T')[0] : session.date,
                      status: session.status as any,
                    }}
                    onViewDetails={() => navigate(`/tutor/sessions/${session.id}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <CalendarX className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base text-gray-600 mb-6">{t('dashboard.tutor.noSessions')}</p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/tutor/sessions')}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('dashboard.tutor.scheduleSession')}
                </Button>
              </div>
            </div>
          )}

          {/* Package Status */}
          {stats.remainingSessions?.byPackage?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('dashboard.tutor.myPackages')}</h2>
                <button
                  className="inline-block text-sm font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors py-2 px-1"
                  onClick={() => navigate('/tutor/packages')}
                >
                  {t('dashboard.tutor.seeAll')}
                </button>
              </div>
              <div className="space-y-4">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('dashboard.tutor.myPets')}</h2>
              <button
                className="inline-block text-sm font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors py-2 px-1"
                onClick={() => navigate('/tutor/pets/new')}
              >
                {t('dashboard.tutor.addPet')}
              </button>
            </div>
            {(stats.totalPets || 0) > 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Dog className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-base text-gray-700 mb-6">{stats.totalPets} {t('dashboard.tutor.petsRegistered')}</p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/tutor/pets')}
                  className="inline-flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {t('dashboard.tutor.viewMyPets')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Dog className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base text-gray-600 mb-6">{t('dashboard.tutor.noPetsRegistered')}</p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/tutor/pets/new')}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('dashboard.tutor.registerFirstPet')}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </TutorLayout>
  );
}