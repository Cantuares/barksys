import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { 
  usePet, 
  calculateAge, 
  getSpeciesLabel, 
  getStatusLabel, 
  getStatusColor,
  getSessionStatusLabel,
  getSessionStatusColor
} from '../lib/hooks/usePets';
import { UserRole } from '../types/auth.types';

export default function TutorPetDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const petId = id || '';
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { pet, petSessions, isLoading, sessionsLoading, error } = usePet(petId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const goBack = () => {
    navigate('/tutor/pets');
  };

  const onEdit = () => {
    navigate(`/tutor/pets/${petId}/edit`);
  };

  const onDelete = () => {
    setShowDeleteConfirm(true);
  };

  const onCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const onConfirmDelete = async () => {
    // TODO: Implement delete functionality
    console.log('Delete pet:', petId);
    setShowDeleteConfirm(false);
    navigate('/tutor/pets');
  };

  const getSessionDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header 
        title={pet?.name || t('dashboard.tutor.petDetails')}
        subtitle={t('dashboard.tutor.petInformation')}
        showBackButton
        onBackClick={goBack}
      />

      {/* Loading State */}
      {isLoading && !pet ? (
        <main className="p-4 space-y-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('dashboard.tutor.loadingDetails')}</p>
          </div>
        </main>
      ) : error ? (
        /* Error State */
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
            <p className="text-red-800 font-medium mb-2">{t('dashboard.tutor.errorLoadingDetails')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              onClick={goBack}
            >
              {t('dashboard.tutor.back')}
            </button>
          </div>
        </main>
      ) : pet ? (
        /* Main Content */
        <main className="p-4 space-y-6">
          {/* Pet Header Card */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center mr-4">
                  <i className="fas fa-paw text-gray-400 text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h1 className="font-bold text-2xl text-gray-900 mb-1">{pet.name}</h1>
                  <p className="text-gray-600 mb-2">{pet.breed || getSpeciesLabel(pet.species)}</p>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(pet.status)}`}>
                    {getStatusLabel(pet.status)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
                  onClick={onEdit}
                >
                  <i className="fas fa-edit mr-2"></i>{t('dashboard.tutor.edit')}
                </button>
                <button 
                  className="px-6 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
                  onClick={onDelete}
                >
                  <i className="fas fa-trash mr-2"></i>{t('dashboard.tutor.delete')}
                </button>
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">{t('dashboard.tutor.basicInformation')}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-blue-600 text-sm font-medium mb-1">{t('dashboard.tutor.species')}</div>
                <div className="font-bold text-gray-900">{getSpeciesLabel(pet.species)}</div>
              </div>
              
              {pet.breed && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium mb-1">{t('dashboard.tutor.breed')}</div>
                  <div className="font-bold text-gray-900">{pet.breed}</div>
                </div>
              )}
              
              {pet.weight && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium mb-1">{t('dashboard.tutor.weight')}</div>
                  <div className="font-bold text-gray-900">{pet.weight} kg</div>
                </div>
              )}
              
              {pet.birth && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 text-sm font-medium mb-1">{t('dashboard.tutor.age')}</div>
                  <div className="font-bold text-gray-900">{calculateAge(pet.birth)}</div>
                </div>
              )}
            </div>

            {/* Registration Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('dashboard.tutor.registeredOn')}:</span>
                  <div className="font-medium">{new Date(pet.createdAt).toLocaleString('pt-PT')}</div>
                </div>
                <div>
                  <span className="text-gray-500">{t('dashboard.tutor.lastUpdate')}:</span>
                  <div className="font-medium">{new Date(pet.updatedAt).toLocaleString('pt-PT')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          {pet.description && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-3">{t('dashboard.tutor.petObservations')}</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{pet.description}</p>
              </div>
            </div>
          )}

          {/* Training History */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">{t('dashboard.tutor.trainingHistory')}</h2>
              {petSessions.length > 0 && (
                <span className="text-sm text-gray-500">{petSessions.length} {t('dashboard.tutor.sessionsCount')}</span>
              )}
            </div>

            {sessionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">{t('dashboard.tutor.loadingHistory')}</p>
              </div>
            ) : petSessions.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-calendar-alt text-gray-300 text-3xl mb-3"></i>
                <p className="text-gray-500 mb-4">{t('dashboard.tutor.noSessionsFound')}</p>
                <p className="text-sm text-gray-400">{t('dashboard.tutor.sessionsWillAppear')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {petSessions.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {typeof enrollment.session === 'object' 
                            ? `${t('dashboard.tutor.sessionOf')} ${getSessionDate(enrollment.session.date)}`
                            : t('dashboard.tutor.session')
                          }
                        </h3>
                        {typeof enrollment.session === 'object' && (
                          <>
                            <p className="text-sm text-gray-600">
                              {enrollment.session.startTime} - {enrollment.session.endTime}
                            </p>
                            {typeof enrollment.session.trainer === 'object' && (
                              <p className="text-sm text-gray-500">
                                Treinador: {enrollment.session.trainer.name}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getSessionStatusColor(enrollment.status)}`}>
                        {getSessionStatusLabel(enrollment.status)}
                      </span>
                    </div>
                    
                    {typeof enrollment.session === 'object' && typeof enrollment.session.package === 'object' && (
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <i className="fas fa-box mr-2"></i>
                        <span>{enrollment.session.package.name}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {t('dashboard.tutor.enrolledOn')}: {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      ) : null}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{t('dashboard.tutor.confirmDeletion')}</h3>
              <p className="text-gray-600 mb-6">
                {t('dashboard.tutor.deletePetConfirm')} <strong>{pet?.name}</strong>? {t('dashboard.tutor.actionCannotBeUndone')}
              </p>
              <div className="flex space-x-3">
                <button 
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  onClick={onCancelDelete}
                >
                  {t('dashboard.tutor.cancel')}
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  onClick={onConfirmDelete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : null}
                  {t('dashboard.tutor.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="tutor"
        activeRoute="pets"
      />
    </div>
  );
}
