import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useTrainingSessionStore } from '../lib/stores/training-sessions.store';
import { useEnrollmentStore } from '../lib/stores/enrollments.store';
import { useAuth } from '../lib/hooks/useAuth';
import { trainingSessionsApi } from '../lib/api/training-sessions.api';
import { petsApi } from '../lib/api/pets.api';
import type { Pet } from '../types/pet.types';
import type { Enrollment } from '../types/enrollment.types';
import { UserRole } from '../types/auth.types';

// Components
import { TutorLayout } from '../components/layout/TutorLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, Users, MapPin, User, Package, Plus, CheckCircle } from 'lucide-react';

export default function SessionDetailPage() {
  useRequireAuth([UserRole.TUTOR]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSession, isLoading, error, fetchSessionById } = useTrainingSessionStore();
  const { createEnrollment, isLoading: enrollmentLoading } = useEnrollmentStore();

  const [sessionEnrollments, setSessionEnrollments] = useState<any[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (id) {
      loadSessionDetails();
      loadPets();
    }
  }, [id]);

  const loadSessionDetails = async () => {
    if (!id) return;

    await fetchSessionById(id);

    try {
      const enrollments = await trainingSessionsApi.getSessionEnrollments(id);
      setSessionEnrollments(enrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const loadPets = async () => {
    try {
      const response = await petsApi.getPets();
      setPets(response.docs || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const isEnrolled = () => {
    return sessionEnrollments.some(e =>
      pets.some(p => e.petId === p.id) && e.status !== 'cancelled'
    );
  };

  const getEnrolledPets = () => {
    return sessionEnrollments
      .filter(e => e.status !== 'cancelled' && pets.some(p => p.id === e.petId))
      .map(e => pets.find(p => p.id === e.petId))
      .filter(Boolean);
  };

  const getActiveEnrollments = () => {
    return sessionEnrollments.filter(e => e.status !== 'cancelled');
  };

  const onPetSelect = (pet: Pet) => {
    const petIndex = selectedPets.findIndex(p => p.id === pet.id);
    if (petIndex >= 0) {
      setSelectedPets(selectedPets.filter(p => p.id !== pet.id));
    } else {
      setSelectedPets([...selectedPets, pet]);
    }
  };

  const handleEnroll = async () => {
    if (!currentSession || selectedPets.length === 0 || !user?.id) return;

    try {
      for (const pet of selectedPets) {
        await createEnrollment({
          trainingSessionId: currentSession.id,
          tutorId: user.id,
          petId: pet.id,
        });
      }

      setShowEnrollModal(false);
      setSelectedPets([]);
      loadSessionDetails();
    } catch (error: any) {
      alert(error.message || 'Erro ao inscrever pets');
    }
  };

  if (isLoading || !currentSession) {
    return (
      <TutorLayout title="Detalhes da Sessão" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </TutorLayout>
    );
  }

  if (error) {
    return (
      <TutorLayout title="Detalhes da Sessão" showBackButton>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium mb-2">Erro ao carregar sessão</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="primary" onClick={() => navigate('/tutor/sessions')}>
            Voltar para Sessões
          </Button>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Detalhes da Sessão"
      showBackButton
      onBackClick={() => navigate('/tutor/sessions')}
    >
      <div className="space-y-6">
        {/* Session Info Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentSession.package?.name || 'Sessão de Treino'}
              </h2>
              {currentSession.package?.description && (
                <p className="text-gray-600">{currentSession.package.description}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentSession.status === 'active' ? 'bg-green-100 text-green-800' :
              currentSession.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentSession.status === 'active' ? 'Ativa' :
               currentSession.status === 'scheduled' ? 'Agendada' : currentSession.status}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-green-500" />
              <span className="font-medium">
                {new Date(currentSession.date).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-3 text-green-500" />
              <span className="font-medium">{currentSession.startTime} - {currentSession.endTime}</span>
            </div>

            {currentSession.trainer && (
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-green-500" />
                <span className="font-medium">Trainer: {currentSession.trainer.fullName}</span>
              </div>
            )}

            <div className="flex items-center text-gray-700">
              <Users className="w-5 h-5 mr-3 text-green-500" />
              <span className="font-medium">
                {currentSession.maxParticipants - currentSession.availableSlots}/{currentSession.maxParticipants} vagas ocupadas
              </span>
            </div>
          </div>

          {/* Availability Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Disponibilidade</span>
              <span className="font-medium">{currentSession.availableSlots} vagas livres</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  currentSession.availableSlots === 0 ? 'bg-red-500' :
                  currentSession.availableSlots <= 2 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${(currentSession.availableSlots / currentSession.maxParticipants) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enrolled Pets */}
        {getEnrolledPets().length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Meus Pets Inscritos</h3>
            <div className="space-y-2">
              {getEnrolledPets().map(pet => pet && (
                <div key={pet.id} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <i className="fas fa-paw text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{pet.name}</h4>
                    <p className="text-sm text-gray-600">{pet.breed || pet.species}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants List */}
        {getActiveEnrollments().length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              Participantes ({getActiveEnrollments().length})
            </h3>
            <div className="space-y-2">
              {getActiveEnrollments().map((enrollment, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    <i className="fas fa-paw text-gray-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Pet inscrito</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enroll Button */}
        {!isEnrolled() && currentSession.availableSlots > 0 && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowEnrollModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Inscrever Meus Pets
          </Button>
        )}

        {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Inscrever Pets</h3>

            <div className="space-y-2 mb-6">
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => onPetSelect(pet)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedPets.some(p => p.id === pet.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <i className="fas fa-paw text-green-600"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{pet.name}</h4>
                      <p className="text-sm text-gray-600">{pet.breed || pet.species}</p>
                    </div>
                    {selectedPets.some(p => p.id === pet.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedPets([]);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleEnroll}
                loading={enrollmentLoading}
                disabled={selectedPets.length === 0}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </TutorLayout>
  );
}
