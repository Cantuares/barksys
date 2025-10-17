import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useAuth } from '../lib/hooks/useAuth';
import { useTrainerAvailabilityStore } from '../lib/stores/trainer-availability.store';
import type { WorkingDays } from '../types/trainer-availability.types';
import { UserRole } from '../types/auth.types';

// Components
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calendar, Clock, Save, Plus, Trash2 } from 'lucide-react';

export default function TrainerAvailabilityPage() {
  useRequireAuth([UserRole.TRAINER]);

  const { user } = useAuth();
  const {
    config,
    exceptions,
    isLoading,
    error,
    fetchConfig,
    createConfig,
    updateConfig,
    fetchExceptions,
    createException,
    deleteException,
  } = useTrainerAvailabilityStore();

  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [lunchBreakStart, setLunchBreakStart] = useState('');
  const [lunchBreakEnd, setLunchBreakEnd] = useState('');
  const [workingDays, setWorkingDays] = useState<WorkingDays>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadConfig();
      loadExceptions();
    }
  }, [user]);

  useEffect(() => {
    if (config) {
      setWorkStartTime(config.workStartTime);
      setWorkEndTime(config.workEndTime);
      setSlotDurationMinutes(config.slotDurationMinutes);
      setLunchBreakStart(config.lunchBreakStart || '');
      setLunchBreakEnd(config.lunchBreakEnd || '');
      setWorkingDays(config.workingDays);
    }
  }, [config]);

  const loadConfig = async () => {
    if (user?.id) {
      await fetchConfig(user.id);
    }
  };

  const loadExceptions = async () => {
    if (user?.id) {
      await fetchExceptions(user.id);
    }
  };

  const handleSaveConfig = async () => {
    if (!user?.id) return;

    const data = {
      workStartTime,
      workEndTime,
      slotDurationMinutes,
      lunchBreakStart: lunchBreakStart || undefined,
      lunchBreakEnd: lunchBreakEnd || undefined,
      workingDays,
    };

    try {
      if (config) {
        await updateConfig(user.id, data);
      } else {
        await createConfig(user.id, data);
      }
      alert('Configuração salva com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configuração');
    }
  };

  const handleAddException = async () => {
    if (!user?.id || !exceptionDate || !exceptionReason) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      await createException(user.id, {
        date: exceptionDate,
        reason: exceptionReason,
        allDay: true,
      });
      setExceptionDate('');
      setExceptionReason('');
    } catch (error) {
      alert('Erro ao adicionar exceção');
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    if (!user?.id || !confirm('Tem certeza que deseja apagar esta exceção?')) return;

    try {
      await deleteException(user.id, exceptionId);
    } catch (error) {
      alert('Erro ao apagar exceção');
    }
  };

  const toggleDay = (day: keyof WorkingDays) => {
    setWorkingDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const weekDays: Array<{ key: keyof WorkingDays; label: string }> = [
    { key: 'monday', label: 'Segunda' },
    { key: 'tuesday', label: 'Terça' },
    { key: 'wednesday', label: 'Quarta' },
    { key: 'thursday', label: 'Quinta' },
    { key: 'friday', label: 'Sexta' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  if (isLoading && !config) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header title="Disponibilidade" subtitle="Gerir horários de trabalho" />
        <main className="p-4 flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header title="Disponibilidade" subtitle="Gerir horários de trabalho" />

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Working Hours */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            Horário de Trabalho
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Início
                </label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fim
                </label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração das Sessões (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pausa Almoço (Início)
                </label>
                <input
                  type="time"
                  value={lunchBreakStart}
                  onChange={(e) => setLunchBreakStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pausa Almoço (Fim)
                </label>
                <input
                  type="time"
                  value={lunchBreakEnd}
                  onChange={(e) => setLunchBreakEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-500" />
            Dias de Trabalho
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
            {weekDays.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  workingDays[key]
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <div className="text-xs font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSaveConfig}
          loading={isLoading}
        >
          <Save className="w-5 h-5 mr-2" />
          Salvar Configuração
        </Button>

        {/* Exceptions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Exceções (Feriados/Ausências)</h2>

          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <input
                  type="text"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder="Ex: Feriado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleAddException}
              disabled={!exceptionDate || !exceptionReason}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Exceção
            </Button>
          </div>

          {exceptions.length > 0 && (
            <div className="space-y-2">
              {exceptions.map(exception => (
                <div
                  key={exception.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(exception.date).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-sm text-gray-600">{exception.reason}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteException(exception.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
