import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { useAuth } from '../lib/hooks/useAuth';
import { useTemplateStore } from '../lib/stores/templates.store';
import { packagesApi } from '../lib/api/packages.api';
import type { Package } from '../types/package.types';
import { Recurrence, Weekday } from '../types/template.types';
import { UserRole } from '../types/auth.types';

// Components
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, Clock, RefreshCw, Trash2, Play } from 'lucide-react';

export default function TrainerTemplatesPage() {
  useRequireAuth([UserRole.TRAINER]);

  const { user } = useAuth();
  const {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    generateSessions,
  } = useTemplateStore();

  const [packages, setPackages] = useState<Package[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Form state
  const [packageId, setPackageId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.WEEKLY);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [templateStartDate, setTemplateStartDate] = useState('');
  const [templateEndDate, setTemplateEndDate] = useState('');

  // Generate form state
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generateEndDate, setGenerateEndDate] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadTemplates();
      loadPackages();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (user?.id) {
      await fetchTemplates({ trainerId: user.id });
    }
  };

  const loadPackages = async () => {
    try {
      const response = await packagesApi.getPackages();
      setPackages(response.docs || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const weekDays: Array<{ value: Weekday; label: string }> = [
    { value: Weekday.MONDAY, label: 'Seg' },
    { value: Weekday.TUESDAY, label: 'Ter' },
    { value: Weekday.WEDNESDAY, label: 'Qua' },
    { value: Weekday.THURSDAY, label: 'Qui' },
    { value: Weekday.FRIDAY, label: 'Sex' },
    { value: Weekday.SATURDAY, label: 'Sáb' },
    { value: Weekday.SUNDAY, label: 'Dom' },
  ];

  const toggleDay = (day: Weekday) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreateTemplate = async () => {
    if (!user?.id || !packageId || selectedDays.length === 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createTemplate({
        packageId,
        trainerId: user.id,
        startTime,
        endTime,
        maxParticipants,
        recurrence,
        weekdays: selectedDays,
        startDate: templateStartDate,
        endDate: templateEndDate,
      });

      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      alert('Erro ao criar template');
    }
  };

  const handleGenerateSessions = async () => {
    if (!user?.id || !selectedTemplateId || !generateStartDate || !generateEndDate) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      await generateSessions(user.id, {
        templateId: selectedTemplateId,
        startDate: generateStartDate,
        endDate: generateEndDate,
      });

      alert('Sessões geradas com sucesso!');
      setShowGenerateModal(false);
      setSelectedTemplateId('');
      setGenerateStartDate('');
      setGenerateEndDate('');
    } catch (error) {
      alert('Erro ao gerar sessões');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja apagar este template?')) return;

    try {
      await deleteTemplate(templateId);
    } catch (error) {
      alert('Erro ao apagar template');
    }
  };

  const resetForm = () => {
    setPackageId('');
    setStartTime('09:00');
    setEndTime('10:00');
    setMaxParticipants(5);
    setRecurrence(Recurrence.WEEKLY);
    setSelectedDays([]);
    setTemplateStartDate('');
    setTemplateEndDate('');
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header title="Templates" subtitle="Gerir templates de sessões" />
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
      <Header title="Templates" subtitle="Gerir templates de sessões">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={loadTemplates}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </Header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {templates.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-700 mb-2">Nenhum template criado</h3>
            <p className="text-gray-500 mb-6">Crie templates para gerar sessões recorrentes automaticamente.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Template
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {template.package?.name || 'Package'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.recurrence === 'DAILY' && 'Diário'}
                      {template.recurrence === 'WEEKLY' && 'Semanal'}
                      {template.recurrence === 'BIWEEKLY' && 'Quinzenal'}
                      {template.recurrence === 'MONTHLY' && 'Mensal'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    template.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-green-500" />
                    {template.startTime} - {template.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    {template.maxParticipants} participantes
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.weekdays.map(day => (
                    <span key={day} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {day === 'monday' && 'Seg'}
                      {day === 'tuesday' && 'Ter'}
                      {day === 'wednesday' && 'Qua'}
                      {day === 'thursday' && 'Qui'}
                      {day === 'friday' && 'Sex'}
                      {day === 'saturday' && 'Sáb'}
                      {day === 'sunday' && 'Dom'}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setShowGenerateModal(true);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Gerar Sessões
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Apagar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Criar Template</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package
                </label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecionar...</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participantes Máximos
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recorrência
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="DAILY">Diário</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="BIWEEKLY">Quinzenal</option>
                  <option value="MONTHLY">Mensal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias da Semana
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => toggleDay(value)}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        selectedDays.includes(value)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={templateStartDate}
                    onChange={(e) => setTemplateStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={templateEndDate}
                    onChange={(e) => setTemplateEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTemplate}
                loading={isLoading}
                className="flex-1"
              >
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Sessions Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Gerar Sessões</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={generateStartDate}
                  onChange={(e) => setGenerateStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={generateEndDate}
                  onChange={(e) => setGenerateEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedTemplateId('');
                  setGenerateStartDate('');
                  setGenerateEndDate('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateSessions}
                loading={isLoading}
                className="flex-1"
              >
                Gerar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
