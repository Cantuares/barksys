import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usePets, calculateAge, getSpeciesLabel, getStatusLabel, getStatusColor } from '../lib/hooks/usePets';
import { UserRole } from '../types/auth.types';

export default function TutorPetsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { pets, isLoading, error, loadPets } = usePets();
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

  const activePets = pets.filter(pet => pet.status === 'active');
  const inactivePets = pets.filter(pet => pet.status === 'inactive');

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header 
        title={t('dashboard.tutor.myPets')}
        subtitle={t('dashboard.tutor.subtitle')}
      />

      {/* Loading State */}
      {isLoading ? (
        <main className="p-4 space-y-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('dashboard.tutor.loadingPets')}</p>
          </div>
        </main>
      ) : error ? (
        /* Error State */
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
            <p className="text-red-800 font-medium mb-2">{t('dashboard.tutor.errorLoadingPets')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              onClick={loadPets}
            >
              Tentar Novamente
            </button>
          </div>
        </main>
      ) : (
        /* Main Content */
        <main className="p-4 space-y-6">
          {/* Add Pet Button */}
          <div className="bg-white rounded-xl shadow p-4">
            <button
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition"
              onClick={() => navigate('/tutor/pets/new')}
            >
              <i className="fas fa-plus text-gray-400"></i>
              <span>{t('dashboard.tutor.addNewPet')}</span>
            </button>
          </div>

          {/* Empty State */}
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow p-8">
                <i className="fas fa-paw text-gray-400 text-4xl mb-4"></i>
                <h3 className="font-bold text-lg text-gray-600 mb-2">{t('dashboard.tutor.noPetsRegistered')}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('dashboard.tutor.sessionsWillAppear')}
                </p>
                <button 
                  className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  onClick={() => navigate('/tutor/pets/new')}
                >
                  <i className="fas fa-plus mr-2"></i>{t('dashboard.tutor.registerFirstPet')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Pets */}
              {activePets.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-gray-800">{t('dashboard.tutor.activePets')}</h2>
                  {activePets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-xl shadow overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                            <i className="fas fa-paw text-gray-400 text-xl"></i>
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <p className="text-gray-500">{pet.breed || getSpeciesLabel(pet.species)}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(pet.status)}`}>
                                {getStatusLabel(pet.status)}
                              </span>
                              {pet.birth && (
                                <span className="ml-2 text-xs text-gray-500">{calculateAge(pet.birth)}</span>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600"
                              onClick={() => navigate(`/tutor/pets/${pet.id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-blue-500 text-sm">{t('dashboard.tutor.weight')}</div>
                            <div className="font-bold">{pet.weight ? `${pet.weight} kg` : 'N/A'}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-blue-500 text-sm">{t('dashboard.tutor.registeredOn')}</div>
                            <div className="font-bold">{new Date(pet.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}</div>
                          </div>
                        </div>
                        
                        {pet.description && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.tutor.petObservations')}</h4>
                            <p className="text-sm text-gray-600">{pet.description}</p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <button 
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition"
                            onClick={() => navigate(`/tutor/pets/${pet.id}`)}
                          >
                            Ver Detalhes
                          </button>
                          <button 
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition"
                            onClick={() => navigate(`/tutor/pets/${pet.id}/edit`)}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inactive Pets */}
              {inactivePets.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-gray-800">{t('dashboard.tutor.inactivePets')}</h2>
                  {inactivePets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-xl shadow overflow-hidden opacity-75">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                            <i className="fas fa-paw text-gray-400 text-xl"></i>
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <p className="text-gray-500">{pet.breed || getSpeciesLabel(pet.species)}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(pet.status)}`}>
                                {getStatusLabel(pet.status)}
                              </span>
                              {pet.birth && (
                                <span className="ml-2 text-xs text-gray-500">{calculateAge(pet.birth)}</span>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600"
                              onClick={() => navigate(`/tutor/pets/${pet.id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex space-x-2">
                          <button 
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition"
                            onClick={() => navigate(`/tutor/pets/${pet.id}`)}
                          >
                            Ver Detalhes
                          </button>
                          <button 
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition"
                            onClick={() => navigate(`/tutor/pets/${pet.id}/edit`)}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="tutor"
        activeRoute="pets"
      />
    </div>
  );
}
