import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useTrainingSessionStore } from '../lib/stores/training-sessions.store';
import { useEnrollmentStore } from '../lib/stores/enrollments.store';
import { useAuth } from '../lib/hooks/useAuth';
import { petsApi } from '../lib/api/pets.api';
import { packagesApi } from '../lib/api/packages.api';
import type { Pet } from '../types/pet.types';
import type { TrainingSession } from '../types/training-session.types';
import type { PackagePurchase } from '../types/package.types';
import { UserRole } from '../types/auth.types';

// Components
import { TutorLayout } from '../components/layout/TutorLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Calendar } from '../components/ui/Calendar';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Clock, Users, Plus, RefreshCw, X, ShoppingCart, CheckCircle } from 'lucide-react';

export default function TutorSessionsPage() {
  useRequireAuth([UserRole.TUTOR]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, isLoading, error, fetchAvailableSessions } = useTrainingSessionStore();
  const {
    enrollments,
    createEnrollment,
    isLoading: enrollmentLoading
  } = useEnrollmentStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [selectedPetsToCancel, setSelectedPetsToCancel] = useState<Pet[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [packagePurchases, setPackagePurchases] = useState<PackagePurchase[]>([]);

  // Utility function to format date as YYYY-MM-DD (local timezone)
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadSessionsAndEnrollments();
    loadPets();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadPackagePurchases();
    }
  }, [user?.id]);

  const loadSessionsAndEnrollments = async () => {
    await fetchAvailableSessions({ limit: 50 });

    if (user?.id) {
      // Load enrollments for current user
      // This would need to be filtered by user/tutor in the store
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

  const loadPackagePurchases = async () => {
    try {
      if (user?.id) {
        const purchases = await packagesApi.getTutorPurchases(user.id);
        setPackagePurchases(purchases || []);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  // Sessions for selected date
  const sessionsForSelectedDate = useMemo(() => {
    const dateKey = formatDateKey(selectedDate);
    return sessions.filter(session => {
      const sessionDate = session.date.split('T')[0];
      return sessionDate === dateKey;
    });
  }, [sessions, selectedDate]);

  // Dates with sessions (for calendar highlighting)
  const datesWithSessions = useMemo(() => {
    return sessions.map(s => s.date.split('T')[0]);
  }, [sessions]);

  // Check if user is enrolled in session
  const isEnrolledInSession = (sessionId: string) => {
    return enrollments.some(e =>
      e.trainingSessionId === sessionId && e.status === 'confirmed'
    );
  };

  // Check if user has active package for session
  const hasPackageForSession = (session: TrainingSession) => {
    return packagePurchases.some(purchase => {
      const remainingSessions = (purchase.totalSessions || 0) - purchase.usedSessions;
      return purchase.packageId === session.packageId &&
        purchase.status === 'active' &&
        remainingSessions > 0;
    });
  };

  // Get enrolled pets for a session
  const getEnrolledPetsForSession = (sessionId: string): Pet[] => {
    const sessionEnrollments = enrollments.filter(e =>
      e.trainingSessionId === sessionId && e.status === 'confirmed'
    );

    return pets.filter(pet =>
      sessionEnrollments.some(e => e.petId === pet.id)
    );
  };

  // Pet selection for enrollment
  const onPetSelect = (pet: Pet) => {
    const petIndex = selectedPets.findIndex(p => p.id === pet.id);
    if (petIndex >= 0) {
      setSelectedPets(selectedPets.filter(p => p.id !== pet.id));
    } else {
      setSelectedPets([...selectedPets, pet]);
    }
  };

  const isPetSelected = (pet: Pet) => {
    return selectedPets.some(p => p.id === pet.id);
  };

  const isPetAlreadyEnrolledInSession = (petId: string, sessionId: string) => {
    return enrollments.some(e =>
      e.petId === petId &&
      e.trainingSessionId === sessionId &&
      e.status === 'confirmed'
    );
  };

  // Available pets for selection (not already enrolled)
  const availablePetsForSelection = useMemo(() => {
    if (!selectedSession) return pets;
    return pets.filter(pet =>
      !isPetAlreadyEnrolledInSession(pet.id, selectedSession.id)
    );
  }, [pets, selectedSession, enrollments]);

  const onEnrollClick = (session: TrainingSession) => {
    setSelectedSession(session);
    setShowEnrollConfirm(true);
  };

  const onCancelClick = (session: TrainingSession) => {
    setSelectedSession(session);
    setShowCancelConfirm(true);
  };

  const onConfirmEnroll = async () => {
    if (!selectedSession || selectedPets.length === 0 || !user?.id) return;

    try {
      // Enroll each selected pet
      for (const pet of selectedPets) {
        await createEnrollment({
          trainingSessionId: selectedSession.id,
          tutorId: user.id,
          petId: pet.id,
        });
      }

      setShowEnrollConfirm(false);
      setSelectedSession(null);
      setSelectedPets([]);
      loadSessionsAndEnrollments();
    } catch (error: any) {
      alert(error.message || 'Erro ao inscrever pets');
    }
  };

  const onConfirmCancel = async () => {
    // Implementation for cancellation
    setShowCancelConfirm(false);
    setSelectedSession(null);
    setSelectedPetsToCancel([]);
  };

  if (isLoading && sessions.length === 0) {
    return (
      <TutorLayout title="Sessões" subtitle="Visualize e inscreva-se em sessões">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">A carregar sessões...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  if (error) {
    return (
      <TutorLayout title="Sessões" subtitle="Visualize e inscreva-se em sessões">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
          <p className="text-red-800 font-medium mb-2">Erro ao carregar sessões</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button
            variant="primary"
            onClick={loadSessionsAndEnrollments}
          >
            Tentar Novamente
          </Button>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Sessões"
      subtitle="Visualize e inscreva-se em sessões"
      headerAction={
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={loadSessionsAndEnrollments}
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Calendar */}
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          highlightedDates={datesWithSessions}
        />

        {/* Selected Date Sessions */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">
              Sessões de {selectedDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={loadSessionsAndEnrollments}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {sessionsForSelectedDate.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-600 mb-2">Nenhuma sessão disponível</h3>
              <p className="text-gray-500 text-sm">
                Não há sessões agendadas para esta data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsForSelectedDate.map(session => (
                <div key={session.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-3">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-3 flex-shrink-0">
                          <i className="fas fa-dumbbell text-sm"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {session.package?.name || 'Sessão'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {session.trainer?.fullName || 'Trainer'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                          <span className="truncate">{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                          <span>{session.availableSlots}/{session.maxParticipants} vagas</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-0">
                        {isEnrolledInSession(session.id) ? (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 inline mr-1" />Inscrito
                          </span>
                        ) : session.availableSlots <= 0 ? (
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            <X className="w-3 h-3 inline mr-1" />Esgotado
                          </span>
                        ) : (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            <Plus className="w-3 h-3 inline mr-1" />Disponível
                          </span>
                        )}
                      </div>
                    </div>

                    {isEnrolledInSession(session.id) ? (
                      <button
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm transition font-medium flex-shrink-0"
                        onClick={() => onCancelClick(session)}
                      >
                        <X className="w-4 h-4 inline mr-1" />Cancelar
                      </button>
                    ) : session.availableSlots > 0 && (
                      hasPackageForSession(session) ? (
                        <button
                          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition font-medium flex-shrink-0"
                          onClick={() => onEnrollClick(session)}
                        >
                          <Plus className="w-4 h-4 inline mr-1" />Inscrever
                        </button>
                      ) : (
                        <button
                          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm transition font-medium flex-shrink-0"
                          onClick={() => navigate('/tutor/packages')}
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />Comprar Pacote
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Confirmation Modal */}
      {showEnrollConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Confirmar Inscrição</h3>
              <p className="text-gray-600 mb-4">
                Selecione qual pet participará desta sessão
              </p>
              {selectedSession && (
                <div className="text-sm text-gray-500 mb-4">
                  Data: {new Date(selectedSession.date).toLocaleDateString('pt-PT')}<br />
                  Horário: {selectedSession.startTime} - {selectedSession.endTime}
                </div>
              )}
            </div>

            {/* Pet Selection */}
            {pets.length > 0 ? (
              availablePetsForSelection.length === 0 ? (
                <div className="mb-6 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-800 mb-1">Todos os pets já estão inscritos!</h4>
                    <p className="text-sm text-green-600">Todos os seus pets já estão registados nesta sessão.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Pet(s):
                    {selectedPets.length > 0 && (
                      <span className="text-green-600 font-medium">
                        ({selectedPets.length} selecionado{selectedPets.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {pets.map(pet => {
                      const isAlreadyEnrolled = selectedSession ?
                        isPetAlreadyEnrolledInSession(pet.id, selectedSession.id) : false;

                      return (
                        <button
                          key={pet.id}
                          className={`w-full p-3 border rounded-lg text-left transition-colors ${
                            isPetSelected(pet)
                              ? 'border-green-500 bg-green-50'
                              : isAlreadyEnrolled
                                ? 'border-green-200 bg-green-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => !isAlreadyEnrolled && onPetSelect(pet)}
                          disabled={isAlreadyEnrolled}
                        >
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              isAlreadyEnrolled ? 'bg-green-100' : 'bg-green-100'
                            }`}>
                              <i className={`fas fa-paw ${isAlreadyEnrolled ? 'text-green-600' : 'text-green-600'}`}></i>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${isAlreadyEnrolled ? 'text-green-800' : 'text-gray-900'}`}>
                                {pet.name}
                              </h4>
                              <p className={`text-sm ${isAlreadyEnrolled ? 'text-green-600' : 'text-gray-500'}`}>
                                {pet.breed || pet.species}
                                {isAlreadyEnrolled && ' • Já inscrito'}
                              </p>
                            </div>
                            {isAlreadyEnrolled ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 inline mr-1" />Inscrito
                              </span>
                            ) : isPetSelected(pet) ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              <div className="mb-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl mb-2"></i>
                  <p className="text-sm text-yellow-800">
                    Você precisa ter pelo menos um pet registado para se inscrever em sessões.
                  </p>
                  <button
                    className="mt-2 text-green-600 text-sm font-medium hover:underline"
                    onClick={() => navigate('/tutor/pets/new')}
                  >
                    Registar primeiro pet
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnrollConfirm(false);
                  setSelectedSession(null);
                  setSelectedPets([]);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={onConfirmEnroll}
                loading={enrollmentLoading}
                disabled={enrollmentLoading || selectedPets.length === 0}
                className="flex-1"
              >
                {selectedPets.length > 1
                  ? `Inscrever ${selectedPets.length} Pets`
                  : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </TutorLayout>
  );
}
