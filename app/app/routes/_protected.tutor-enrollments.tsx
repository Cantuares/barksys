import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useEnrollmentStore } from '../lib/stores/enrollments.store';
import { useAuth } from '../lib/hooks/useAuth';
import type { Enrollment } from '../types/enrollment.types';
import { UserRole } from '../types/auth.types';

// Components
import { TutorLayout } from '../components/layout/TutorLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { RefreshCw, CheckCircle, XCircle, Calendar, Clock, Package, UserCircle, Plus } from 'lucide-react';

export default function TutorEnrollmentsPage() {
  useRequireAuth([UserRole.TUTOR]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments, isLoading, error, fetchEnrollments, cancelEnrollment } = useEnrollmentStore();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    if (user?.id) {
      await fetchEnrollments({ tutorId: user.id });
    }
  };

  // Group enrollments by status
  const activeEnrollments = useMemo(() =>
    enrollments.filter(e => e.status === 'confirmed'),
    [enrollments]
  );

  const cancelledEnrollments = useMemo(() =>
    enrollments.filter(e => e.status === 'cancelled'),
    [enrollments]
  );

  const canCancelEnrollment = (enrollment: Enrollment): boolean => {
    if (enrollment.status !== 'confirmed') return false;

    const session = enrollment.trainingSession;
    if (!session) return false;

    const sessionDate = new Date(`${session.date}T${session.startTime}`);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Allow cancellation up to 24 hours before the session
    return hoursUntilSession > 24;
  };

  const onCancelEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowCancelConfirm(true);
  };

  const onConfirmCancel = async () => {
    if (!selectedEnrollment) return;

    try {
      await cancelEnrollment(selectedEnrollment.id);
      setShowCancelConfirm(false);
      setSelectedEnrollment(null);
      loadEnrollments();
    } catch (error: any) {
      alert(error.message || 'Erro ao cancelar inscrição');
    }
  };

  if (isLoading && enrollments.length === 0) {
    return (
      <TutorLayout title="Minhas Inscrições" subtitle="Gerir inscrições em sessões">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </TutorLayout>
    );
  }

  if (error) {
    return (
      <TutorLayout title="Minhas Inscrições" subtitle="Gerir inscrições em sessões">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
          <p className="text-red-800 font-medium mb-2">Erro ao carregar inscrições</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="primary" onClick={loadEnrollments}>
            Tentar Novamente
          </Button>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Minhas Inscrições"
      subtitle="Gerir inscrições em sessões"
      headerAction={
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={loadEnrollments}
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Ativas</div>
                <div className="text-xl font-bold text-green-600">{activeEnrollments.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Canceladas</div>
                <div className="text-xl font-bold text-gray-600">{cancelledEnrollments.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Enrollments */}
        {activeEnrollments.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">Inscrições Ativas</h2>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {activeEnrollments.length} ativa{activeEnrollments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {activeEnrollments.map(enrollment => (
                <div key={enrollment.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <i className="fas fa-paw text-green-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {enrollment.pet?.name || 'Pet'}
                          </h3>
                          {enrollment.pet?.breed && (
                            <p className="text-sm text-gray-600">{enrollment.pet.breed}</p>
                          )}
                        </div>
                      </div>

                      {enrollment.trainingSession && (
                        <div className="ml-11 space-y-1">
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{new Date(enrollment.trainingSession.date).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{enrollment.trainingSession.startTime} - {enrollment.trainingSession.endTime}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      {canCancelEnrollment(enrollment) ? (
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition-colors mb-2"
                          onClick={() => onCancelEnrollment(enrollment)}
                        >
                          <i className="fas fa-times mr-1"></i>Cancelar
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs mb-2">
                          Não cancelável
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Inscrito em {new Date(enrollment.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Enrollments */}
        {cancelledEnrollments.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">Inscrições Canceladas</h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {cancelledEnrollments.length} cancelada{cancelledEnrollments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {cancelledEnrollments.map(enrollment => (
                <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <i className="fas fa-paw text-gray-500"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">
                            {enrollment.pet?.name || 'Pet'}
                          </h3>
                          {enrollment.pet?.breed && (
                            <p className="text-sm text-gray-500">{enrollment.pet.breed}</p>
                          )}
                        </div>
                      </div>

                      {enrollment.trainingSession && (
                        <div className="ml-11 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{new Date(enrollment.trainingSession.date).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{enrollment.trainingSession.startTime} - {enrollment.trainingSession.endTime}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs mb-2">
                        <i className="fas fa-times mr-1"></i>Cancelada
                      </span>
                      <span className="text-xs text-gray-500">
                        Inscrito em {new Date(enrollment.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeEnrollments.length === 0 && cancelledEnrollments.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <i className="fas fa-clipboard-list text-gray-300 text-6xl mb-4"></i>
            <h3 className="font-bold text-lg text-gray-700 mb-2">Nenhuma inscrição encontrada</h3>
            <p className="text-gray-500 mb-6">Você ainda não se inscreveu em nenhuma sessão de treino.</p>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              onClick={() => navigate('/tutor/sessions')}
            >
              <Plus className="w-5 h-5 inline mr-2" />Explorar Sessões
            </button>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Cancelar Inscrição</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja cancelar esta inscrição?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-left">
                <div className="font-medium text-gray-900 mb-1">Esta ação não pode ser desfeita.</div>
              </div>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setSelectedEnrollment(null);
                  }}
                >
                  Manter Inscrição
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                  onClick={onConfirmCancel}
                >
                  {isLoading && <i className="fas fa-spinner fa-spin mr-2"></i>}
                  Sim, Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </TutorLayout>
  );
}
